const mongoose = require('mongoose');
const Schema = mongoose.Schema;

/**
 * Schéma MongoDB pour le système de logs.
 */
const bedEventSchema = new Schema({
  bed_uuid: String,
  room_nb: String,
  service_id: Number,
  username: String,
  user_role: String,
  state: {
    old: Number,
    new: Number
  },
  to_clean: {
    old: Boolean,
    new: Boolean
  },
  date: { type: Date, default: Date.now },
});

const BedEvent = mongoose.model('bedEvent', bedEventSchema);
const BedState = {
  free: 0,
  busy: 2,
  leaving: 1,
  unknown: -1
};

module.exports = {
  BedState,
  BedEvent
};