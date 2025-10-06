const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Create Schema
const MainCategorySchema = new Schema({
  label: {
    type: String,
    required: true,
    unique: true,
  },

  value: {
    type: String,
    required: true,
    unique: true,
  },

  icon: {
    type: String,
    required: true,
  },

  created_time: {
    type: Date,
    default: Date.now,
  },
});

module.exports = MainCategory = mongoose.model(
  "main_categories",
  MainCategorySchema
);
