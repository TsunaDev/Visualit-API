const {BedStateEvent} = require("../models/bed_event");
const { Op } = require('sequelize');

/**
 * Est appelé à chaque fois qu'un lit est mis à jour et envoi les informations de mise à jour sur la base de donnée MongoDB.
 * @param {json} bedInfo Anciennes et nouvelles informations sur le lit réunies.
 */
const bedUpdateEvent = (bedInfo) => {
  const now = Date.now();
  const elem = BedStateEvent.build({
    bedID: bedInfo.bed_uuid,
    serviceID: bedInfo.service_id,
    username: bedInfo.username,
    userRole: bedInfo.user_role,
    oldState: bedInfo.state.old,
    newState: bedInfo.state.new,
    dateBegin: now
  });
  BedStateEvent.findOne({
    where: { bedID: { [Op.eq]: bedInfo.bed_uuid } },
    order: [ ['id', 'DESC']],
    limit: 1
  }).then(bed => {
    console.log(bed)
    if (bed && !bed.dateEnd) {
      const update = BedStateEvent.update({
        dateEnd: now
      }, {
        where: {
          id: { [Op.eq]: bed.id },
        },
      })
      return Promise.all([update, elem.save()]);
    } else {
      return elem.save();
    }
  }).catch(_ => elem.save())
};

/**
 * Récupère une notification de modification d'un lit sur la base MongoDB.
 * @param {number} serviceId (optionnel) Permet de spécifier un service en particulier.
 * @param {*} dateBegin (optionnel) Permet de spécifier un interval de temps.
 * @param {*} dateEnd (optionnel) Permet de spécifier un interval de temps.
 */
const getBedEvent = (serviceId, dateBegin, dateEnd) => {

  let filter = {};
  if (serviceId && Array.isArray(serviceId)) filter.serviceID = { [Op.in]: serviceId };
  else if (serviceId) filter.serviceID = {[Op.eq]: serviceId};
  if (dateBegin || dateEnd) filter.date = {};
  if (dateBegin) filter.dateBegin = { [Op.gte]: dateBegin};
  if (dateEnd) {
    filter.dateBegin = { [Op.lte]: dateEnd};
    filter.dateEnd = { [Op.lte]: dateEnd};
  }

  return BedStateEvent.findAll({
    order: [['dateBegin', 'DESC']],
    where: filter
  })
};

module.exports = {
  bedUpdateEvent,
  getBedEvent
};