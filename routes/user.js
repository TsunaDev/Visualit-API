const express = require('express');
const router = express.Router();
const controller = require('../controllers/user');
const passport = require('passport');

/* CRUD */

router.post('/', controller.register);

router.put('/', passport.authenticate('jwt', {session: false}), controller.update);

router.get('/', passport.authenticate('jwt', {session: false}), controller.fetchInfos);

router.get('/all', passport.authenticate('jwt', {session: false}), controller.getAllUsers);

router.delete('/', passport.authenticate('jwt', {session: false}), controller.delete);

module.exports = router;
