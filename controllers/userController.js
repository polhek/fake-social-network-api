const User = require('../models/user');
const utils = require('../utils/utils');

exports.facebookLogin = async (req, res) => {
  // Issue JWT for logged in user and return user !
  const token = utils.issueJwtToken(req.user);

  res.status(200).json({
    success: true,
    user: req.user,
    token: token.token,
    expiresIn: token.expires,
  });
};

//! friend lista, addanje itd.
exports.sendFriendRequest = async (req, res) => {
  const loggedUser_id = req.user._id;
  const secondUser_id = req.body.user_id;

  try {
    const loggedUser = await User.findById(loggedUser_id);
    const secondUser = await User.findById(secondUser_id);

    if (loggedUser._id === secondUser._id) {
      return res
        .status(400)
        .json({ success: false, msg: 'Users are the same!' });
    }
    if (secondUser.friends.includes(loggedUser_id)) {
      return res.status(400).json({
        success: false,
        msg: 'Friend request to this user was already sent!',
      });
    }

    loggedUser.friend_send.push(secondUser._id);
    secondUser.friend_requests.push(loggedUser._id);

    await loggedUser.save();
    await secondUser.save();

    return res.status(200).json({
      success: true,
      updatedUser: loggedUser,
    });
  } catch (err) {
    return res.status(400).json({ success: false, msg: err.message });
  }
};

exports.cancelSendFriendRequest = async (req, res) => {
  const loggedUser_id = req.user._id;
  const secondUser_id = req.body.user_id;

  try {
    const loggedUser = await User.findById(loggedUser_id);
    const secondUser = await User.findById(secondUser_id);

    if (!secondUser.friend_requests.includes(loggedUser_id)) {
      return res
        .status(404)
        .json({ success: false, msg: 'Cannot find a friend request!' });
    }

    const updatedSend = loggedUser.friend_send.filter((item) => {
      item != secondUser._id.toString();
    });

    const updatedReceived = secondUser.friend_requests.filter((item) => {
      item != loggedUser._id.toString();
    });

    console.log(updatedReceived);
    loggedUser.friend_send = updatedSend;
    secondUser.friend_requests = updatedReceived;

    const updatedLoggedUser = await loggedUser.save();
    await secondUser.save();

    return res.status(200).json({
      success: true,
      msg: 'Friend requests was sucessfuly canceled!',
      user: updatedLoggedUser,
    });
  } catch (err) {
    return res.status(400).json({ success: false, msg: err.message });
  }
};
