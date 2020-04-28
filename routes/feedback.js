const express = require('express');
const router = express.Router();
const controller = require('../controllers/feedback');
const passport = require('passport');

router.post('/', passport.authenticate('jwt', {session: false}), controller.sendMessage);

module.exports = router;
