const express = require('express');
const router = express.Router();
const passport = require('passport');
const passportConfig = require('../auth/passport');
const postController = require('../controllers/postController');

const jwtAuth = passport.authenticate('jwt', { session: false });

/* GET users listing. */
router.get('/', function (req, res, next) {
  res.send('respond with a resource');
});

router.post('/newPost', postController.newPost);

module.exports = router;
