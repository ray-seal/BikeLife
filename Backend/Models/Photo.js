const mongoose = require('mongoose');

const PhotoSchema = new mongoose.Schema({
  user: {type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  ride: {type: mongoose.Schema.Types.ObjectId, ref: 'Ride' },
  path: String,
  caption: String,
  date: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Photo', PhotoSchema);
