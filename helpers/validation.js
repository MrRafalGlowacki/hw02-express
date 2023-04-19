const Joi = require("joi");

const contactSchema = Joi.object({
  name: Joi.string().min(3),
  email: Joi.string().email(),
  phone: Joi.string().pattern(/^\d{9}$/),
});

const validateContact = (req, res, next) => {
  const { error } = contactSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }
  next();
};

module.exports = { validation: validateContact };