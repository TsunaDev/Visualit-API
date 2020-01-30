const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const bedEventSchema = new Schema({
  bed_id: Number,
  service_id: Number,
  username: String,
  user_role: String,
  state: {
    old: String,
    new: String
  },
  to_clean: {
    old: Boolean,
    new: Boolean
  },
  date: { type: Date, default: Date.now },
});

const BedEvent = mongoose.model('bedEvent', bedEventSchema);
const BedState = {
  free: 'Free',
  busy: 'Busy',
  leaving: 'Leaving',
  unknown: 'Unknown'
};

module.exports = {
  BedState,
  BedEvent
};