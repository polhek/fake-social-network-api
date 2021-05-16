const Post = require('../models/post');
const User = require('../models/user');

//New post route ...
exports.newPost = async (req, res) => {
  const { text } = req.body;
  const userId = req.user._id;

  const newPost = new Post({
    user: userId,
    text: text,
  });

  try {
    const post = await newPost.save();
    const loggedUser = await User.findById(userId);
    loggedUser.posts.push(post._id);

    await loggedUser.save();

    res.status(200).json({ sucess: true, post: post, user: loggedUser });
  } catch (err) {
    return res.status(400).json({ success: false, msg: err.message });
  }
};

exports.friendsOnlyPosts = async (req, res) => {
  try {
    const loggedUserID = req.user._id;

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
exports.editPost = async (req, res) => {
  try {
    const loggedUser_id = req.user._id;
    const { id } = req.params;
    const { text } = req.body;
    const post = await Post.findById(id);

    if (post.user !== loggedUser_id) {
      return res
        .status(400)
        .json({ success: false, msg: 'You cannot edit other peoples posts!' });
    }

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
exports.removePost = async (req, res) => {
  try {
    const loggedUser_id = req.user._id;
    const { id } = req.params;
    const deletedPost = await Post.findByIdAndRemove(id);
    const user = await User.findById(loggedUser_id);

    const updatedPosts = user.posts.filter((item) => item != id);
    user.posts = updatedPosts;

    await user.save();

    // preveri če dela
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
