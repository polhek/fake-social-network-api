const Post = require('../models/post');

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
