const express = require('express');
const router = express.Router();
const passport = require('passport');
const passportConfig = require('../auth/passport');
const postController = require('../controllers/postController');

const jwtAuth = passport.authenticate('jwt', { session: false });

/* GET users listing. */
router.get('/', function (req, res) {
  res.send('respond with a resource');
});

router.get('/all', jwtAuth, postController.friendsOnlyPosts);

//CREATE new post...
router.post('/newPost', jwtAuth, postController.newPost);

//UPDATE post
router.put('/:id/update', postController.editPost);

// DELETE post by specifying id!
router.delete('/:id/remove', jwtAuth, postController.removePost);

module.exports = router;
