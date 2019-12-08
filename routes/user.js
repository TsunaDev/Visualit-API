const express = require('express');
const router = express.Router();
const controller = require('../controllers/user');
const passport = require('passport');

/* CRUD */

router.post('/', controller.register);

router.get('/', passport.authenticate('jwt', {session: false}), controller.fetchInfos);

router.put('/', passport.authenticate('jwt', {session: false}), controller.update);

router.delete('/', passport.authenticate('jwt', {session: false}), controller.delete);

router.get('/all', passport.authenticate('jwt', {session: false}), controller.getAllUsers);


module.exports = router;
