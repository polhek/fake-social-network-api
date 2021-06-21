const Comment = require('../models/comments');
const Post = require('../models/post');

//add new comment...
exports.newComment = async (req, res) => {
  const loggedUser_id = req.user._id;
  const text = req.body.text;
  const post_id = req.params.id;

  try {
    const post = await Post.findById(post_id);
    if (!post) {
      return res.status(400).json({
        success: false,
        msg: 'Post cannot be find, and comment cannot be created!',
      });
    }
    const newComment = new Comment({
      text: text,
      user: loggedUser_id,
    });
    const updatedComments = [...post.comments, newComment._id];
    post.comments = updatedComments;
    const updatedPost = await post.save();
    await newComment.save();
    return res
      .status(200)
      .json({ success: true, msg: 'Comment was added!', post: updatedPost });
  } catch (err) {
    return res.status(400).json({ success: false, msg: err.message });
  }
};
//delete comment...
exports.deleteComment = async (req, res) => {
  const loggedUser_id = req.user._id;
  const comment_id = req.params.id;
  const post_id = req.params.post_id;

  try {
    const comment = await Comment.findById(comment_id);
    const post = await Post.findById(post_id);

    if (comment.user.toString() != loggedUser_id) {
      return res.status(400).json({
        success: false,
        msg: 'Users are not the same, you are not allowed to delete comment!',
      });
    }

    await comment.remove();
    const updatedComment = post.comments.filter(
      (item) => item != comment_id.toString()
    );

    post.comments = updatedComment;
    const updatedPost = await post.save();

    return res
      .status(200)
      .json({ success: true, msg: 'Comment was deleted!', post: updatedPost });
  } catch (err) {
    return res.status(400).json({ success: false, msg: err.message });
  }
};
