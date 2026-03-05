const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  staffId: { type: Number, unique: true },
  name: String,
  age: Number,
  place: String,
  gender: String,
  password: String,
  joinedDate: Date,
});

module.exports = mongoose.model('User', userSchema);