const pdfParse = require("pdf-parse");
const fs = require("fs/promises");
const path = require("path");

const DocumentChunk = require("../models/DocumentChunk");
const chunkText = require("../utils/chunkText");
const { getEmbedding } = require("../utils/embedding");
const { index } = require("../config/pinecone");
const { generateAnswer } = require("../utils/ai");
const { saveChat } = require("./chatController");
const detectLanguage = require("../utils/language");
const {
  translateToEnglish,
  translateFromEnglish
} = require("../utils/translator");

const PINECONE_NAMESPACE = process.env.PINECONE_NAMESPACE || "eduassist";
const PDF_PARSE_VERSIONS = ["v2.0.550", "v1.10.100", "v1.10.88", "v1.9.426"];
const PHONE_PATTERN = /(?:\+?\d[\d\s-().]{7,}\d)/;

const safeText = (value) => {
  if (typeof value !== "string") {
    return "";
  }

  return value.replace(/\s+/g, " ").trim();
};

const buildChunkId = (title, uploadId, chunkIndex) => {
  const normalizedTitle = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48) || "document";

  return `${normalizedTitle}-${uploadId}-${chunkIndex}`;
};

const upsertVectors = async (vectors) => {
  const batchSize = 100;

  for (let i = 0; i < vectors.length; i += batchSize) {
    const batch = vectors.slice(i, i + batchSize);
    await index.namespace(PINECONE_NAMESPACE).upsert(batch);
  }
};

const extractPdfText = async (buffer) => {
  const errors = [];

  for (const version of PDF_PARSE_VERSIONS) {
    try {
      const data = await pdfParse(buffer, { version });
      const fullText = safeText(data.text);

      if (fullText) {
        return { text: fullText, version };
      }
    } catch (error) {
      errors.push(`${version}: ${error.message}`);
    }
  }

  const error = new Error(
    errors.length
      ? `Unable to extract text from PDF (${errors[errors.length - 1]})`
      : "Unable to extract text from PDF"
  );
  error.causes = errors;
  throw error;
};

const uploadPdf = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        message: "No file uploaded"
      });
    }

    const pdfBuffer = await fs.readFile(req.file.path);
    const documentId = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
    const title = req.file.originalname;
    const fileUrl = `/uploads/${req.file.filename}`;
    const docs = [];
    const vectors = [];
    let chunks = [];
    let parseWarning = "";

    try {
      const extracted = await extractPdfText(pdfBuffer);
      chunks = chunkText(extracted.text).map(safeText).filter(Boolean);

      if (chunks.length) {
        for (let i = 0; i < chunks.length; i += 1) {
          const chunk = chunks[i];
          const embedding = await getEmbedding(chunk);
          const id = buildChunkId(title, documentId, i);

          docs.push({
            title,
            fileUrl,
            documentId,
            chunk,
            embedding
          });

          vectors.push({
            id,
            values: embedding,
            metadata: {
              text: chunk,
              title,
              documentId
            }
          });
        }
      } else {
        parseWarning = "PDF uploaded, but no extractable text was found. Admin can still view and delete it.";
      }
    } catch (error) {
      parseWarning = error.message;
    }

    if (!docs.length) {
      docs.push({
        title,
        fileUrl,
        documentId,
        chunk: "",
        embedding: []
      });
    }

    await Promise.all([
      DocumentChunk.insertMany(docs),
      vectors.length ? upsertVectors(vectors) : Promise.resolve()
    ]);

    return res.status(201).json({
      message: "PDF uploaded successfully",
      chunks: chunks.length,
      fileUrl,
      title,
      warning: parseWarning || undefined
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message
    });
  }
};

const searchDocs = async (req, res) => {
  try {
    const { query } = req.body;

    if (!query || !query.trim()) {
      return res.status(400).json({
        message: "Query is required"
      });
    }

    const userLanguage = detectLanguage(query);
    const englishQuery = await translateToEnglish(query);
    const queryEmbedding = await getEmbedding(englishQuery);

    const searchResult = await index.namespace(PINECONE_NAMESPACE).query({
      vector: queryEmbedding,
      topK: 3,
      includeMetadata: true,
      includeValues: false
    });

    const matches = searchResult.matches || [];
    const bestMatch = matches[0];
    const bestTitle = bestMatch?.metadata?.title || null;
    const bestDocumentId = bestMatch?.metadata?.documentId || null;
    const relevantMatches = bestTitle
      ? matches.filter((match) => match.metadata?.title === bestTitle)
      : [];
    const context = relevantMatches
      .map((match) => match.metadata?.text)
      .filter(Boolean)
      .join("\n\n");

    if (!context) {
      return res.status(404).json({
        message: "Not found in the uploaded PDFs."
      });
    }

    let answer;

    try {
      answer = await generateAnswer(englishQuery, context);
    } catch {
      answer = "Not found in the uploaded PDFs.";
    }

    const normalizedAnswer = String(answer || "").trim();
    const finalAnswer =
      normalizedAnswer && normalizedAnswer !== "Not found in the uploaded PDFs."
        ? normalizedAnswer
        : "Not found in the uploaded PDFs.";

    const hasPhoneLeak = PHONE_PATTERN.test(finalAnswer) && !PHONE_PATTERN.test(context);
    const safeAnswer = hasPhoneLeak ? "Not found in the uploaded PDFs." : finalAnswer;

    if (userLanguage !== "en") {
      answer = await translateFromEnglish(safeAnswer, userLanguage);
    } else {
      answer = safeAnswer;
    }

    const bestDocument = bestDocumentId
      ? await DocumentChunk.findOne({ documentId: bestDocumentId }).select("fileUrl title documentId")
      : bestTitle
        ? await DocumentChunk.findOne({ title: bestTitle }).sort({ createdAt: -1 }).select("fileUrl title documentId")
        : null;

    await saveChat(
      req.user._id,
      query,
      answer,
      bestMatch?.metadata?.title || "",
      bestDocument?.fileUrl || ""
    );

    return res.json({
      answer,
      answerType: safeAnswer === "Not found in the uploaded PDFs." ? "not_found" : "contextual",
      sources: bestMatch
        ? [
            {
              id: bestMatch.id,
              score: bestMatch.score,
              title: bestMatch.metadata?.title,
              text: bestMatch.metadata?.text,
              fileUrl: bestDocument?.fileUrl || null
            }
          ]
        : []
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message
    });
  }
};

const getDocuments = async (req, res) => {
  try {
    const chunks = await DocumentChunk.find()
      .sort({ createdAt: -1 })
      .select("title fileUrl documentId createdAt");

    const seen = new Map();

    for (const chunk of chunks) {
      const deleteKey = chunk.documentId || chunk.title;

      if (!seen.has(deleteKey)) {
        seen.set(deleteKey, {
          deleteKey,
          title: chunk.title,
          fileUrl: chunk.fileUrl,
          documentId: chunk.documentId,
          chunkCount: 1,
          createdAt: chunk.createdAt
        });
      } else {
        seen.get(deleteKey).chunkCount += 1;
      }
    }

    const docs = Array.from(seen.values());

    return res.json(docs);
  } catch (error) {
    return res.status(500).json({
      message: error.message
    });
  }
};

const deleteDocument = async (req, res) => {
  try {
    const { id } = req.params;
    let doc = await DocumentChunk.findOne({ documentId: id });

    if (!doc && /^[0-9a-fA-F]{24}$/.test(id)) {
      doc = await DocumentChunk.findById(id);
    }

    if (!doc) {
      return res.status(404).json({
        message: "Document not found"
      });
    }

    const deleteFilter = doc.documentId
      ? { documentId: doc.documentId }
      : { title: doc.title };

    await DocumentChunk.deleteMany(deleteFilter);

    if (doc.fileUrl) {
      const filePath = path.join(process.cwd(), "uploads", path.basename(doc.fileUrl));
      await fs.unlink(filePath).catch(() => {});
    }
    return res.json({ message: "Document deleted successfully" });
  } catch (error) {
    console.error("deleteDocument error:", error);
    return res.status(500).json({
      message: error.message
    });
  }
};

const testPinecone = async (req, res) => {
  try {
    const { query } = req.body;

    if (!query || !query.trim()) {
      return res.status(400).json({
        message: "Query is required"
      });
    }

    const englishQuery = await translateToEnglish(query);
    const queryEmbedding = await getEmbedding(englishQuery);
    const result = await index.namespace(PINECONE_NAMESPACE).query({
      vector: queryEmbedding,
      topK: 3,
      includeMetadata: true,
      includeValues: false
    });

    return res.json({
      namespace: PINECONE_NAMESPACE,
      embeddingDimensions: queryEmbedding.length,
      matchCount: result.matches ? result.matches.length : 0,
      matches: (result.matches || []).map((match) => ({
        id: match.id,
        score: match.score,
        title: match.metadata?.title,
        text: match.metadata?.text
      }))
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message
    });
  }
};

module.exports = {
  uploadPdf,
  searchDocs,
  getDocuments,
  deleteDocument,
  testPinecone
};
