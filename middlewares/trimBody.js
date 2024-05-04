function trimRequestBody(req, res, next) {
  if (req.body) {
      Object.keys(req.body).forEach(key => {
          if (!['password'].includes(key)) {
              req.body[key] = req.body[key].trim();
          }
      });
  }
  next();
}

module.exports = trimRequestBody;