const express = require("express");
const multer = require("multer");

const protect = require("../middleware/auth");

const {
  uploadPdf,
  searchDocs,
  getDocuments,
  deleteDocument
} = require(
  "../controllers/docController"
);

const router = express.Router();

const storage = multer.memoryStorage();

const upload = multer({ storage });

router.post(
  "/upload",
  protect,
  upload.single("file"),
  uploadPdf
);

router.post(
  "/search",
  protect,
  searchDocs
);
router.get(
  "/all",
  protect,
  getDocuments
);

router.delete(
  "/:id",
  protect,
  deleteDocument
);

module.exports = router;