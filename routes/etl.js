const express = require('express');
const router = express.Router();
const controller = require('../controllers/etl');
const passport = require('passport');

/**
 * @swagger
 * /import/rooms:
 *  post:
 *    tags:
 *      - Divers
 *    description: "Récupère un fichier CSV et importe les chambres, services et lits qu'il contient.<br>Permission: etl.import"
 *    parameters:
 *      - name: data
 *        description: Fichier CSV avec pour entête "room, service, nb_beds", "room" représentant le numéro de la chambre, "service" étant le nom du service dans lequel se trouve la chambre et "nb_beds" est le nombre de lits à créer dans la chambre.
 *        in: formData
 *        required: true
 *        type: file
 *    responses:
 *      200:
 *        description: L'import a été effectué.
 *      401:
 *        $ref: '#/responses/401Unauthorized'
 */
router.post('/rooms', passport.authenticate('jwt', {session: false}), controller.rooms);

/**
 * /import/users:
 *  post:
 *    tags:
 *      - Divers
 *    description: "Récupère un fichier CSV et importe les utilisateurs qu'il contient.<br>Permission: etl.import"
 *    parameters:
 *      - name: data
 *        description: Fichier CSV avec pour entête "user, password, role", "user" représentant le nom d'utilisateur, "password" le mot de passe et "role" l'index du rôle.
 *        in: formData
 *        required: true
 *        type: file
 *    responses:
 *      200:
 *        description: L'import a été effectué.
 *      401:
 *        $ref: '#/responses/401Unauthorized'
 */
router.post('/users', passport.authenticate('jwt', {session: false}), controller.users);

module.exports = router;