const mongoose = require('mongoose');

const RideSchema = new mongoose.Schema({
  user: {type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  route: [{ lat: Number, lon: Number, timestamp: Date }],
  date: { type: Date, default: Date.now },
  photos: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Photo' }]
});

module.exports = mongoose.model('Ride', RideSchema);
