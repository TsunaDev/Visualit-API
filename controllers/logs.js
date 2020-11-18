/*

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
    username: bedInfo.username,
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
    console.log(bed)
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

const getBedEvent = (serviceId, dateBegin, dateEnd) => {
  return BedStateEvent.findAll({
    order: [['dateBegin', 'DESC']],
    where: genFilter(serviceId, dateBegin, dateEnd)
  })
};

module.exports = {
  bedUpdateEvent,
  getBedEvent,
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

  getStayAvg: (serviceId, dateBegin, dateEnd) => {
    let filter = genFilter(serviceId, dateBegin, dateEnd);
    filter.newState = {[Op.eq]: 2}

    return BedStateEvent.findAll({
      attributes: [['serviceID', 'service_id'], [Sequelize.fn('AVG', Sequelize.literal("`dateEnd` - `dateBegin`")), 'duration']],
      group: "serviceID",
      where: filter
    });
  },

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
*/
