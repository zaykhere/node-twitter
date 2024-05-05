const express = require("express");
const router = express.Router();
const { requireLogin } = require("../middlewares/auth");
const Post = require("../schemas/postSchema");

router.get("/", requireLogin, async(req,res) => {
  try {
    const posts = await Post.find().populate('postedBy', '-password').sort({"createdAt": -1})
    return res.status(200).json(posts)
  } catch (error) {
    console.log(error);
    res.status(500).json({error})
  }
})

router.post("/", requireLogin, async(req,res) => {
  if(!req.body.content) {
    return res.status(400).json({error: "You need to add some data"});
  }

  const postData = {
    content: req.body.content,
    postedBy: req.user
  };

  try {
    const post = await Post.create(postData);
    const populatedPost = await Post.findById(post._id).populate({
      path: 'postedBy',
      select: '-password'
    }).exec();
    res.status(200).json(populatedPost);

  } catch (error) {
    console.log(error);
    res.status(500).json({error})
  }
})

module.exports = router;