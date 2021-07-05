const Comment = require('../models/comments');
const Post = require('../models/post');
const user = require('../models/user');
const Notification = require('../models/notification');

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

    const userWhoWrotePost = await user.findById(post.user._id);
    console.log(userWhoWrotePost);
    const userWhoCommented = await user.findById(loggedUser_id);
    const newComment = new Comment({
      text: text,
      user: loggedUser_id,
    });

    const newNotification = new Notification({
      text: `You have new comment from ${userWhoCommented.first_name} ${userWhoCommented.last_name}`,
      from_user: loggedUser_id,
      type: 'comment',
    });

    const updatedNotifications = [
      ...userWhoWrotePost.notifications,
      newNotification._id,
    ];
    userWhoWrotePost.notifications = updatedNotifications;

    const updatedComments = [...post.comments, newComment._id];
    post.comments = updatedComments;

    const updatedPost = await post.save();
    await newComment.save();
    await userWhoWrotePost.save();
    await newNotification.save();
    return res.status(200).json({
      success: true,
      msg: 'Comment was added!',
      post: updatedPost,
      newNotification,
    });
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
