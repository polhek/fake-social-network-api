const express = require('express');
const router = express.Router();

const passport = require('passport');
const passportConfig = require('../auth/passport');
const userController = require('../controllers/userController');

// Authentication variables ...
const jwtAuth = passport.authenticate('jwt', { session: false });
const fbAuth = passport.authenticate('facebookToken', { session: false });

/* GET home page. */
router.get('/', function (req, res) {
  res.render('index', { title: 'Express' });
});

router.post('/oauth/facebook', fbAuth, userController.facebookLogin);

// Send friend request!
router.post('/:id/sendRequest', jwtAuth, userController.sendFriendRequest);

router.put('/:id/accept-friend', jwtAuth, userController.acceptFriend);

// cancel send friend request!
router.delete(
  '/:id/cancel-friend',
  jwtAuth,
  userController.cancelSendFriendRequest
);

// remove friend
router.delete('/:id/remove-friend', jwtAuth, userController.removeFriend);

// Protected API route, you can access it only by providing the valid token...
router.get('/secret', jwtAuth, (req, res) => {
  return res.json({ msg: 'You accessed a secret!' });
});

// userprofile
router.get('/profile', jwtAuth, userController.userProfile);

module.exports = router;
