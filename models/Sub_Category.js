const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Create Schema
const SubCategorySchema = new Schema({
  main_category: {
    type: Schema.Types.ObjectId,
    ref: "main_categories",
    required: true,
  },

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

module.exports = SubCategory = mongoose.model(
  "sub_categories",
  SubCategorySchema
);
