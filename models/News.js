const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Create Schema
const NewsSchema = new Schema({
  user: {
    type: Array,
    default: [],
  },

  title_en: {
    type: String,
    required: true,
  },

  title_tr: {
    type: String,
    required: true,
  },

  title_de: {
    type: String,
    required: true,
  },

  content_en: {
    type: String,
    required: true,
  },

  content_tr: {
    type: String,
    required: true,
  },

  content_de: {
    type: String,
    required: true,
  },

  created_time: {
    type: Date,
    default: Date.now,
  },
});

module.exports = News = mongoose.model("news", NewsSchema);
