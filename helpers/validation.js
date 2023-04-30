import Joi from "joi";

const contactSchema = Joi.object({
  name: Joi.string().min(3).required(),
  email: Joi.string().email(),
  phone: Joi.string().pattern(/^\d{9}$/),
  favorite: Joi.boolean().default(false),
});

const userSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(8).required(),
});



export const validateContact = (req, res, next) => {
  const { error } = contactSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }
  next();
};


export const validateUser = (req, res, next) => {
  const { error } = userSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }
  next();
};



// module.exports = { validation: validateContact };
