const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Create Schema
const InvoiceSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: "users",
    required: true,
  },

  amount: {
    type: Number,
    required: true,
  },

  file: {
    type: String,
    required: true,
  },

  created_time: {
    type: Date,
    default: Date.now,
  },
});

module.exports = Invoice = mongoose.model("invoices", InvoiceSchema);
