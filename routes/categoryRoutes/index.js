const express = require("express");
const router = express.Router();

const {
  getAllMainSubCategories,
  getAllMainCategories,
  getRandomCategories,
} = require("../../controllers/categoryControllers");

router.get("/", getAllMainSubCategories);

router.get("/get-all-main-category", getAllMainCategories);

router.get("/random", getRandomCategories);

module.exports = router;
