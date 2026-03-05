const mongoose = require('mongoose');

const adminSchema = new mongoose.Schema({
  name: { type: String, required: true },
  password: { type: String, required: true }
}, { collection: 'admins' });  // Explicitly specify collection name

module.exports = mongoose.model('Admin', adminSchema);