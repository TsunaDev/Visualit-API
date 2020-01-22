const express = require('express');
const router = express.Router();
const controller = require('../controllers/beds');

/* GET beds page. */

router.get('/', controller.listBeds);
router.get('/unbounded', controller.getUnboundedBed);
router.delete('/unbounded', controller.unboundedBedDelete);
router.post('/', controller.createBed);

router.get('/:bed_id', controller.getBed);
router.put('/:bed_id', controller.modifyBed);
router.delete('/:bed_id', controller.deleteBed);

router.post('/:bed_id/clean', controller.cleanlinessBed);
router.post('/:bed_id/status', controller.modifyBedState);
router.post('/:bed_id/name', controller.modifyBedName);
router.post('/:bed_id/service', controller.modifyBedService);

module.exports = router;
