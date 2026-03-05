// models/Slot.js

const mongoose = require('mongoose');

const slotSchema = new mongoose.Schema({
  slotName : String ,
  status: {
    type: String,
    enum: ['free', 'booked', 'wrong parking'],
    default: 'free'
  },
  vehicleNumber: String,
  entryTime: Date
});

module.exports = mongoose.model('Slot',slotSchema);