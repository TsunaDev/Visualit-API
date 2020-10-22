const express = require('express');
const router = express.Router();
const controller = require('../controllers/waiting');
const passport = require('passport');

/**
 * @swagger
 * definitions:
 *   WaitingTicket:
 *     properties:
 *       date:
 *         type: string
 *         example: "1597756460042"
 *       service:
 *         type: number
 *         example: 1
 *       room:
 *         type: string
 *         example: "24"
 *       bed:
 *         type: string
 *         example: "b2832c1c-027d-42b7-a2f6-23e7f35cf025"
 *       comment:
 *         type: string
 *         example: "Broken leg"
 */

/**
 * @swagger
 * /waiting:
 *   post:
 *     tags:
 *       - Liste d'attente
 *     description: "Ajoute un ticket dans la liste d'attente.<br>Permission: waiting.create"
 *     parameters:
 *       - name: service_id
 *         description: ID du service dans lequel il faut ajouter un ticket dans la liste d'attente.
 *         in: formData
 *         type: number
 *         required: true
 *       - name: room
 *         description: Précision de la chambre.
 *         in: formData
 *         type: number
 *         required: false
 *       - name: bed
 *         description: Précision du lit.
 *         in: formData
 *         type: string
 *         required: false
 *       - name: comment
 *         description: Commentaire éventuel.
 *         in: formData
 *         type: string
 *         required: false
 *     responses:
 *        201:
 *          description: Le ticket a été créé.
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
 * /waiting:
 *  put:
 *    tags:
 *      - Liste d'attente
 *    descritption: "Modifie les paramètres demandés sur un ticket.<br>Permission: waiting.update"
 *    parameters:
 *      - name: date
 *        description: Date à laquelle le ticket a été créé, sert à l'identification du ticket.
 *        in: formData
 *        type: string
 *        required: true
 *      - name: service_id
 *        description: ID du service remplaçant l'ancien.
 *        in: formData
 *        type: number
 *        required: false
 *      - name: room
 *        description: Chambre (numéro) remplaçant l'ancienne.
 *        in: formData
 *        type: string
 *        required: false
 *      - name: bed
 *        description: UUID du lit remplaçant l'ancien lit.
 *        in: formData
 *        type: string
 *        required: false
 *      - name: comment
 *        description: Nouveau commentaire.
 *        in: formData
 *        type: string
 *        required: false
 *    responses:
 *        202:
 *          description: Le ticket a été modifié.
 *        400:
 *          $ref: '#/responses/400BadRequest'
 *        401:
 *          $ref: '#/responses/401Unauthorized'
 *        404:
 *          $ref: '#/responses/404NotFound'
 *        500:
 *          $ref: '#/responses/500Internal'
 */
router.put('/', passport.authenticate('jwt', {session: false}), controller.update);

/**
 * @swagger
 * /waiting:
 *  delete:
 *    tags:
 *      - Liste d'attente
 *    description: "Supprime le ticket demandée.<br>Permission: waiting.delete"
 *    parameters:
 *      - name: date
 *        description: Date de création du ticket.
 *        in: formData
 *        required: true
 *        type: string
 *    responses:
 *      204:
 *        description: Le ticket a été supprimé.
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
 * /waiting:
 *  get:
 *    tags:
 *      - Liste d'attente
 *    description: "Renvoie la liste des ticket si aucun paramètre n'est donné. Si un service est indiqué, ne retourne que les tickets liés à ce service. <br>Permission: waiting.get"
 *    parameters:
 *      - name: service_id
 *        description: Préciser un service grâce à son ID.
 *        in: query
 *        required: false
 *        type: number
 *    responses:
 *      200:
 *        description: Requête valide, le/les ticket(s) demandé(s) sont dans la réponse.
 *        schema:
 *          type: array
 *          $ref: '#/definitions/WaitingTicket'
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

module.exports = router;
