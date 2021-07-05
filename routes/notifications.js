const express = require('express');
const router = express.Router();
const passport = require('passport');
const passportConfig = require('../auth/passport');
const notificationController = require('../controllers/notificationController');

const jwtAuth = passport.authenticate('jwt', { session: false });

router.delete('/:id/read', jwtAuth, notificationController.readNotification);

module.exports = router;
