const jwt = require('jsonwebtoken');
require('dotenv').config();

const secretOrKey = process.env.secretOrKey;

// issue new JWT token with users info - in my case ._id ...
const issueJwtToken = (user) => {
  const _id = user._id;
  const expiresIn = '1d';

  const payload = {
    sub: _id,
    iat: Date.now(),
  };

  const signedToken = jwt.sign(payload, secretOrKey, {
    expiresIn: expiresIn,
  });

  return { token: `Bearer ${signedToken}`, expires: expiresIn };
};

module.exports.issueJwtToken = issueJwtToken;
