const Validator = require("validator");
const isEmpty = require("./is-empty");

const allowedTypes = [
  "image/png",
  "image/jpeg",
  "application/pdf",
  "application/x-zip-compressed",
];

module.exports = function validateFeedbackInput(data, file) {
  let errors = {};

  data.name = !isEmpty(data.name) ? data.name : "";
  data.phoneNumber = !isEmpty(data.phoneNumber) ? data.phoneNumber : "";
  data.email = !isEmpty(data.email) ? data.email : "";
  data.subject = !isEmpty(data.subject) ? data.subject : "";
  data.title = !isEmpty(data.title) ? data.title : "";
  data.description = !isEmpty(data.description) ? data.description : "";
  data.recaptchaToken = !isEmpty(data.recaptchaToken)
    ? data.recaptchaToken
    : "";

  if (Validator.isEmpty(data.name)) {
    errors.name = "Name field is required";
  }

  if (!/^\+\d{1,3}\d{10}$/.test(data.phoneNumber)) {
    errors.phoneNumber = "Phone Number format is wrong";
  }

  if (Validator.isEmpty(data.phoneNumber)) {
    errors.phoneNumber = "Phone Number field is required";
  }

  if (Validator.isEmpty(data.email)) {
    errors.email = "Email field is required";
  }

  if (!Validator.isEmail(data.email)) {
    errors.email = "Email is invalid";
  }

  if (Validator.isEmpty(data.subject)) {
    errors.subject = "Subject field is required";
  }

  if (Validator.isEmpty(data.title)) {
    errors.title = "Title field is required";
  }

  if (Validator.isEmpty(data.description)) {
    errors.description = "Description field is required";
  }

  if (file && !allowedTypes.includes(file.mimetype)) {
    errors.file = "File is invalid";
  }

  if (file && file.size >= 10 * 1024 * 1024) {
    errors.file = "File size is too large. Maximum size is 10MB";
  }

  if (Validator.isEmpty(data.recaptchaToken)) {
    errors.recaptchaToken = "Recaptcha Token is required";
  }

  return {
    errors,
    isValid: isEmpty(errors),
  };
};
