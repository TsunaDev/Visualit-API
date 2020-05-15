const express = require('express');
const router = express.Router();
const controller = require('../controllers/etl');
const passport = require('passport');

router.post('/', controller.import);

module.exports = router;