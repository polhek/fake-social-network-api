const User = require('../models/user');
const utils = require('../utils/utils');

exports.facebookLogin = async (req, res) => {
  try {
    const { _id } = req.user;
    const token = utils.issueJwtToken(req.user);

    const user = await User.findById(_id)
      .select('-password')
      .populate('friends')
      .populate('friend_send')
      .populate('friend_requests')
      .populate('posts');

    res.status(200).json({
      success: true,
      user: user,
      token: token.token,
      expiresIn: token.expires,
    });
  } catch (err) {
    res.status(500).json({ sucess: false, msg: err.message });
  }
  // Issue JWT for logged in user and return user !
};

//send friend request!!!
exports.sendFriendRequest = async (req, res) => {
  const loggedUser_id = req.user._id;
  const secondUser_id = req.params.id;

  try {
    const loggedUser = await User.findById(loggedUser_id);
    const secondUser = await User.findById(secondUser_id);

    if (loggedUser._id.toString() === secondUser._id.toString()) {
      return res
        .status(400)
        .json({ success: false, msg: 'Users are the same!' });
    }
    if (secondUser.friend_requests.includes(loggedUser._id.toString())) {
      return res.status(400).json({
        success: false,
        msg: 'Friend request to this user was already sent!',
      });
    }

    if (secondUser.friends.includes(loggedUser._id.toString())) {
      return res.status(400).json({
        success: false,
        msg: 'User is already your friend, you cannot send him a friend request!',
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

//cancel friend request!
exports.unsendFriendRequest = async (req, res) => {
  const loggedUser_id = req.user._id;
  const secondUser_id = req.params.id;

  try {
    const loggedUser = await User.findById(loggedUser_id);
    const secondUser = await User.findById(secondUser_id);

    if (!secondUser.friend_requests.includes(loggedUser_id.toString())) {
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

// accept friend request ...
exports.acceptFriend = async (req, res) => {
  const loggedUser_id = req.user._id;
  const secondUser_id = req.params.id;
  try {
    const loggedUser = await User.findById(loggedUser_id);
    const secondUser = await User.findById(secondUser_id);

    if (
      !loggedUser.friend_requests.includes(secondUser._id) ||
      !secondUser.friend_send.includes(loggedUser._id)
    ) {
      return res
        .status(400)
        .json({ success: false, msg: 'No friend request to accept!' });
    }

    // delete ids from request and send requests
    const updFriendReq = loggedUser.friend_requests.filter(
      (item) => item != secondUser._id.toString()
    );
    const updSendReq = secondUser.friend_send.filter(
      (item) => item != loggedUser._id.toString()
    );
    loggedUser.friend_requests = updFriendReq;
    secondUser.friend_send = updSendReq;

    // add to friend list for both users...
    const loggedFriends = [...loggedUser.friends, secondUser._id];
    const secondUserFriends = [...secondUser.friends, loggedUser._id];
    loggedUser.friends = loggedFriends;
    secondUser.friends = secondUserFriends;

    const updatedLoggedUser = await loggedUser.save();
    await secondUser.save();

    return res.status(200).json({
      success: true,
      msg: 'Accepted friend request!',
      user: updatedLoggedUser,
    });
  } catch (err) {
    return res.status(400).json({ success: false, msg: err.message });
  }
};

exports.cancelFriendRequest = async (req, res) => {
  const loggedUser_id = req.user._id;
  const secondUser_id = req.params.id;

  try {
    const loggedUser = await User.findById(loggedUser_id);
    const secondUser = await User.findById(secondUser_id);

    if (!secondUser.friend_send.includes(loggedUser_id.toString())) {
      return res
        .status(404)
        .json({ success: false, msg: 'Cannot find a friend request!' });
    }

    const updatedReceivedLogged = loggedUser.friend_requests.filter((item) => {
      item != secondUser._id.toString();
    });

    const updatedReceivedSecond = secondUser.friend_send.filter((item) => {
      item != loggedUser._id.toString();
    });

    console.log(updatedReceivedLogged);
    loggedUser.friend_requests = updatedReceivedLogged;
    secondUser.friend_send = updatedReceivedSecond;

    const updatedLoggedUser = await loggedUser.save();
    await secondUser.save();

    return res.status(200).json({
      success: true,
      msg: 'Friend requests was sucessfuly removed!',
      user: updatedLoggedUser,
    });
  } catch (err) {
    return res.status(400).json({ success: false, msg: err.message });
  }
};

exports.removeFriend = async (req, res) => {
  const loggedUser_id = req.user._id;
  const secondUser_id = req.params.id;
  try {
    const loggedUser = await User.findById(loggedUser_id);
    const secondUser = await User.findById(secondUser_id);

    if (
      !loggedUser.friends.includes(secondUser._id) ||
      !secondUser.friends.includes(loggedUser._id)
    ) {
      return res
        .status(400)
        .json({ success: false, msg: 'There is no friend to remove!' });
    }

    const updatedFriendsLogged = loggedUser.friends.filter(
      (item) => item != secondUser._id.toString()
    );
    const updatedFriendsSecond = secondUser.friends.filter(
      (item) => item != loggedUser._id.toString()
    );

    loggedUser.friends = updatedFriendsLogged;
    secondUser.friends = updatedFriendsSecond;

    const updatedUser = await loggedUser.save();
    secondUser.save();

    return res
      .status(200)
      .json({ success: true, msg: 'Friend was deleted!', user: updatedUser });
  } catch (err) {
    return res.status(400).json({ success: false, msg: err.message });
  }
};

// get all users...
exports.allUsers = async (req, res) => {
  const loggedUser_id = req.user._id;

  try {
    const users = await User.find({
      _id: { $ne: loggedUser_id.toString() },
    });
    console.log(users);
    return res
      .status(200)
      .json({ success: true, msg: 'All users in JSON', allUsers: users });
  } catch (err) {
    return res.status(400).json({ success: false, msg: err.message });
  }
};

exports.updateUser = async (req, res) => {
  const id = req.user._id;
  try {
    const user = await User.findById(id)
      .select('-password')
      .populate('friends')
      .populate('friend_send')
      .populate('friend_requests')
      .populate('posts');

    return res.status(200).json({
      success: true,
      user: user,
    });
  } catch (err) {
    return res.status(400).json({ success: false, msg: err.message });
  }
};
