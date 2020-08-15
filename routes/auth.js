const express = require('express');
const router = express.Router();
const controller = require('../controllers/auth');
const passport = require('passport');

/**
 * @swagger
 * definitions:
 *   LoginResponse:
 *     properties:
 *       token:
 *         type: string
 *         example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImFkbWluIiwiaWF0IjoxNTk2ODk2ODYyLCJleHAiOjE1OTY5MzI4NjJ9._nxqcLRR2SrltQ8eOEcKAZuk6bKvjoWYP-RbU3_Yu58"
 *       expiresIn:
 *         type: number
 *         example: 3600
 *       permissions:
 *         type: array
 *         items:
 *           type: string
 *         example:
 *           - "beds.all"
 *           - "user.update.self"
 *   ErrorResponse:
 *     properties:
 *       name:
 *         type: string
 *       info:
 *         type: string
 *   UnauthorizedResponse:
 *     properties:
 *       name:
 *         type: string
 *         example: "PermissionDenied"
 *   NotFoundResponse:
 *     properties:
 *       name:
 *         type: string
 *         example: "ItemNotFound"
 *       info:
 *         type: string
 *         example: "Service corresponding to service_id 42 not found."
 * responses:
 *   400BadRequest:
 *     description: Un problème avec la requête d'origine a été détécté.
 *     schema:
 *       $ref: '#/definitions/ErrorResponse'
 *   401Unauthorized:
 *     description: L'utilisateur n'a pas les permissions nécessaire pour accéder à la route.
 *     schema:
 *       $ref: '#/definitions/UnauthorizedResponse'
 *   404NotFound:
 *     description: L'élément recherché est introuvable.
 *     schema:
 *       $ref: '#/definitions/NotFoundResponse'
 *   500Internal:
 *     description: Un problème est survenu sur le serveur. Veuillez en référer à un administrateur.
 */

/**
 * @swagger
 * /auth:
 *  post:
 *    tags:
 *      - Authentification
 *    description: Se connecter à l'API (récupérer un token d'authentification)
 *    parameters:
 *      - name: username
 *        description: Nom de l'utilisateur qui se connecte
 *        in: formData
 *        required: true
 *        type: string
 *      - name: password
 *        description: Mot de passe de l'utilisateur
 *        in: formData
 *        required: true
 *        type: string
 *    responses:
 *      200:
 *        description: Les informations correspondent à un utilisateur.
 *        schema:
 *          $ref: '#/definitions/LoginResponse'
 *      400:
 *        $ref: '#/responses/400BadRequest'
 *      500:
 *        $ref: '#/responses/500Internal'
 */
router.post('/', controller.logIn);

router.get('/amilogged', passport.authenticate('jwt', {session: false}), (req, res) => {
  return res.sendStatus(200)
});

module.exports = router;
