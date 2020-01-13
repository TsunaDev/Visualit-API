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

router.patch('/:bed_id/clean', controller.cleanlinessBed);
router.patch('/:bed_id/status', controller.modifyBedState);
router.patch('/:bed_id/name', controller.modifyBedName);
router.patch('/:bed_id/service', controller.modifyBedService);

module.exports = router;
