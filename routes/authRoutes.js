const express = require("express");
const { requireLogin } = require("../middlewares/auth");
const validateSchema = require("../middlewares/validateSchema");
const router = express.Router();
const registerValidation = require("../validations/auth/registerValidation");

router.get("/login", (req, res, next) => {
  res.render("login")
});

router.get("/register", (req,res,next) => {
  res.render("register");
})

router.post("/register", (req,res,next) => {
  const {error} = registerValidation.validate(req.body);
  if(error) {
    return res.status(400).render("register", { error: error?.details?.[0]?.message, values: req.body})
  }

  return res.status(200).render("register", {values: req.body})
})

module.exports = router;