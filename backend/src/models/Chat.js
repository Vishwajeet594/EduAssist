const mongoose = require("mongoose");

const chatSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },

    question: {
      type: String,
      required: true
    },

    answer: {
      type: String,
      required: true
    },

    sourceTitle: {
      type: String,
      default: ""
    },

    sourceFileUrl: {
      type: String,
      default: ""
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model(
  "Chat",
  chatSchema
);
