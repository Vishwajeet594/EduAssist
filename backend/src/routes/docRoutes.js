const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const protect = require("../middleware/auth");
const { requireAdmin } = require("../middleware/auth");

const {
  uploadPdf,
  searchDocs,
  getDocuments,
  deleteDocument,
  testPinecone
} = require(
  "../controllers/docController"
);

const router = express.Router();

const uploadDir = path.join(process.cwd(), "uploads");

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_, __, cb) => cb(null, uploadDir),
  filename: (_, file, cb) => {
    const uniquePrefix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${uniquePrefix}-${file.originalname}`);
  }
});

const upload = multer({ storage });

router.post(
  "/upload",
  protect,
  requireAdmin,
  upload.single("file"),
  uploadPdf
);

router.post(
  "/search",
  protect,
  searchDocs
);

router.post(
  "/pinecone-test",
  protect,
  testPinecone
);

router.get(
  "/all",
  protect,
  getDocuments
);

router.delete(
  "/:id",
  protect,
  requireAdmin,
  deleteDocument
);

module.exports = router;
