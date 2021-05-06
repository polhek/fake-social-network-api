const express = require('express');
const router = express.Router();
//! ne pozabi na vseh protectanih routih nardit tega, da requiraš file passport.js in passport nasploh
const passport = require('passport');
const passportConfig = require('../auth/passport');
const userController = require('../controllers/userController');

// Authentication variables ...
const jwtAuth = passport.authenticate('jwt', { session: false });
const fbAuth = passport.authenticate('facebookToken', { session: false });
/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index', { title: 'Express' });
});

router.post('/oauth/facebook', fbAuth, userController.facebookLogin);

// Protected API route, you can access it only by providing the valid token...
router.get('/secret', jwtAuth, (req, res, next) => {
  return res.json({ msg: 'You accessed a secret!' });
});

module.exports = router;
