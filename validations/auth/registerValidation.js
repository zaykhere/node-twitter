const {Joi} = require('express-validation');

registerValidation = Joi.object({
    email: Joi.string().min(3).max(40).email().required(),
    password: Joi.string().min(6).max(32).required(),
    firstName: Joi.string().min(2).max(32).required(),
    lastName: Joi.string().min(2).max(60).required(),
    username: Joi.string().min(2).max(60).required(),
    passwordConf: Joi.string().required()
});

module.exports = registerValidation;