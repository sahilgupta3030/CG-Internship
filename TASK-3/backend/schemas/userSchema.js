const Joi = require("joi");
const moment = require("moment");

const lettersOnly = /^[A-Za-z]+$/;

const correctDate = (value, helpers) => {
  const dateOfBirth = moment(value, "DD-MM-YYYY", true);
  if (!dateOfBirth.isValid()) {
    return helpers.message("Invalid date format. Please use DD-MM-YYYY.");
  }
  if (dateOfBirth.isAfter(moment())) {
    return helpers.message("Date of birth cannot be in the future.");
  }
  return value;
};

const userSchema = Joi.object({
  firstName: Joi.string().min(1).max(20).pattern(lettersOnly).required(),
  lastName: Joi.string().min(1).max(20).pattern(lettersOnly).required(),
  dob: Joi.string().custom(correctDate).required(),
  mobile: Joi.string()
    .pattern(/^[0-9]{10}$/)
    .required(),
  addr: Joi.string().max(30).required(),
});

const updateUserSchema = Joi.object({
  firstName: Joi.string().min(0).max(20).pattern(lettersOnly),
  lastName: Joi.string().min(0).max(20).pattern(lettersOnly),
  dob: Joi.string().custom(correctDate),
  mobile: Joi.string().pattern(/^[0-9]{10}$/),
  addr: Joi.string().max(30),
}).min(1);

module.exports = {
  userSchema,
  updateUserSchema,
};
