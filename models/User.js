const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Create Schema
const UserSchema = new Schema({
  first_name: {
    type: String,
    required: true,
  },

  last_name: {
    type: String,
    required: true,
  },

  avatar: {
    type: String,
  },

  company_name: {
    type: String,
    required: true,
  },

  company_description: {
    type: String,
  },

  company_description2: {
    type: String,
  },

  company_type: {
    type: Schema.Types.ObjectId,
    ref: "company_types",
  },

  company_segment: [
    {
      segment: {
        type: Schema.Types.ObjectId,
        ref: "company_segments",
      },
    },
  ],

  company_category: [
    {
      category: {
        type: Schema.Types.ObjectId,
        ref: "sub_categories",
      },
    },
  ],

  contact_first_name: {
    type: String,
  },

  contact_last_name: {
    type: String,
  },

  contact_position: {
    type: String,
  },

  contact_email: {
    type: String,
  },

  contact_phone_number: {
    type: String,
  },

  contact_img: {
    type: String,
  },

  country: {
    type: String,
    required: true,
  },

  city: {
    type: String,
    required: true,
  },

  street: {
    type: String,
    required: true,
  },

  zipcode: {
    type: String,
    required: true,
  },

  taxpayer_id: {
    type: String,
  },

  fax_number: {
    type: String,
  },

  website: {
    type: String,
  },

  hscode: {
    type: String,
  },

  founded_year: {
    type: String,
  },

  employee_number: {
    type: String,
  },

  keyword: {
    type: Array,
  },

  company_logo: {
    type: String,
  },

  company_banner: {
    type: String,
  },

  avatar: {
    type: String,
  },

  like_posts: [
    {
      post: {
        type: Schema.Types.ObjectId,
        ref: "posts",
        require: true,
      },
    },
  ],

  email: {
    type: String,
    required: true,
    unique: true,
  },

  password: {
    type: String,
    required: true,
  },

  is_verified: {
    type: Boolean,
    default: false,
  },

  is_premium: {
    type: Number,
    enum: [0, 1, 2], // 0: Free 1: Premium 2: Premium +
    default: 0,
  },

  block: {
    type: Boolean,
    default: false,
  },

  email_notification: {
    type: Boolean,
    default: true,
  },

  news_notification: {
    type: Boolean,
    default: true,
  },

  verification_token: {
    type: String,
  },

  verification_token_expires: {
    type: Date,
  },

  reset_verification_token: {
    type: String,
  },

  reset_verification_token_expires: {
    type: Date,
  },

  expired_time: {
    type: Date,
  },

  created_time: {
    type: Date,
    default: Date.now,
  },
});

module.exports = User = mongoose.model("users", UserSchema);
