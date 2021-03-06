const User = require('../models/user');
const utils = require('../utils/utils');
const aws = require('aws-sdk');
const fileUpload = require('express-fileupload');
const bcrypt = require('bcryptjs');

// region of S3 bucket
aws.config.region = 'us-east-2';

// for the sake of having a live app... also the option to register/login without
// facebook oAuth.
exports.register_POST = async (req, res) => {
  try {
    const { first_name, last_name, email, password } = req.body;
    const defaultImgUrl = 'https://www.w3schools.com/howto/img_avatar.png';

    const user = await User.findOne({ email: email });
    if (user) {
      return res.status(400).json({
        success: false,
        msg: 'User with this name already exists!',
      });
    }
    try {
      const hashedPassword = await bcrypt.hash(password, 10);

      const newUser = new User({
        first_name,
        last_name,
        email,
        profile_img_url: defaultImgUrl,
        password: hashedPassword,
      });

      const savedUser = await newUser.save();
      const token = utils.issueJwtToken(savedUser);
      return res.status(200).json({
        success: true,
        user: savedUser,
        token: token.token,
        expiresIn: token.expires,
      });
    } catch (err) {
      res.status(500).json({ err: err.msg });
    }
  } catch (err) {
    return res.status(500).json({ sucess: false, msg: err.message });
  }
};

// LOGIN for the sake of testing the app on github live

exports.login_POST = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email: email });

    if (!user) {
      return res
        .status(400)
        .json({ success: false, msg: 'User could not be found' });
    }

    try {
      const result = await bcrypt.compare(password, user.password);

      if (!result) {
        return res.status(401).json({
          success: false,
          msg: 'You entered the wrong password!',
        });
      }

      if (result) {
        const user = await User.findOne({ email: email })
          .select('-password')
          .populate('friends')
          .populate('friend_send')
          .populate('friend_requests')
          .populate('posts')
          .populate('notifications');

        const token = utils.issueJwtToken(user);

        return res.status(200).json({
          success: true,
          user: user,
          token: token.token,
          expiresIn: token.expires,
        });
      }
    } catch (error) {
      res.status(401).json({
        success: false,
        msg: 'You entered the wrong password!',
        err: error.message,
      });
    }
  } catch (error) {
    return res.status(500).json({ sucess: false, msg: error.message });
  }
};

exports.facebookLogin = async (req, res) => {
  try {
    const { _id } = req.user;
    const token = utils.issueJwtToken(req.user);

    const user = await User.findById(_id)
      .select('-password')
      .populate('friends')
      .populate('friend_send')
      .populate('friend_requests')
      .populate('posts')
      .populate('notifications');

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
      .populate({
        path: 'posts',
        populate: { path: 'user' },
      })
      .populate('notifications');

    return res.status(200).json({
      success: true,
      user: user,
    });
  } catch (err) {
    return res.status(400).json({ success: false, msg: err.message });
  }
};

exports.newProfileImage = async (req, res) => {
  try {
    const id = req.user._id;
    const s3 = new aws.S3();
    const updatedUser = await User.findById(id);

    const fileContent = Buffer.from(req.files.file.data, 'binary');

    const params = {
      Bucket: process.env.S3_BUCKET_NAME,
      Key: `profile/images/${updatedUser._id}.jpeg`, // File name you want to save as in S3
      Body: fileContent,
    };

    s3.upload(params, (err, data) => {
      if (err) {
        res.send(err);
      }
    });
    updatedUser.profile_img_url = `https://${process.env.S3_BUCKET_NAME}.s3.us-east-2.amazonaws.com/profile/images/${updatedUser._id}.jpeg`;

    await updatedUser.save();
    return res
      .status(200)
      .json({ success: true, msg: 'File saved!', user: updatedUser });
  } catch (error) {
    return res.status(400).json({ success: false, msg: error.message });
  }
};
