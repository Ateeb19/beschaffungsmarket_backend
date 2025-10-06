const express = require("express");
const router = express.Router();

const authMiddleware = require("../../middlewares/authMiddleware");

const multer = require("multer");
const upload = multer({ dest: "uploads/" });

const {
  getMyCertificates,
  addCertificate,
  editCertificate,
  deleteCertificate,
} = require("../../controllers/certificateControllers");

router.post("/", authMiddleware, getMyCertificates);

router.post("/add", upload.single("image"), authMiddleware, addCertificate);

router.post("/edit", upload.single("image"), authMiddleware, editCertificate);

router.post("/delete", authMiddleware, deleteCertificate);

module.exports = router;
