exports.requireLogin = (req, res, next) => {
  if (!req.cookies || !req.cookies.authToken) {
    return res.redirect("/auth/login")
  }

  next();
}