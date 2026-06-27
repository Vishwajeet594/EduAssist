const mongoose = require("mongoose");

const documentChunkSchema =
  new mongoose.Schema(
    {
      title: {
        type: String
      },

      chunk: {
        type: String
      },

      embedding: {
        type: [Number],
        default: []
      }
    },
    {
      timestamps: true
    }
  );

module.exports = mongoose.model(
  "DocumentChunk",
  documentChunkSchema
);