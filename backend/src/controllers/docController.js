const pdfParse = require("pdf-parse");

const DocumentChunk =
  require("../models/DocumentChunk");

const chunkText =
  require("../utils/chunkText");

const {
  getEmbedding
} = require(
  "../utils/embedding"
);

const cosineSimilarity =
  require(
    "../utils/similarity"
  );

const {
  generateAnswer
} = require(
    "../utils/ai"
  );

const {
  saveChat
} = require(
  "./chatController"
);

const detectLanguage =
  require(
    "../utils/language"
  );

const {
  translateToEnglish,
  translateFromEnglish
} = require(
  "../utils/translator"
);

const uploadPdf =
  async (req, res) => {

    try {

      if (!req.file) {

        return res.status(400)
          .json({
            message:
              "No file uploaded"
          });

      }

      const data =
        await pdfParse(
          req.file.buffer
        );

      const chunks =
        chunkText(
          data.text
        );

      const docs = [];

      for (
        const chunk of chunks
      ) {

        const embedding =
          await getEmbedding(
            chunk
          );

        docs.push({
          title:
            req.file.originalname,
          chunk,
          embedding
        });

      }

      await DocumentChunk
        .insertMany(docs);

      res.status(201).json({
        message:
          "PDF uploaded successfully",
        chunks:
          chunks.length
      });

    } catch (error) {

      res.status(500).json({
        message:
          error.message
      });

    }

  };

const searchDocs =
  async (req, res) => {

    try {

      let { query } =
        req.body;

      const userLanguage =
        detectLanguage(query);

      const englishQuery =
        await translateToEnglish(
          query
        );

      const queryEmbedding =
        await getEmbedding(
          englishQuery
        );

      const docs =
        await DocumentChunk
          .find();

      const ranked =
        docs.map(
          (doc) => ({
            ...doc.toObject(),

            score:
              cosineSimilarity(
                queryEmbedding,
                doc.embedding
              )
          })
        );

      ranked.sort(
        (a, b) =>
          b.score - a.score
      );

      const topChunks =
        ranked.slice(0, 3);

      const context =
        topChunks
          .map(
            (d) => d.chunk
          )
          .join("\n\n");

      let answer;

      try {

        answer =
          await generateAnswer(
            englishQuery,
            context
          );

      } catch {

        answer =
          context;
      }

      if (
        userLanguage !== "en"
      ) {

        answer =
          await translateFromEnglish(
            answer,
            userLanguage
          );

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
        message:
          error.message
      });

    }

  };

module.exports = {
  uploadPdf,
  searchDocs
};