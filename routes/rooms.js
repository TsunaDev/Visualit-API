const express = require('express');
const router = express.Router();
const controller = require('../controllers/rooms');
const passport = require('passport');

/**
 * @swagger
 * definitions:
 *   RoomBedInfo:
 *     properties:
 *       uuid:
 *         type: string
 *         example: "3b76b911-287f-4c9a-9f9e-1de82b366995"
 *       to_clean:
 *         type: boolean
 *         example: false
 *       status:
 *         type: number
 *         example: 0
 *   RoomInfo:
 *     properties:
 *       number:
 *         type: string
 *         example: "12"
 *       serviceId:
 *         type: number
 *         example: 1
 *       beds:
 *         type: array
 *         items:
 *           $ref: "#/definitions/RoomBedInfo"
 */

/**
 * @swagger
 * /rooms:
 *   post:
 *     tags:
 *       - Chambres
 *     description: "Crée une chambre et ses lits.<br>Permission: rooms.create"
 *     parameters:
 *       - name: room_nb
 *         description: Numéro de la chambre. Il peut contenir des lettres.
 *         in: formData
 *         type: string
 *         required: true
 *       - name: service_id
 *         description: ID du service dans lequel la chambre se trouve.
 *         in: formData
 *         type: number
 *         required: true
 *       - name: beds
 *         description: Nombre de lits dans la chambre.
 *         in: formData
 *         type: number
 *         required: true
 *     responses:
 *        201:
 *          description: La chambre a été créée.
 *        400:
 *          $ref: '#/responses/400BadRequest'
 *        401:
 *          $ref: '#/responses/401Unauthorized'
 *        404:
 *          $ref: '#/responses/404NotFound'
 *        500:
 *          $ref: '#/responses/500Internal'
 */
router.post('/', passport.authenticate('jwt', {session: false}), controller.create);

/**
 * @swagger
 * /rooms/number:
 *  put:
 *    tags:
 *      - Chambres
 *    description: "Met à jour le numéro d'une chambre.<br>Permission: rooms.update"
 *    parameters:
 *      - name: room_nb
 *        description: Numéro actuel de la chambre.
 *        in: path
 *        required: true
 *        type: string
 *      - name: new_room_nb
 *        description: Nouveau numéro de la chambre.
 *        in: formData
 *        required: true
 *        type: string
 *      - name: service_id
 *        description: ID du service de la chambre.
 *        in: formData
 *        required: true
 *        type: number
 *    responses:
 *      202:
 *        description: Le numéro de la chambre a été modifé.
 *      400:
 *        $ref: '#/responses/400BadRequest'
 *      401:
 *        $ref: '#/responses/401Unauthorized'
 *      404:
 *        $ref: '#/responses/404NotFound'
 *      500:
 *        $ref: '#/responses/500Internal'
 */
router.put('/number', passport.authenticate('jwt', {session: false}), controller.updateNumber);

/**
 * @swagger
 * /rooms/service:
 *  put:
 *    tags:
 *      - Chambres
 *    description: "Met à jour le numéro d'une chambre.<br>Permission: rooms.update"
 *    parameters:
 *      - name: room_nb
 *        description: Numéro de la chambre.
 *        in: path
 *        required: true
 *        type: string
 *      - name: service_id
 *        description: ID du service actuel.
 *        in: formData
 *        required: true
 *        type: number
 *      - name: new_service_id
 *        description: ID du nouveau service de la chambre.
 *        in: formData
 *        required: true
 *        type: number
 *    responses:
 *      202:
 *        description: Le service de la chambre a été modifé.
 *      400:
 *        $ref: '#/responses/400BadRequest'
 *      401:
 *        $ref: '#/responses/401Unauthorized'
 *      404:
 *        $ref: '#/responses/404NotFound'
 *      500:
 *        $ref: '#/responses/500Internal'
 */
router.put('/service', passport.authenticate('jwt', {session: false}), controller.updateService);

/**
 * @swagger
 * /rooms:
 *  delete:
 *    tags:
 *      - Chambres
 *    description: "Supprime la chambre demandée.<br>Permission: rooms.delete"
 *    parameters:
 *      - name: room_nb
 *        description: Numéro de la chambre.
 *        in: path
 *        required: true
 *        type: string
 *      - name: service_id
 *        description: ID du service de la chambre.
 *        in: formData
 *        required: true
 *        type: number
 *    responses:
 *      204:
 *        description: La chambre a été supprimée.
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
 * /rooms:
 *  get:
 *    tags:
 *      - Chambres
 *    description: "Renvoie la liste des chambres si aucun paramètre n'est donné. Il est possible de renseigner une chambre et son service en paramètre pour la récupérer individuellement. Il est aussi possible de ne renseigné que le service pour récupérer toutes ses chambres. <br>Permission: rooms.get"
 *    parameters:
 *      - name: room_nb
 *        description: Numéro de la chambre (service_id obligatoire si renseigné).
 *        in: query
 *        required: false
 *        type: string
 *      - name: service_id
 *        description: ID du service des chambres.
 *        in: query
 *        required: false
 *        type: number
 *    responses:
 *      200:
 *        description: Requête valide, la/les chambre(s) demandé(s) sont dans la réponse.
 *        schema:
 *          type: array
 *          $ref: '#/definitions/RoomInfo'
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
 * /rooms/all:
 *  get:
 *    tags:
 *      - Chambres
 *    description: "Renvoie la liste de toutes les chambres existantes. Peut être filtré avec un service.<br>Permission: rooms.get"
 *    parameters:
 *      - name: service_id
 *        description: (filtre) ID du service pour lequel récupérer les chambres.
 *        in: query
 *        required: false
 *        type: number
 *    responses:
 *      200:
 *        description: Requête valide, les rôles sont dans la réponse.
 *        type: array
 *        schema:
 *          type: array
 *          $ref: '#/definitions/RoomInfo'
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
