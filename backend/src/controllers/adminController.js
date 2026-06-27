const User = require("../models/User");
const Chat = require("../models/Chat");
const DocumentChunk =
  require("../models/DocumentChunk");

const getStats = async (
  req,
  res
) => {
  try {

    const totalUsers =
      await User.countDocuments();

    const totalChats =
      await Chat.countDocuments();

    const totalDocs =
      await DocumentChunk.countDocuments();

    res.json({
      totalUsers,
      totalChats,
      totalDocs
    });

  } catch (error) {

    res.status(500).json({
      message: error.message
    });

  }
};

module.exports = {
  getStats,
  getAdminOverview: async (req, res) => {
    try {
      const [stats, recentChats, recentDocs] = await Promise.all([
        Promise.all([
          User.countDocuments(),
          Chat.countDocuments(),
          DocumentChunk.countDocuments()
        ]).then(([totalUsers, totalChats, totalDocs]) => ({
          totalUsers,
          totalChats,
          totalDocs
        })),
        Chat.find()
          .sort({ createdAt: -1 })
          .limit(6)
          .populate("userId", "name email role"),
        DocumentChunk.find()
          .sort({ createdAt: -1 })
          .limit(6)
          .select("title createdAt")
      ]);

      res.json({
        stats,
        recentChats,
        recentDocs
      });
    } catch (error) {
      res.status(500).json({
        message: error.message
      });
    }
  }
};
