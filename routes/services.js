const express = require('express');
const router = express.Router();
const controller = require('../controllers/services');
const passport = require('passport');

/* GET services page. */

router.get('/', passport.authenticate('jwt', {session: false}), controller.listServices);
router.post('/', passport.authenticate('jwt', {session: false}), controller.createService);
router.delete('/:service_id', passport.authenticate('jwt', {session: false}), controller.deleteService);
router.put('/:service_id', passport.authenticate('jwt', {session: false}), controller.modifyService);

module.exports = router;
