const jwt = require("jsonwebtoken");

exports.requireLogin = (req, res, next) => {
  if (!req.cookies || !req.cookies.token) {
    return res.redirect("/auth/login")
  }

  const token = req.cookies.token;
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded.id;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).redirect("/auth/login")
    } else {
      return res.status(401).redirect("/auth/login")
    }
  }
}