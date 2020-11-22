const {BedStateEvent} = require("../models/bed_event");
const {Sequelize, Op} = require('sequelize');


const genFilter = (serviceId, dateBegin, dateEnd) => {
  let filter = {};
  if (serviceId && Array.isArray(serviceId)) filter.serviceID = {[Op.in]: serviceId};
  else if (serviceId) filter.serviceID = {[Op.eq]: serviceId};
  if (dateBegin) filter.dateBegin = {[Op.gte]: dateBegin};
  if (dateEnd) {
    filter.dateEnd = {[Op.lt]: Sequelize.literal(`'${dateEnd}' + INTERVAL 1 DAY`)};
  }
  return filter;
};

const bedUpdateEvent = (bedInfo) => {
  const now = Date.now();
  const elem = BedStateEvent.build({
    bedID: bedInfo.bed_uuid,
    serviceID: bedInfo.service_id,
    userRole: bedInfo.user_role,
    oldState: bedInfo.state.old,
    newState: bedInfo.state.new,
    dateBegin: now
  });
  BedStateEvent.findOne({
    where: {bedID: {[Op.eq]: bedInfo.bed_uuid}},
    order: [['id', 'DESC']],
    limit: 1
  }).then(bed => {
    if (bed && !bed.dateEnd) {
      const update = BedStateEvent.update({
        dateEnd: now
      }, {
        where: {
          id: {[Op.eq]: bed.id},
        },
      })
      return Promise.all([update, elem.save()]);
    } else {
      return elem.save();
    }
  }).catch(_ => elem.save())
};

module.exports = {
  bedUpdateEvent,

  /**
   * Récupère le nombre de patients par service
   * @param {number | string} [serviceId] (Filtre) ID du service.
   * @param {date | string} [dateBegin] (Filtre) Date de début de la requête
   * @param {date | string} [dateEnd] (Filtre) Date de fin de la requête
   * @returns {json} Le nombre de patients par service
   */
  getPatientNumber: (serviceId, dateBegin, dateEnd) => {
    let filter = genFilter(serviceId, dateBegin, dateEnd);
    filter.newState = {[Op.eq]: 2}

    return BedStateEvent.findAll({
      attributes: [[Sequelize.fn('MIN', Sequelize.col('dateBegin')), 'date_begin'],
        [Sequelize.fn('MAX', Sequelize.fn('IFNULL', Sequelize.col('dateEnd'), 'NOW()-1')), 'date_end'],
        ['serviceID', 'service_id'], [Sequelize.fn('COUNT', Sequelize.col('serviceID')), 'count']],
      group: "serviceID",
      where: filter
    });
  },

  /**
   * Récupère la durée de séjour moyenne par service
   * @param {number | string} [serviceId] (Filtre) ID du service.
   * @param {date | string} [dateBegin] (Filtre) Date de début de la requête
   * @param {date | string} [dateEnd] (Filtre) Date de fin de la requête
   * @returns {json} Le résumé du temps de séjour par service.
   */
  getStayAvg: (serviceId, dateBegin, dateEnd) => {
    let filter = genFilter(serviceId, dateBegin, dateEnd);
    filter.newState = {[Op.eq]: 2}

    return BedStateEvent.findAll({
      attributes: [['serviceID', 'service_id'], [Sequelize.fn('AVG', Sequelize.literal("`dateEnd` - `dateBegin`")), 'duration']],
      group: "serviceID",
      where: filter
    });
  },

  /**
   * Récupère la durée de séjour moyenne par service par jour
   * @param {number | string} [serviceId] (Filtre) ID du service.
   * @param {date | string} [dateBegin] (Filtre) Date de début de la requête
   * @param {date | string} [dateEnd] (Filtre) Date de fin de la requête
   * @returns {json} Le résumé du temps de séjour par service et par jour.
   */
  getStayAvgDay: (serviceId, dateBegin, dateEnd) => {
    let filter = genFilter(serviceId, dateBegin, dateEnd);
    filter.newState = {[Op.eq]: 2}

    return BedStateEvent.findAll({
      attributes: [['serviceID', 'service_id'], [Sequelize.cast(Sequelize.col("dateBegin"), "DATE"), 'date'],
        [Sequelize.fn('AVG', Sequelize.literal("`dateEnd` - `dateBegin`")), 'duration']],
      group: ['date', 'serviceID'],
      where: filter
    });
  },

  /**
   * Récupère combien de patients ont séjournés combien de jours, par service
   * @param {number | string} [serviceId] (Filtre) ID du service.
   * @param {date | string} [dateBegin] (Filtre) Date de début de la requête
   * @param {date | string} [dateEnd] (Filtre) Date de fin de la requête
   * @returns {json} Le résumé du temps de séjour par service.
   */
  getDaysIn: (serviceId, dateBegin, dateEnd) => {
    let filter = genFilter(serviceId, dateBegin, dateEnd);
    filter.newState = {[Op.eq]: 2}


    return BedStateEvent.findAll({
      attributes: [['serviceID', 'service_id'],
        [Sequelize.fn('DATEDIFF',
          Sequelize.fn('IFNULL', Sequelize.col('dateEnd'), 'NOW()'),
          Sequelize.col('dateBegin')), 'duration'],
        [Sequelize.fn('COUNT', 'duration'), 'count']],
      group: ['serviceID', 'duration'],
      where: filter,
    });
  },

  /**
   * Récupère combien de temps est passé dans chaque état (de lit) par service
   * @param {number | string} [serviceId] (Filtre) ID du service.
   * @param {date | string} [dateBegin] (Filtre) Date de début de la requête
   * @param {date | string} [dateEnd] (Filtre) Date de fin de la requête
   * @returns {json} Le résumé du temps passé par état et par service.
   */
  getStateDuration: (serviceId, dateBegin, dateEnd) => {
    let filter = genFilter(serviceId, dateBegin, dateEnd);

    return BedStateEvent.findAll({
      attributes: [['serviceID', 'service_id'], [Sequelize.col('newState'), 'state'],
        [Sequelize.fn('SUM', Sequelize.literal("`dateEnd` - `dateBegin`")), 'duration']],
      group: ["serviceID", 'state'],
      where: filter
    });
  },
};
