const express = require("express");
const router = express.Router();

const authMiddleware = require("../../middlewares/authMiddleware");

const multer = require("multer");
const upload = multer({ dest: "uploads/" });

const {
  getMyProducts,
  addProduct,
  editProduct,
  deleteProduct,
} = require("../../controllers/productControllers");

router.post("/", authMiddleware, getMyProducts);

router.post("/add", upload.single("image"), authMiddleware, addProduct);

router.post("/edit", upload.single("image"), authMiddleware, editProduct);

router.post("/delete", authMiddleware, deleteProduct);

module.exports = router;
