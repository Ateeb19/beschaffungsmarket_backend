const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Create Schema
const CompanySegmentSchema = new Schema({
  value: {
    type: String,
    required: true,
  },
  label: {
    type: String,
    required: true,
  },
});

module.exports = CompanySegment = mongoose.model(
  "company_segments",
  CompanySegmentSchema
);
