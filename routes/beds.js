const express = require('express');
const router = express.Router();
const controller = require('../controllers/beds');
const passport = require('passport');

/* GET beds page. */

router.get('/', passport.authenticate('jwt', {session: false}), controller.listBeds);
router.get('/unbounded', passport.authenticate('jwt', {session: false}), controller.getUnboundedBed);
router.delete('/unbounded', passport.authenticate('jwt', {session: false}), controller.unboundedBedDelete);
router.post('/', passport.authenticate('jwt', {session: false}), controller.createBed);

router.get('/:bed_id', passport.authenticate('jwt', {session: false}), controller.getBed);
router.put('/:bed_id', passport.authenticate('jwt', {session: false}), controller.modifyBed);
router.delete('/:bed_id', passport.authenticate('jwt', {session: false}), controller.deleteBed);

router.post('/:bed_id/clean', passport.authenticate('jwt', {session: false}), controller.cleanlinessBed);
router.post('/:bed_id/status', passport.authenticate('jwt', {session: false}), controller.modifyBedState);
router.post('/:bed_id/name', passport.authenticate('jwt', {session: false}), controller.modifyBedName);
router.post('/:bed_id/service', passport.authenticate('jwt', {session: false}), controller.modifyBedService);

module.exports = router;
