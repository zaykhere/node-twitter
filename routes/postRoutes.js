const express = require("express");
const router = express.Router();
const { requireLogin } = require("../middlewares/auth");
const Post = require("../schemas/postSchema");
const User = require("../schemas/userSchema");

router.get("/", requireLogin, async(req,res) => {
  try {
    const posts = await Post.find().populate('postedBy', '-password').populate({ path: 'retweetData',  populate: { 
      path: 'postedBy', 
      select: '-password' 
  }  }).sort({"createdAt": -1})
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

router.put("/:id/like", requireLogin, async(req,res) => {
  try {
    const post = await Post.findById(req.params.id);
    if(!post) return res.status(404).json({error: "Post not found"});
    const user = await User.findById(req.user);

    let isLiked = user.likes && user.likes.includes(req.params.id);
    let option = isLiked ? "$pull" : "$addToSet";

    //Insert Post Like
    const updatedPost = await Post.findByIdAndUpdate(req.params.id, {[option]: {likes: req.user}}, {new: true});
    //Insert User like
    await User.findByIdAndUpdate(req.user, {[option]: {likes: req.params.id}});

    res.status(200).json(updatedPost)

  } catch (error) {
    console.log(error);
    res.status(500).json({error})
  }
})

router.post("/:id/retweet", requireLogin, async(req,res) => {
  try {
    const postId = req.params.id;
    const userId = req.user;

    // Delete a retweet
    const deletedPost = await Post.findOneAndDelete({postedBy: userId, retweetData: postId});
    console.log(deletedPost)

    let option = deletedPost ? "$pull" : "$addToSet";

    let repost = deletedPost;

   if(!repost) {
    repost = await Post.create({postedBy: userId, retweetData: postId})
   }

   await User.findByIdAndUpdate(req.user, {[option]: {retweets: postId}});

   const updatedPost = await Post.findByIdAndUpdate(postId, {[option]: {retweetUsers: userId}}, {new: true});

   res.status(200).json(updatedPost);

  } catch (error) {
    console.log(error);
    res.status(500).json({error})
  }
})

module.exports = router;