const Validator = require("validator");
const isEmpty = require("./is-empty");

const logoAllowedTypes = [
  "image/png",
  "image/jpeg",
  "image/svg+xml",
  "image/webp",
];

const bannerAllowedTypes = [
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/svg+xml",
  "video/mp4",
];

module.exports = function validateUpdateCompanyProfileInput(
  data,
  logo,
  banner
) {
  let errors = {};

  data.companyName = !isEmpty(data.companyName) ? data.companyName : "";
  data.country = !isEmpty(data.country) ? data.country : "";
  data.city = !isEmpty(data.city) ? data.city : "";
  data.street = !isEmpty(data.street) ? data.street : "";
  data.zipcode = !isEmpty(data.zipcode) ? data.zipcode : "";

  if (Validator.isEmpty(data.companyName)) {
    errors.companyName = "Company Name field is required";
  }

  if (Validator.isEmpty(data.country)) {
    errors.country = "Country field is required";
  }

  if (Validator.isEmpty(data.city)) {
    errors.city = "City field is required";
  }

  if (Validator.isEmpty(data.street)) {
    errors.street = "Street field is required";
  }

  if (!/^\d{5}$/.test(data.zipcode)) {
    errors.zipcode = "Please enter a valid zipcode";
  }

  if (Validator.isEmpty(data.zipcode)) {
    errors.zipcode = "Zipcode field is required";
  }

  if (logo && !logoAllowedTypes.includes(logo.mimetype)) {
    errors.logo = "Logo File is invalid";
  }

  if (logo && logo.size >= 10 * 1024 * 1024) {
    errors.logo = "Logo size is too large. Maximum size is 10MB";
  }

  if (banner && !bannerAllowedTypes.includes(banner.mimetype)) {
    errors.banner = "Banner File is invalid";
  }

  if (banner && banner.size >= 10 * 1024 * 1024) {
    errors.banner = "Banner size is too large. Maximum size is 10MB";
  }

  return {
    errors,
    isValid: isEmpty(errors),
  };
};
