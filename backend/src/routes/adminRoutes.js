const express =
  require("express");

const protect =
  require("../middleware/auth");
const { requireAdmin } = require("../middleware/auth");

const {
  getStats,
  getAdminOverview
} = require(
  "../controllers/adminController"
);

const router =
  express.Router();

router.get(
  "/stats",
  protect,
  requireAdmin,
  getStats
);

router.get(
  "/overview",
  protect,
  requireAdmin,
  getAdminOverview
);

module.exports =
  router;
