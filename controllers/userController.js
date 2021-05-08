const User = require('../models/user');
const utils = require('../utils/utils');

exports.facebookLogin = async (req, res, next) => {
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
