const express = require('express');
const router = express.Router();
const controller = require('../controllers/users');
const passport = require('passport');

/**
 * @swagger
 * definitions:
 *   UserInfo:
 *     properties:
 *       name:
 *         description: Nom de compte de l'utilisateur.
 *         type: string
 *         example: "user"
 *       role:
 *         description: Index du rôle de l'utilisateur.
 *         type: number
 *         example: 1
 */

/**
 * @swagger
 * /users:
 *  post:
 *    tags:
 *      - Utilisateurs
 *    description: "Crée un nouvel utilisateur. <br>Permission: user.create"
 *    parameters:
 *      - name: username
 *        description: Nom de compte pour l'utilisateur.
 *        in: formData
 *        required: true
 *        type: string
 *      - name: password
 *        description: Mot de passe pour l'utilisateur.
 *        in: formData
 *        required: true
 *        type: string
 *      - name: role
 *        description: Index du rôle à affecter à l'utilisateur.
 *        required: true
 *        in: formData
 *        type: number
 *    responses:
 *      201:
 *        description: L'utilisateur a été créé.
 *      400:
 *        $ref: '#/responses/400BadRequest'
 *      401:
 *        $ref: '#/responses/401Unauthorized'
 *      404:
 *        $ref: '#/responses/404NotFound'
 *      500:
 *        $ref: '#/responses/500Internal'
 */
router.post('/', passport.authenticate('jwt', {session: false}), controller.create);

/**
 * @swagger
 * /users:
 *  get:
 *    tags:
 *      - Utilisateurs
 *    description: "Permet de récupérer les informations d'un utilisateur. Si un nom d'utilisateur n'est pas renseigné, renvoie les informations de l'utilisateur originaire de la requête. <br>Permissions: user.get.self ou user.get.others"
 *    parameters:
 *      - name: username
 *        description: Nom de l'utilisateur recherché.
 *        in: formData
 *        required: false
 *        type: string
 *    responses:
 *      200:
 *        description: Requête valide, les informations de l'utilisateur demandé sont dans la réponse.
 *        schema:
 *          type: object
 *          $ref: '#/definitions/UserInfo'
 *      400:
 *        $ref: '#/responses/400BadRequest'
 *      401:
 *        $ref: '#/responses/401Unauthorized'
 *      404:
 *        $ref: '#/responses/404NotFound'
 *      500:
 *        $ref: '#/responses/500Internal'
 */
router.get('/', passport.authenticate('jwt', {session: false}), controller.get);

/**
 * @swagger
 * /users:
 *  put:
 *    tags:
 *      - Utilisateurs
 *    description: "Met à jour les informations d'un utilisateur. <br>Permissions: user.update.self ou user.update.others"
 *    parameters:
 *      - name: username
 *        description: Nom de l'utilisateur. Si il n'est pas renseigné, l'utilisateur cible sera l'utilisateur à l'origine de la requête.
 *        in: formData
 *        required: false
 *        type: string
 *      - name: password
 *        description: Nouveau mot de passe.
 *        in: formData
 *        required: false
 *        type: string
 *      - name: name
 *        description: Nouveau nom d'utilisateur.
 *        in: formData
 *        type: string
 *        required: false
 *    responses:
 *      202:
 *        description: Les informations ont été modifiées.
 *      400:
 *        $ref: '#/responses/400BadRequest'
 *      401:
 *        $ref: '#/responses/401Unauthorized'
 *      404:
 *        $ref: '#/responses/404NotFound'
 *      500:
 *        $ref: '#/responses/500Internal'
 */
router.put('/', passport.authenticate('jwt', {session: false}), controller.update);

/**
 * @swagger
 * /users:
 *  delete:
 *    tags:
 *      - Utilisateurs
 *    description: "Supprime l'utilisateur demandé. <br>Permissions: user.delete.self ou user.delete.others"
 *    parameters:
 *      - name: username
 *        description: Nom de l'utilisateur à supprimer.
 *        in: formData
 *        required: true
 *        type: string
 *    responses:
 *      204:
 *        description: L'utilisateur a été supprimé.
 *      400:
 *        $ref: '#/responses/400BadRequest'
 *      401:
 *        $ref: '#/responses/401Unauthorized'
 *      404:
 *        $ref: '#/responses/404NotFound'
 *      500:
 *        $ref: '#/responses/500Internal'
 */
router.delete('/', passport.authenticate('jwt', {session: false}), controller.delete);

/**
 * @swagger
 * /users/all:
 *  get:
 *    tags:
 *      - Utilisateurs
 *    description: "Renvoie la liste de tous les utilisateurs existants. Permission: user.get_all"
 *    responses:
 *      200:
 *        description: Requête valide, les utilisateurs sont dans la réponse.
 *        schema:
 *          type: array
 *          items:
 *            $ref: '#/definitions/UserInfo'
 *      400:
 *        $ref: '#/responses/400BadRequest'
 *      401:
 *        $ref: '#/responses/401Unauthorized'
 *      404:
 *        $ref: '#/responses/404NotFound'
 *      500:
 *        $ref: '#/responses/500Internal'
 */
router.get('/all', passport.authenticate('jwt', {session: false}), controller.getAll);


module.exports = router;
