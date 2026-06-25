const express = require("express");

const protect = require(
  "../middleware/auth"
);

const {
  getHistory
} = require(
  "../controllers/chatController"
);

const router = express.Router();

router.get(
  "/history",
  protect,
  getHistory
);

module.exports = router;