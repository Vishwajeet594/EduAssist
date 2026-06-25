const pdfParse = require("pdf-parse");
const DocumentChunk = require("../models/DocumentChunk");
const chunkText = require("../utils/chunkText");

const { saveChat } = require("./chatController");
const { generateAnswer } = require("../utils/ai");

const uploadPdf = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        message: "No file uploaded"
      });
    }

    const data = await pdfParse(req.file.buffer);

    const chunks = chunkText(data.text);

    const docs = chunks.map((chunk) => ({
      title: req.file.originalname,
      chunk
    }));

    await DocumentChunk.insertMany(docs);

    res.status(201).json({
      message: "PDF uploaded successfully",
      chunks: chunks.length
    });

  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};

const searchDocs = async (req, res) => {
  try {
    const { query } = req.body;

    const chunks = await DocumentChunk.find();

    const results = chunks.filter((doc) =>
      doc.chunk
        .toLowerCase()
        .includes(query.toLowerCase())
    );

    if (results.length === 0) {

      await saveChat(
        req.user._id,
        query,
        "No relevant information found."
      );

      return res.json({
        answer: "No relevant information found."
      });
    }

    const context = results
      .slice(0, 3)
      .map((doc) => doc.chunk)
      .join("\n\n");

    let answer;

    try {

      answer = await generateAnswer(
        query,
        context
      );

    } catch (error) {

      console.log("AI Error:", error);

      answer = context;
    }

    await saveChat(
      req.user._id,
      query,
      answer
    );

    res.json({
      answer
    });

  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};

module.exports = {
  uploadPdf,
  searchDocs
};