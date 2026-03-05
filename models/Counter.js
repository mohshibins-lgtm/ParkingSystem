// models/Counter.js
const mongoose = require('mongoose');

const counterSchema = new mongoose.Schema({
  _id: { type: String, required: true }, // name of the sequence, e.g. 'staffId'
  seq: { type: Number, default: 100 }
});

module.exports = mongoose.model('Counter', counterSchema);