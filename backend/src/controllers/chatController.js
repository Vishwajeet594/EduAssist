const Chat = require("../models/Chat");

const saveChat = async (
  userId,
  question,
  answer
) => {
  try {
    console.log("==========");
    console.log("saveChat called");
    console.log("User ID:", userId);
    console.log("Question:", question);

    const chat = await Chat.create({
      userId,
      question,
      answer
    });

    console.log("Chat Saved:");
    console.log(chat);
    console.log("==========");

  } catch (error) {
    console.log("SAVE CHAT ERROR:");
    console.log(error);
  }
};

const getHistory = async (req, res) => {
  try {

    const chats = await Chat.find({
      userId: req.user._id
    }).sort({
      createdAt: 1
    });

    res.json(chats);

  } catch (error) {

    res.status(500).json({
      message: error.message
    });

  }
};

module.exports = {
  saveChat,
  getHistory
};