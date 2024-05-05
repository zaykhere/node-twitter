const {Joi} = require('express-validation');

loginValidation = Joi.object({
    nameOrEmail: Joi.string().min(3).max(40).email().required(),
    password: Joi.string().min(6).max(32).required(),
});

module.exports = loginValidation;