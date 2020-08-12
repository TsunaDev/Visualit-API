const express = require('express');
const router = express.Router();
const controller = require('../controllers/services');
const passport = require('passport');

/**
 * @swagger
 * /services:
 *  get:
 *    tags:
 *      - Services
 *    description: "Renvoie la liste de tous les services.<br>Permission: services.get"
 *    responses:
 *      200:
 *        description: Requête valide, les services sont dans la réponse.
 *        schema:
 *          type: array
 *          items:
 *            type: object
 *            properties:
 *              id:
 *                type: number
 *                example: 1
 *              name:
 *                type: string
 *                example: "Urgences"
 *      400:
 *        $ref: '#/responses/400BadRequest'
 *      401:
 *        $ref: '#/responses/401Unauthorized'
 *      404:
 *        $ref: '#/responses/404NotFound'
 *      500:
 *        $ref: '#/responses/500Internal'
 */
router.get('/', passport.authenticate('jwt', {session: false}), controller.listServices);

/**
 * @swagger
 * /services:
 *  post:
 *    tags:
 *      - Services
 *    description: "Crée un nouveau service.<br>Permission: services.create"
 *    parameters:
 *      - name: name
 *        description: Nom du service.
 *        in: formData
 *        required: true
 *        type: string
 *    responses:
 *      201:
 *        description: Le service a été créé.
 *      400:
 *        $ref: '#/responses/400BadRequest'
 *      401:
 *        $ref: '#/responses/401Unauthorized'
 *      404:
 *        $ref: '#/responses/404NotFound'
 *      500:
 *        $ref: '#/responses/500Internal'
 */
router.post('/', passport.authenticate('jwt', {session: false}), controller.createService);

/**
 * @swagger
 * /services/{service_id}:
 *  delete:
 *    tags:
 *      - Services
 *    description: "Supprime le service demandé.<br>Permission: services.delete"
 *    parameters:
 *      - name: service_id
 *        description: ID du service à supprimer.
 *        in: path
 *        required: true
 *        type: number
 *    responses:
 *      204:
 *        description: Le service a été supprimé.
 *      400:
 *        $ref: '#/responses/400BadRequest'
 *      401:
 *        $ref: '#/responses/401Unauthorized'
 *      404:
 *        $ref: '#/responses/404NotFound'
 *      500:
 *        $ref: '#/responses/500Internal'
 */
router.delete('/:service_id', passport.authenticate('jwt', {session: false}), controller.deleteService);

/**
 * @swagger
 * /services/{service_id}:
 *  put:
 *    tags:
 *      - Services
 *    description: "Modifie le nom d'un service.<br>Permission: services.update"
 *    parameters:
 *      - name: service_id
 *        description: ID du service à modifier.
 *        in: path
 *        required: true
 *        type: number
 *      - name: name
 *        description: Nouveau nom pour le service.
 *        in: formData
 *        required: true
 *        type: string
 *    responses:
 *      202:
 *        description: Le service a été modifié.
 *      400:
 *        $ref: '#/responses/400BadRequest'
 *      401:
 *        $ref: '#/responses/401Unauthorized'
 *      404:
 *        $ref: '#/responses/404NotFound'
 *      500:
 *        $ref: '#/responses/500Internal'
 */
router.put('/:service_id', passport.authenticate('jwt', {session: false}), controller.modifyService);

module.exports = router;
