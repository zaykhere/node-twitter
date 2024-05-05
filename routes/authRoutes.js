const express = require("express");
const { requireLogin } = require("../middlewares/auth");
const validateSchema = require("../middlewares/validateSchema");
const router = express.Router();
const registerValidation = require("../validations/auth/registerValidation");
const loginValidation = require("../validations/auth/loginValidation");
const User = require("../schemas/userSchema");
const jwt = require("jsonwebtoken")

router.get("/login", async (req, res, next) => {
  res.render("login")
});

router.post("/login", async(req, res, next) => {
  const {nameOrEmail, password} = req.body;
  const {error} = loginValidation.validate(req.body);
  if(error) {
    return res.status(400).render("login", { error: error?.details?.[0]?.message, values: req.body})
  }

  try {
    const user = await User.findOne({
      $or: [
        {username: nameOrEmail},
        {email: nameOrEmail}
      ]
    });

    if(!user) return res.status(404).render("login", { error: 'Invalid Credentials'});

    const passwordMatched = await user.matchPassword(password);
    if(!passwordMatched) return res.status(404).render("login", { error: 'Invalid Credentials'});

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
    res.cookie('token', token, { httpOnly: true, maxAge: 1000 * 60 * 60 * 24 * 30 });
    res.redirect('/');

  } catch (error) {
    console.log(error);
    res.status(500).json({error})
  }
})

router.get("/register", async (req,res,next) => {
  res.render("register");
})

router.post("/register", async (req,res,next) => {
  const {username, email, password, firstName, lastName} = req.body;
  const {error} = registerValidation.validate(req.body);
  if(error) {
    return res.status(400).render("register", { error: error?.details?.[0]?.message, values: req.body})
  }

  try {
    const user = await User.findOne({
      $or: [
        {username},
        {email}
      ]
    });

    if(user) {
      if(user.username === username) {
        return res.status(400).render("register", { error: "Username already in use", values: req.body})
      }
      else if(user.email === email) {
        return res.status(400).render("register", { error: "Email already in use", values: req.body})
      }
    }

    const createdUser = await User.create({
      username,
      email,
      password,
      firstName,
      lastName
    });

    const token = jwt.sign({ id: createdUser._id }, process.env.JWT_SECRET);
    res.cookie('token', token, { httpOnly: true, maxAge: 1000 * 60 * 60 * 24 * 30 });
    res.redirect('/');

  } catch (error) {
    console.log(error);
    res.status(500).json({error})
  }

  
})

router.get("/logout", async(req,res,next) => {
  if(req.cookies.token) {
    res.clearCookie('token');
    res.status(200).redirect('/');
  }
})

module.exports = router;