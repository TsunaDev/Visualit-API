const express = require('express');
const router = express.Router();
const controller = require('../controllers/qrcode');

/**
 * @swagger
 * /qr/generate:
 *  get:
 *    tags:
 *      - Divers
 *    description: Génère et renvoie un QRCode sous format PNG en fonction d'un UUID reçu en paramètre.
 *    parameters:
 *      - name: code
 *        description: UUID d'un lit pour lequel il faut générer un QRCode.
 *        in: formData
 *        required: true
 *        type: string
 *    responses:
 *      200:
 *        description: Vous êtes redirigé sur l'image généré.
 */
router.get('/generate', controller.generate);

module.exports = router;