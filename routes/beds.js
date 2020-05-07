const express = require('express');
const router = express.Router();
const controller = require('../controllers/beds');
const passport = require('passport');

/* GET beds page. */

router.get('/', passport.authenticate('jwt', {session: false}), controller.listBeds);
router.post('/', passport.authenticate('jwt', {session: false}), controller.createBed);

router.get('/:bed_uuid', passport.authenticate('jwt', {session: false}), controller.getBed);
router.delete('/:bed_uuid', passport.authenticate('jwt', {session: false}), controller.deleteBed);

router.put('/:bed_uuid/clean', passport.authenticate('jwt', {session: false}), controller.cleanlinessBed);
router.put('/:bed_uuid/status', passport.authenticate('jwt', {session: false}), controller.modifyBedStatus);
router.put('/:bed_uuid/room', passport.authenticate('jwt', {session: false}), controller.modifyBedRoom);

module.exports = router;
