const mongoose = require('mongoose');
const {BedEvent} = require('../models/bed_event');
mongoose.connect(process.env.LOGS_URI, {useNewUrlParser: true, useUnifiedTopology: true});

const bedUpdateEvent = (bedInfo) => {
  const obj = new BedEvent({
    bed_uuid: bedInfo.bed_uuid,
    room_nb: bedInfo.room_nb,
    service_id: bedInfo.service_id,
    username: bedInfo.username,
    user_role: bedInfo.user_role,
    state: {
      old: bedInfo.state.old,
      new: bedInfo.state.new
    },
    to_clean: {
      old: bedInfo.to_clean.old,
      new: bedInfo.to_clean.new
    }
  });
  return obj.save();
};

const getBedEvent = (serviceId, dateBegin, dateEnd) => {
  let filter = {};
  if (serviceId && Array.isArray(serviceId)) filter.service_id = { $in: serviceId };
  else if (serviceId) filter.service_id = serviceId;
  if (dateBegin || dateEnd) filter.date = {};
  if (dateBegin) filter.date['$gte'] = dateBegin;
  if (dateEnd) filter.date['$lte'] = dateEnd;

  return BedEvent.find(filter).sort({date: 1}).exec();
};

module.exports = {
  bedUpdateEvent,
  getBedEvent
};