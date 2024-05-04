const validateSchema =
  (schema) =>
  async (req, res, next) => {
    console.log(req.body)
    const {error} = schema.validate(req.body);

    if(error) return res.status(400).json({ error: error?.details?.[0]?.message });

    return next();
  };

  module.exports = validateSchema;