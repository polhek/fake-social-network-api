const Post = require('../models/post');
const User = require('../models/user');
const aws = require('aws-sdk');
const fileUpload = require('express-fileupload');

aws.config.region = 'us-east-2';

//New post route ...
exports.newPost = async (req, res) => {
  const { text } = req.body;
  const userId = req.user._id;
  const file = req.files.file;
  try {
    if (text.length > 0) {
      console.log('saving without file');
      const newPost = new Post({ user: userId, text: text });
      const post = await newPost.save();
      const loggedUser = await User.findById(userId);
      loggedUser.posts.push(post._id);

      await loggedUser.save();

      return res
        .status(200)
        .json({ sucess: true, post: post, user: loggedUser });
    }

    console.log('saving file to aws!!!!');
    const s3 = new aws.S3();
    const fileContent = Buffer.from(req.files.file.data, 'binary');
    const params = {
      Bucket: process.env.S3_BUCKET_NAME,
      Key: `posts/images/${req.files}.jpeg`,
      Body: fileContent,
    };

    const data = await s3.upload(params).promise();
    console.log('urltoaws', data.url);
    const newPost = new Post({
      user: userId,
      text: text,
      image_url: data.url,
    });
    await newPost.save();
    const loggedUser = await User.findById(userId);
    loggedUser.posts.push(newPost._id);

    await loggedUser.save();
    return res
      .status(200)
      .json({ sucess: true, post: newPost, user: loggedUser });
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

    const posts = await Post.find({ user: { $in: friendList } })
      .populate('user', '-password')
      .populate({
        path: 'comments',
        populate: { path: 'user' },
        options: { sort: { createdAt: -1 } },
      })
      .populate('likes', '-password')
      .sort('-createdAt');

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

// get specified post

exports.getSinglePost = async (req, res) => {
  try {
    const loggedUser_id = req.user._id;
    const postId = req.params.id;

    const singlePost = await Post.findById(postId);

    return res.status(200).json({
      success: true,
      msg: 'Post was successfuly found!',
      post: singlePost,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      msg: 'Could not get specified  post!',
      error: error.message,
    });
  }
};

// edit post...
exports.editPost = async (req, res) => {
  try {
    const loggedUser_id = req.user._id;
    const id = req.params.id;
    const { text } = req.body;
    const post = await Post.findById(id);

    if (post.user.toString() !== loggedUser_id.toString()) {
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
    const id = req.params.id;
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

exports.likePost = async (req, res) => {
  try {
    const loggedUser_id = req.user._id;
    const post_id = req.params.id;

    const post = await Post.findById(post_id);

    const likesArr = post.likes;

    if (likesArr.includes(loggedUser_id)) {
      const updatedLikes = likesArr.filter(
        (item) => item != loggedUser_id.toString()
      );
      post.likes = updatedLikes;
      await post.save();
    } else {
      const updatedLikes = [...likesArr, loggedUser_id];
      post.likes = updatedLikes;
      await post.save();
    }

    res.status(200).json({
      success: true,
      post,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      msg: err.message,
    });
  }
};
