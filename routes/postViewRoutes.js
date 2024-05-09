const express = require("express");
const User = require("../schemas/userSchema");
const { requireLogin } = require("../middlewares/auth");
const router = express.Router();

router.get("/:id", requireLogin , async (req, res, next) => {
  try {
    const user = await User.findById(req.user).select('-password');
    console.log(user);
    let payload = {
      pageTitle: "View Post",
      userLoggedIn: user,
      userLoggedInJs: JSON.stringify(user),
      postId: req.params.id
    };

    res.status(200).render("postPage", payload);

  } catch (error) {
    console.log(error);
    res.render("login");
  }


})

module.exports = router;