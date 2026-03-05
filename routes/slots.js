const express = require('express');
const router = express.Router();
const Slot = require('../models/Slots'); // Fix path

router.get('/', async (req, res) => {
  try {
    const slots = await Slot.find({}).sort({ slotName: 1 });
    res.json(slots.map(s => ({
      slotName: s.slotName,
      status: s.vehicleNumber ? 'booked' : 'free'
    })));
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;