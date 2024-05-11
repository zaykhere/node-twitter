const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
    trim: true
  },
  lastName: {
    type: String,
    required: true,
    trim: true
  },
  username: {
    type: String,
    required: true,
    trim: true,
    unique: true
  },
  email: {
    type: String,
    required: true,
    trim: true,
    unique: true
  },
  password: {
    type: String,
    required: true,
  },
  profilePic: {
    type: String,
    default: "https://res.cloudinary.com/zainhither/image/upload/v1650655297/next-hotel/avatars/fbryolldevx1ozke5ouk.jpg"
  },
  likes: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Post',
    }
  ],
  retweets: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Post', 
  }],
  following: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', 
  }],
  followers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', 
  }]
}, {
  timestamps: true
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  try {
    return await bcrypt.compare(enteredPassword, this.password);
  } catch (error) {
    console.log(error);
  }
}

userSchema.pre("save", async function (next) {
  if (!this.isModified('password')) {
    next();
  } 

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password,salt);
})

const User = mongoose.model('User', userSchema);
module.exports = User;
