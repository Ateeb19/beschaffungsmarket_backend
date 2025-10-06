const Validator = require("validator");
const isEmpty = require("./is-empty");

module.exports = function validateNewsLetterEmailInput(data) {
  let errors = {};

  data.email = !isEmpty(data.email) ? data.email : "";
  data.recaptchaToken = !isEmpty(data.recaptchaToken)
    ? data.recaptchaToken
    : "";

  if (Validator.isEmpty(data.email)) {
    errors.email = "Email field is required";
  }

  if (!Validator.isEmail(data.email)) {
    errors.email = "Email is invalid";
  }

  if (Validator.isEmpty(data.recaptchaToken)) {
    errors.recaptchaToken = "Recaptcha Token is required";
  }

  return {
    errors,
    isValid: isEmpty(errors),
  };
};
