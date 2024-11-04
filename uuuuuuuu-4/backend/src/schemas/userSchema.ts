import Joi, { CustomHelpers } from "joi";
import moment, { Moment } from "moment";

const lettersOnly = /^[A-Za-z]+$/;

const correctDate = (value: string, helpers: CustomHelpers): string => {
    const dateOfBirth: Moment = moment(value, "DD-MM-YYYY", true);
    if (!dateOfBirth.isValid()) {
        throw helpers.error('string.custom', {
            message: "Invalid date format ( Please use DD-MM-YYYY )"
        });
    }
    if (dateOfBirth.isAfter(moment())) {
        throw helpers.error('string.custom', {
            message: "Date of birth cannot be in the future!"
        });
    }
    return value;
};

const createUserSchema = Joi.object({
    firstName: Joi.string().min(1).max(20).pattern(lettersOnly).required(),
    lastName: Joi.string().min(1).max(20).pattern(lettersOnly).required(),
    dob: Joi.string().custom(correctDate, 'Custom Date Validation').required(),
    mobile: Joi.string().pattern(/^[0-9]{10}$/).required(),
    addr: Joi.string().max(30).required(),
});

const updateUserSchema = Joi.object({
    firstName: Joi.string().min(0).max(20).pattern(lettersOnly),
    lastName: Joi.string().min(0).max(20).pattern(lettersOnly),
    dob: Joi.string().custom(correctDate, 'Custom Date Validation'),
    mobile: Joi.string().pattern(/^[0-9]{10}$/),
    addr: Joi.string().max(30),
}).min(1);

export { createUserSchema, updateUserSchema };


