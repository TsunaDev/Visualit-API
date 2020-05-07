const express = require('express');
const router = express.Router();
const controller = require('../controllers/room');
const passport = require('passport');

router.post('/', passport.authenticate('jwt', {session: false}), controller.create);
router.put('/number', passport.authenticate('jwt', {session: false}), controller.updateRoomNumber);
router.put('/service', passport.authenticate('jwt', {session: false}), controller.updateRoomService);
router.delete('/', passport.authenticate('jwt', {session: false}), controller.deleteRoom);
router.get('/', passport.authenticate('jwt', {session: false}), controller.getRoom);
router.get('/all', passport.authenticate('jwt', {session: false}), controller.getAllRooms);


module.exports = router;
