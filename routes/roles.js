const express = require('express');
const router = express.Router();
const controller = require('../controllers/roles');
const passport = require('passport');

/**
 * @swagger
 * definitions:
 *   RoleInfo:
 *     properties:
 *       name:
 *         type: string
 *         example: "admin"
 *       index:
 *         type: number
 *         example: 1
 *       permissions:
 *         type: array
 *         items:
 *           type: string
 *         example:
 *           - "beds.all"
 *           - "user.update.self"
 */

/**
 * @swagger
 * /roles:
 *  post:
 *    consumes:
 *      - multipart/form-data
 *    tags:
 *      - Rôles
 *    description: "Crée un nouveau rôle.<br>Permission: roles.create"
 *    parameters:
 *      - name: role
 *        description: Nom du rôle.
 *        in: formData
 *        required: true
 *        type: string
 *      - name: index
 *        description: Indexe du rôle.
 *        in: formData
 *        required: true
 *        type: number
 *      - name: permissions
 *        description: Liste des permissions attribuées au rôle. Les permissions se représentent sous forme de "ressource.route" par exemple "beds.update" pour connaître les permissions nécessaires pour accéder à une route, veuillez vous référer à la description de la route en question.
 *        in: formData
 *        type: array
 *        items:
 *          type: string
 *        collectionFormat: multi
 *        required: true
 *    responses:
 *      201:
 *        description: Le rôle a été créé.
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
 * /roles:
 *  get:
 *    tags:
 *      - Rôles
 *    description: "Renvoie la liste des rôles si aucun paramètre n'est donné. Il est possible de renseigner un rôle en paramètre avec son nom ou son indexe pour en récupérer les informations.<br>Permission: roles.get"
 *    parameters:
 *      - name: role
 *        description: Nom du rôle recherché.
 *        in: query
 *        required: false
 *        type: string
 *      - name: index
 *        description: Indexe du rôle recherché.
 *        in: query
 *        required: false
 *        type: number
 *    responses:
 *      200:
 *        description: Requête valide, le(s) rôle(s) demandé(s) sont dans la réponse.
 *        schema:
 *          type: array
 *          $ref: '#/definitions/RoleInfo'
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
 * /roles/all:
 *  get:
 *    tags:
 *      - Rôles
 *    description: "Renvoie la liste de tous les rôles existants.<br>Permission: roles.get"
 *    responses:
 *      200:
 *        description: Requête valide, les rôles sont dans la réponse.
 *        schema:
 *          type: array
 *          $ref: '#/definitions/RoleInfo'
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

/**
 * @swagger
 * /roles:
 *  put:
 *    consumes:
 *      - multipart/form-data
 *    tags:
 *      - Rôles
 *    description: "Met à jour les permissions d'un rôle. Il faut renseigner le nom ou l'indexe du rôle.<br>Permission: roles.update"
 *    parameters:
 *      - name: role
 *        description: Nom du rôle. 
 *        in: formData
 *        required: false
 *        type: string
 *      - name: index
 *        description: Indexe du rôle.
 *        in: formData
 *        required: true
 *        type: number
 *      - name: permissions
 *        description: Liste des permissions attribuées au rôle. Vous trouverez les permissions nécessaires à chaque route dans la documentation de ces dernières.
 *        in: formData
 *        type: array
 *        items:
 *          type: string
 *        collectionFormat: multi
 *        required: true
 *    responses:
 *      202:
 *        description: Les permissions ont été modifiées.
 *      400:
 *        $ref: '#/responses/400BadRequest'
 *      401:
 *        $ref: '#/responses/401Unauthorized'
 *      404:
 *        $ref: '#/responses/404NotFound'
 *      500:
 *        $ref: '#/responses/500Internal'
 */
router.put('/', passport.authenticate('jwt', {session: false}), controller.updatePermissions);

/**
 * @swagger
 * /roles:
 *  delete:
 *    tags:
 *      - Rôles
 *    description: "Supprime le rôle demandé (Il faut au moins renseigné l'un des deux paramètres).<br>Permission: roles.delete"
 *    parameters:
 *      - name: role
 *        description: Nom du rôle.
 *        in: formData
 *        required: false
 *        type: string
 *      - name: index
 *        description: Indexe du rôle
 *        in: formData
 *        required: false
 *        type: number
 *    responses:
 *      204:
 *        description: Le rôle a été supprimé.
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

module.exports = router;
