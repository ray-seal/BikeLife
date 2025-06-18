const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  username: {type: String, unique: true },
  password: String,
  bio: String,
  bike: String,
  friends: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
});

module.exports = mongoose.model('User', UserSchema);
