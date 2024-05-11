const express = require("express");
const router = express.Router();
const { requireLogin } = require("../../middlewares/auth");
const Post = require("../../schemas/postSchema");
const User = require("../../schemas/userSchema");

router.get("/", requireLogin, async(req,res) => {
  try {

    let searchObj = req.query;
    
    if(searchObj.hasOwnProperty("isReply")) {
      if(searchObj.isReply == 'false') {
        delete searchObj.isReply;
        searchObj.replyTo = {$exists: false}
      }
      else {
        delete searchObj.isReply;
        searchObj.replyTo = {$exists: true}
      }
      
    }

    const posts = await Post.find(searchObj).populate('postedBy', '-password').populate({ path: 'retweetData',  populate: { 
      path: 'postedBy', 
      select: '-password' 
  }  }).populate({
    path: 'replyTo',
    populate: {
      path: 'postedBy',
      select: '-password'
    }
  }).sort({"createdAt": -1})
    
    return res.status(200).json(posts)
  } catch (error) {
    console.log(error);
    res.status(500).json({error})
  }
});

router.get("/:id", requireLogin, async(req,res) => {
  try {
    let postId = req.params.id;

    let postData = await getPosts({ _id: postId });
    postData = postData[0];

    let results = {
        postData: postData
    }

    if(postData.replyTo !== undefined) {
        results.replyTo = postData.replyTo;
    }

    results.replies = await getPosts({ replyTo: postId });

    // console.log(JSON.stringify(results));

    res.status(200).send(results);
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

  if(req.body.replyTo) {
    postData.replyTo = req.body.replyTo;
  }

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
    // console.log(deletedPost)

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
});

router.delete("/:id", requireLogin, async(req,res) => {
  try {
    await Post.deleteOne({_id: req.params.id, postedBy: req.user});
    res.status(200);
    res.end()
  } catch (error) {
    console.log(error);
    res.status(500).json({error})
  }
})

async function getPosts(filter) {
  let results = await Post.find(filter)
  .populate('postedBy', '-password').populate({ path: 'retweetData',  populate: { 
    path: 'postedBy', 
    select: '-password' 
}  }).populate({
  path: 'replyTo',
  populate: {
    path: 'postedBy',
    select: '-password'
  }
});

  results = await User.populate(results, { path: "replyTo.postedBy"})
  return await User.populate(results, { path: "retweetData.postedBy"});
}

module.exports = router;