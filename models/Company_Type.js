const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Create Schema
const CompanyTypeSchema = new Schema({
  value: {
    type: String,
    required: true,
  },
  label: {
    type: String,
    required: true,
  },
});

module.exports = CompanyType = mongoose.model(
  "company_types",
  CompanyTypeSchema
);
