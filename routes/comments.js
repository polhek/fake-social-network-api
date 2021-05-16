const express = require('express');
const router = express.Router();
const passport = require('passport');
const passportConfig = require('../auth/passport');
const commentController = require('../controllers/commentController');

const jwtAuth = passport.authenticate('jwt', { session: false });

router.post('/:id/new-comment', jwtAuth, commentController.newComment);

router.delete(
  '/:post_id/comment/:id/delete',
  jwtAuth,
  commentController.deleteComment
);

module.exports = router;
