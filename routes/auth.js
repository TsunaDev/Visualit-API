const express = require('express');
const router = express.Router();
const controller = require('../controllers/auth');
const passport = require('passport');

/* GET home page. */

router.post('/', controller.logIn);

router.get('/amilogged', passport.authenticate('jwt', {session: false}), (req, res) => {
  return res.sendStatus(200)
});

module.exports = router;
