const express = require('express');
const router = express.Router();
const controller = require('../controllers/roles');
const passport = require('passport');

/* CRUD */

router.post('/', passport.authenticate('jwt', {session: false}), controller.create);

router.get('/', controller.get);

router.get('/all', controller.getAllRoles);

router.put('/', passport.authenticate('jwt', {session: false}), controller.update);

router.delete('/', passport.authenticate('jwt', {session: false}), controller.delete);

module.exports = router;
