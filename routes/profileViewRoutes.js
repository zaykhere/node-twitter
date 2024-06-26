const router = require("express").Router();
const { requireLogin } = require("../middlewares/auth");
const User = require("../schemas/userSchema");

router.get("/", requireLogin, async (req, res) => {
  try {
    const user = await User.findById(req.user);

    let payload = {
      pageTitle: "Profile",
      userLoggedIn: user,
      userLoggedInJs: JSON.stringify(user),
      profileUser: user
    };

    res.status(200).render("profilePage", payload);

  } catch (error) {
    res.redirect("/");
  }
});

router.get("/:username", requireLogin, async(req,res) => {
  try {
    const user = await User.findById(req.user);
    const payload = await getPayload(req.params.username, user);

    res.status(200).render("profilePage", payload);
  } catch (error) {
    res.redirect("/");
  }
});

router.get("/:username/replies", requireLogin, async(req,res) => {
  try {
    const user = await User.findById(req.user);
    const payload = await getPayload(req.params.username, user);
    payload.selectedTab = "replies";

    res.status(200).render("profilePage", payload);
  } catch (error) {
    res.redirect("/");
  }
});

router.get("/:username/following", requireLogin, async(req,res) => {
  try {
    const user = await User.findById(req.user);
    const payload = await getPayload(req.params.username, user);
    payload.selectedTab = "following";

    res.status(200).render("followersAndFollowing", payload);
  } catch (error) {
    res.redirect("/");
  }
});

router.get("/:username/followers", requireLogin, async(req,res) => {
  try {
    const user = await User.findById(req.user);
    const payload = await getPayload(req.params.username, user);
    payload.selectedTab = "followers";

    res.status(200).render("followersAndFollowing", payload);
  } catch (error) {
    res.redirect("/");
  }
});


async function getPayload(username, userLoggedIn) {
  var user = await User.findOne({ username: username })

  if(user == null) {

      user = await User.findById(username);

      if (user == null) {
          return {
              pageTitle: "User not found",
              userLoggedIn: userLoggedIn,
              userLoggedInJs: JSON.stringify(userLoggedIn)
          }
      }
  }

  return {
      pageTitle: user.username,
      userLoggedIn: userLoggedIn,
      userLoggedInJs: JSON.stringify(userLoggedIn),
      profileUser: user
  }
}

module.exports = router;