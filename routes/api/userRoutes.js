const { requireLogin } = require("../../middlewares/auth");
const User = require("../../schemas/userSchema");

const router = require("express").Router();

router.put("/:userId/follow", requireLogin, async (req, res) => {
  try {
    let userToFollow = await User.findById(req.params.userId);
    if (!userToFollow) return res.status(404).json({ error: "User not found" });

    let isFollowing = userToFollow.followers && userToFollow.followers.includes(req.user);

    let option = isFollowing ? "$pull" : "$addToSet";

    let currentUser = await User.findByIdAndUpdate(req.user, {[option]: {following: userToFollow._id}}, {new: true});
    userToFollow = await User.findByIdAndUpdate(userToFollow._id, {[option]: {followers: req.user}}, {new: true});

    res.status(200).json(currentUser);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error })
  }

});

router.get("/:userId/following", requireLogin, async (req, res) => {
  try {
    const results = await User.findById(req.params.userId).populate('following', '-password');
    res.status(200).json(results);

  } catch (error) {
    console.log(error);
    res.status(500).json({ error })
  }

});

router.get("/:userId/followers", requireLogin, async (req, res) => {
  try {
    const results = await User.findById(req.params.userId).populate('followers', '-password');
    res.status(200).json(results);

  } catch (error) {
    console.log(error);
    res.status(500).json({ error })
  }

});

module.exports = router;