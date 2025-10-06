const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Create Schema
const CertificateSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: "users",
    required: true,
  },

  title: {
    type: String,
    required: true,
  },

  image: {
    type: String,
    required: true,
  },

  created_time: {
    type: Date,
    default: Date.now,
  },
});

module.exports = Certificate = mongoose.model(
  "certificates",
  CertificateSchema
);
