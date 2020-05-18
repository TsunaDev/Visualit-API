const express = require('express');
const router = express.Router();
const controller = require('../controllers/qrcode');

router.get('/',  (req, res) => {
  res.render('index', { title: 'Express' });
});

router.get('/generate', controller.generate);

module.exports = router;