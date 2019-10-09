const express = require('express');
const router = express.Router();
const controller = require('../controllers/services');

/* GET services page. */

router.get('/', controller.listServices);
router.post('/', controller.createService);
router.delete('/:service_id', controller.deleteService);
router.put('/:service_id', controller.modifyService);

module.exports = router;
