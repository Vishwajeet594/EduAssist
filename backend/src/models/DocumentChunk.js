const mongoose = require("mongoose");

const documentChunkSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true
    },

    chunk: {
      type: String,
      required: true
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