const mongoose = require("mongoose");

const postSchema = new mongoose.Schema({
  content: {
    type: String,
    trim: true
  },
  postedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  pinned: {
    type: Boolean,
    default: false
  },
  likes: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    }
  ],
  retweetUsers: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    }
  ],
  retweetData: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Post',
  }
}, {
  timestamps: true
});

const Post = mongoose.model('Post', postSchema);
module.exports = Post;
