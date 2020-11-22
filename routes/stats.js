const express = require('express');
const router = express.Router();
const logs = require('../controllers/logs');
const passport = require('passport');

/**
 * @swagger
 * definitions:
 *    PatientNb:
 *      properties:
 *        date_begin:
 *          type: string
 *          example: "2020-11-22T20:22:11.854Z"
 *          description: "Date à laquelle les données débutent"
 *        date_end:
 *          type: string
 *          example: "2020-11-22T20:25:26.287Z"
 *          description: "Date à laquelle les données s'arrêtent"
 *        service_id:
 *          type: number
 *          example: 1
 *          description: "Identifiant du service"
 *        count:
 *          type: number
 *          example: 12
 *          description: "Nombre de patients dans le service"
 *    AverageStay:
 *      properties:
 *        service_id:
 *          type: number
 *          example: 1
 *          description: "Identifiant du service"
 *        duration:
 *          type: number
 *          example: 3856
 *          description: "Nombre de secondes moyen passé dans le service"
 *    AverageStayDay:
 *      properties:
 *        service_id:
 *          type: number
 *          example: 1
 *          description: "Identifiant du service"
 *        date:
 *          type: string
 *          example: "2020-11-22"
 *          description: "Date de la journée en question"
 *        duration:
 *          type: number
 *          example: 3856
 *          description: "Nombre de secondes moyen passé dans le service à une date"
 *    DaysIn:
 *      properties:
 *        service_id:
 *          type: number
 *          example: 1
 *          description: "Identifiant du service"
 *        count:
 *          type: number
 *          example: 15
 *          description: "Nombre de patients ayant sejourné cette durée"
 *        duration:
 *          type: number
 *          example: 4
 *          description: "Durée de séjour en jours (arrondis à l'entier le plus proche)"
 *    States:
 *      properties:
 *        service_id:
 *          type: number
 *          example: 1
 *          description: "Identifiant du service"
 *        state:
 *          type: number
 *          example: 0
 *          description: "Statut du lit (0-Libre, 1-Bientôt libre, 2-Occupé)"
 *        duration:
 *          type: number
 *          example: 12542
 *          description: "Durée totale passée dans cette état"
 */

/**
 * @swagger
 * /stats/patients:
 *  get:
 *    tags:
 *      - Statistiques
 *    description: "Renvoie le nombre de patients par service"
 *    parameters:
 *      - name: service_id
 *        description: (Filtre) ID du service.
 *        in: query
 *        required: false
 *        type: number
 *      - name: date_begin
 *        description: (Filtre) Date à partir de laquelle les données sont retournées
 *        in: query
 *        required: false
 *        type: string
 *      - name: date_end
 *        description: (Filtre) Date jusqu'où les données sont retournées
 *        in: query
 *        required: false
 *        type: string
 *    responses:
 *      200:
 *        description: Requête valide, le nombre de patients est retourné
 *        schema:
 *          type: array
 *          items:
 *            $ref: '#/definitions/PatientNb'
 *      401:
 *        $ref: '#/responses/401Unauthorized'
 *      500:
 *        $ref: '#/responses/500Internal'
 */
router.get('/patients', passport.authenticate('jwt', {session: false}), (req, res) => {
  const serviceId = req.query.service_id;
  const dateBegin = req.query.date_begin;
  const dateEnd = req.query.date_end;

  logs.getPatientNumber(serviceId, dateBegin, dateEnd).then(result => {
    res.status(200).send(result);
  }).catch(_ => {
    res.sendStatus(500);
  });
});

/**
 * @swagger
 * /stats/stay/avg:
 *  get:
 *    tags:
 *      - Statistiques
 *    description: "Renvoie la durée de séjour moyenne par service"
 *    parameters:
 *      - name: service_id
 *        description: (Filtre) ID du service.
 *        in: query
 *        required: false
 *        type: number
 *      - name: date_begin
 *        description: (Filtre) Date à partir de laquelle les données sont retournées
 *        in: query
 *        required: false
 *        type: string
 *      - name: date_end
 *        description: (Filtre) Date jusqu'où les données sont retournées
 *        in: query
 *        required: false
 *        type: string
 *    responses:
 *      200:
 *        description: Requête valide, la durée de séjour moyenne par service est retourné
 *        schema:
 *          type: array
 *          items:
 *            $ref: '#/definitions/AverageStay'
 *      401:
 *        $ref: '#/responses/401Unauthorized'
 *      500:
 *        $ref: '#/responses/500Internal'
 */
router.get('/stay/avg', passport.authenticate('jwt', {session: false}), (req, res) => {
  const serviceId = req.query.service_id;
  const dateBegin = req.query.date_begin;
  const dateEnd = req.query.date_end;

  logs.getStayAvg(serviceId, dateBegin, dateEnd).then(result => {
    res.status(200).send(result);
  }).catch(_ => {
    res.sendStatus(500);
  });
});

/**
 * @swagger
 * /stats/stay/avg/day:
 *  get:
 *    tags:
 *      - Statistiques
 *    description: "Renvoie la durée de séjour moyenne par service par jour"
 *    parameters:
 *      - name: service_id
 *        description: (Filtre) ID du service.
 *        in: query
 *        required: false
 *        type: number
 *      - name: date_begin
 *        description: (Filtre) Date à partir de laquelle les données sont retournées
 *        in: query
 *        required: false
 *        type: string
 *      - name: date_end
 *        description: (Filtre) Date jusqu'où les données sont retournées
 *        in: query
 *        required: false
 *        type: string
 *    responses:
 *      200:
 *        description: Requête valide, la durée de séjour moyenne par service et par jour est retourné
 *        schema:
 *          type: array
 *          items:
 *            $ref: '#/definitions/AverageStayDay'
 *      401:
 *        $ref: '#/responses/401Unauthorized'
 *      500:
 *        $ref: '#/responses/500Internal'
 */
router.get('/stay/avg/day', passport.authenticate('jwt', {session: false}), (req, res) => {
  const serviceId = req.query.service_id;
  const dateBegin = req.query.date_begin;
  const dateEnd = req.query.date_end;

  logs.getStayAvgDay(serviceId, dateBegin, dateEnd).then(result => {
    res.status(200).send(result);
  }).catch(_ => {
    res.sendStatus(500);
  });
});

/**
 * @swagger
 * /stats/stay/day:
 *  get:
 *    tags:
 *      - Statistiques
 *    description: "Renvoie combien de patients ont séjournés combien de jours, par service"
 *    parameters:
 *      - name: service_id
 *        description: (Filtre) ID du service.
 *        in: query
 *        required: false
 *        type: number
 *      - name: date_begin
 *        description: (Filtre) Date à partir de laquelle les données sont retournées
 *        in: query
 *        required: false
 *        type: string
 *      - name: date_end
 *        description: (Filtre) Date jusqu'où les données sont retournées
 *        in: query
 *        required: false
 *        type: string
 *    responses:
 *      200:
 *        description: Requête valide, la response est retournée
 *        schema:
 *          type: array
 *          items:
 *            $ref: '#/definitions/DaysIn'
 *      401:
 *        $ref: '#/responses/401Unauthorized'
 *      500:
 *        $ref: '#/responses/500Internal'
 */
router.get('/stay/day', passport.authenticate('jwt', {session: false}), (req, res) => {
  const serviceId = req.query.service_id;
  const dateBegin = req.query.date_begin;
  const dateEnd = req.query.date_end;

  logs.getDaysIn(serviceId, dateBegin, dateEnd).then(result => {
    res.status(200).send(result);
  }).catch(_ => {
    res.sendStatus(500);
  });
});

/**
 * @swagger
 * /stats/states:
 *  get:
 *    tags:
 *      - Statistiques
 *    description: "Renvoie combien de temps est passé dans chaque état (de lit) par service"
 *    parameters:
 *      - name: service_id
 *        description: (Filtre) ID du service.
 *        in: query
 *        required: false
 *        type: number
 *      - name: date_begin
 *        description: (Filtre) Date à partir de laquelle les données sont retournées
 *        in: query
 *        required: false
 *        type: string
 *      - name: date_end
 *        description: (Filtre) Date jusqu'où les données sont retournées
 *        in: query
 *        required: false
 *        type: string
 *    responses:
 *      200:
 *        description: Requête valide, la response est retournée
 *        schema:
 *          type: array
 *          items:
 *            $ref: '#/definitions/States'
 *      401:
 *        $ref: '#/responses/401Unauthorized'
 *      500:
 *        $ref: '#/responses/500Internal'
 */
router.get('/states', passport.authenticate('jwt', {session: false}), (req, res) => {
  const serviceId = req.query.service_id;
  const dateBegin = req.query.date_begin;
  const dateEnd = req.query.date_end;

  logs.getStateDuration(serviceId, dateBegin, dateEnd).then(result => {
    res.status(200).send(result);
  }).catch(_ => {
    res.sendStatus(500);
  });
});

module.exports = router;
