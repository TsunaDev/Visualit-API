const express = require('express');
const router = express.Router();
const controller = require('../controllers/beds');
const passport = require('passport');


/**
 * @swagger
 * definitions:
 *   BedInfo:
 *     properties:
 *       uuid:
 *         type: string
 *         example: "b2832c1c-027d-42b7-a2f6-23e7f35cf025"
 *       room:
 *         description: Numéro de la chambre dans laquelle se trouve le lit
 *         type: string
 *         example: "24"
 *       service:
 *         description: ID du service hospitalier
 *         type: number
 *         example: 4
 *       status:
 *         description: 0 - Lit libre, 1 - Le patient est en train de quitter la chambre, 2 - Occupé
 *         type: number
 *         example: 1
 *       to_clean:
 *         description: True si le lit est à nettoyer, false dans le cas contraire.
 *         type: boolean
 */

/**
 * @swagger
 * /beds:
 *  get:
 *    tags:
 *      - Lits
 *    description: "Renvoie une liste de lits en fonctions des filtres donnés.<br>Permission: beds.get"
 *    parameters:
 *      - name: room_nb
 *        description: (filtre) Numéro de chambre (Si ce dernier est renseigné, service_id est obligatoire)
 *        in: formData
 *        required: false
 *        type: string
 *      - name: service_id
 *        description: (filtre) ID d'un service spécifique.
 *        in: formData
 *        required: false
 *        type: number
 *      - name: status
 *        description: (filtre) Statut que l'on recherche (0-Libre, 1-Bientôt libre, 2-Occupée)
 *        required: false
 *        in: formData
 *        type: number
 *      - name: to_clean
 *        description: (filtre) Si true, ne renvoie que les lits à nettoyer, l'inverse avec false.
 *        required: false
 *        in: formData
 *        type: boolean
 *    responses:
 *      200:
 *        description: Requête valide, les lits demandés sont dans la réponse.
 *        schema:
 *          type: array
 *          $ref: '#/definitions/BedInfo'
 *      400:
 *        $ref: '#/responses/400BadRequest'
 *      401:
 *        $ref: '#/responses/401Unauthorized'
 *      404:
 *        $ref: '#/responses/404NotFound'
 *      500:
 *        $ref: '#/responses/500Internal'
 */
router.get('/', passport.authenticate('jwt', {session: false}), controller.list);

/**
 * @swagger
 * /beds:
 *  post:
 *    tags:
 *      - Lits
 *    description: "Crée un nouveau lit.<br>Permission: beds.create"
 *    parameters:
 *      - name: room_nb
 *        description: Numéro de la chambre dans laquelle se trouve le lit.
 *        in: formData
 *        required: true
 *        type: string
 *      - name: service_id
 *        description: ID du service.
 *        in: formData
 *        required: true
 *        type: number
 *      - name: status
 *        description: Statut du lit (0-Libre, 1-Bientôt libre, 2-Occupée). Libre par défaut.
 *        required: false
 *        in: formData
 *        type: number
 *      - name: to_clean
 *        description: True si le lit est à nettoyer, false dans le cas contraire. False par défaut.
 *        required: false
 *        in: formData
 *        type: boolean
 *    responses:
 *      201:
 *        description: Le lit a été créé.
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
 * /beds/{uuid}:
 *  get:
 *    tags:
 *      - Lits
 *    description: "Renvoie le lit demandé en réponse.<br>Permission: beds.get"
 *    parameters:
 *      - name: uuid
 *        description: UUID du lit recherché.
 *        in: path
 *        required: true
 *        type: string
 *    responses:
 *      200:
 *        description: Requête valide, les informations du lit sont dans la réponse.
 *        schema:
 *          $ref: '#/definitions/BedInfo'
 *      400:
 *        $ref: '#/responses/400BadRequest'
 *      401:
 *        $ref: '#/responses/401Unauthorized'
 *      404:
 *        $ref: '#/responses/404NotFound'
 *      500:
 *        $ref: '#/responses/500Internal'
 */
router.get('/:bed_uuid', passport.authenticate('jwt', {session: false}), controller.get);

/**
 * @swagger
 * /beds/{uuid}:
 *  delete:
 *    tags:
 *      - Lits
 *    description: "Supprime le lit demandé.<br>Permission: beds.delete"
 *    parameters:
 *      - name: uuid
 *        description: UUID du lit à supprimer.
 *        in: path
 *        required: true
 *        type: string
 *    responses:
 *      204:
 *        description: Le lit a été supprimé.
 *      400:
 *        $ref: '#/responses/400BadRequest'
 *      401:
 *        $ref: '#/responses/401Unauthorized'
 *      404:
 *        $ref: '#/responses/404NotFound'
 *      500:
 *        $ref: '#/responses/500Internal'
 */
router.delete('/:bed_uuid', passport.authenticate('jwt', {session: false}), controller.delete);

/**
 * @swagger
 * /beds/{uuid}/clean:
 *  put:
 *    tags:
 *      - Lits
 *    description: "Modifie l'état de nettoyage du lit.<br>Permission: beds.update_clean"
 *    parameters:
 *      - name: uuid
 *        description: UUID du lit.
 *        in: path
 *        required: true
 *        type: string
 *      - name: to_clean
 *        description: True si le lit est à nettoyer, false dans le cas contraire.
 *        in: formData
 *        required: true
 *        type: boolean
 *    responses:
 *      202:
 *        description: L'état a été modifié.
 *      400:
 *        $ref: '#/responses/400BadRequest'
 *      401:
 *        $ref: '#/responses/401Unauthorized'
 *      404:
 *        $ref: '#/responses/404NotFound'
 *      500:
 *        $ref: '#/responses/500Internal'
 */
router.put('/:bed_uuid/clean', passport.authenticate('jwt', {session: false}), controller.updateCleanState);

/**
 * @swagger
 * /beds/{uuid}/status:
 *  put:
 *    tags:
 *      - Lits
 *    description: "Modifie le statut du lit.<br>Permission: beds.update_status"
 *    parameters:
 *      - name: uuid
 *        description: UUID du lit.
 *        in: path
 *        required: true
 *        type: string
 *      - name: status
 *        description: Statut du lit (0-Libre, 1-Bientôt libre, 2-Occupée).
 *        in: formData
 *        required: true
 *        type: number
 *    responses:
 *      202:
 *        description: Le statut a été modifié.
 *      400:
 *        $ref: '#/responses/400BadRequest'
 *      401:
 *        $ref: '#/responses/401Unauthorized'
 *      404:
 *        $ref: '#/responses/404NotFound'
 *      500:
 *        $ref: '#/responses/500Internal' */
router.put('/:bed_uuid/status', passport.authenticate('jwt', {session: false}), controller.updateStatus);

/**
 * @swagger
 * /beds/{uuid}/room:
 *  put:
 *    tags:
 *      - Lits
 *    description: "Modifie la chambre à laquelle le lit est affecté.<br>Permission: beds.update_room"
 *    parameters:
 *      - name: uuid
 *        description: UUID du lit.
 *        in: path
 *        required: true
 *        type: string
 *      - name: room_nb
 *        description: Numéro de la nouvelle chambre.
 *        in: formData
 *        required: true
 *        type: string
 *      - name: service_id
 *        description: ID du service.
 *        in: formData
 *        required: true
 *        type: number
 *    responses:
 *      202:
 *        description: Le lit a été affecté à la nouvelle chambre.
 *      400:
 *        $ref: '#/responses/400BadRequest'
 *      401:
 *        $ref: '#/responses/401Unauthorized'
 *      404:
 *        $ref: '#/responses/404NotFound'
 *      500:
 *        $ref: '#/responses/500Internal'
 */
router.put('/:bed_uuid/room', passport.authenticate('jwt', {session: false}), controller.updateRoom);

module.exports = router;
