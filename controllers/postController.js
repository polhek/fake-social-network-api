const Post = require('../models/post');
const User = require('../models/user');

//New post route ...
exports.newPost = async (req, res, next) => {
  const { userId, text } = req.body;

  const newPost = new Post({
    user: userId,
    text: text,
  });

  try {
    const post = await newPost.save();

    res.status(200).json({ sucess: true, post: post });
  } catch (err) {
    return next(err);
  }
};

exports.friendsOnlyPosts = async (req, res, next) => {
  try {
    const { loggedUserID } = req.body;

    const loggedUser = await User.findById(loggedUserID);
    const friendList = loggedUser.friends;

    friendList.push(loggedUserID);

    const posts = await Post.find({ user: { $in: friendList } });

    console.log(posts);
    res.status(200).json({
      success: true,
      msg: 'All posts from friends',
      posts: posts,
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      msg: "Posts coudn't be find!",
      err: err.message,
    });
  }
};

// edit post...
exports.editPost = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { text } = req.body;

    const updatedPost = await Post.findByIdAndUpdate(id, { text: text });
    res.status(200).json({
      success: true,
      msg: 'Post was successfuly updated!',
      post: updatedPost,
    });
  } catch (err) {
    res.status(400).json({ success: false, msg: "Post wasn't updated!", err });
  }
};

//remove post...
exports.removePost = async (req, res, next) => {
  try {
    const { id } = req.params;
    const deletedPost = await Post.findByIdAndRemove(id);
    return res.status(200).json({
      success: true,
      msg: 'Post was successfuly deleted!',
      deleted_post: deletedPost,
    });
  } catch (err) {
    return res
      .status(409)
      .json({ success: false, msg: "Post wasn't deleted!" });
  }
};
