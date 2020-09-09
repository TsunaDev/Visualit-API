const express = require('express');
const router = express.Router();
const logs = require('../controllers/logs');
const passport = require('passport');

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
