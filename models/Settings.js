const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
  perHourMoney: { type: Number, required: true },
  initialMoney: { type: Number, required: true },
  initialMoneyTime: { type: Number, required: true }, // hours
});

// There will be only one document for settings
module.exports = mongoose.model('Settings', settingsSchema);