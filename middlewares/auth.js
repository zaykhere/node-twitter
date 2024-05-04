exports.requireLogin = (req, res, next) => {
  if (!req.cookies || !req.cookies.authToken) {
    return res.redirect("/login")
  }

  const authToken = req.cookies.authToken;

  if (!authToken) {
    return res.redirect("/login")
  }
  next();
}