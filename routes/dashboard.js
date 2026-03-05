const express = require('express');
const router = express.Router();
const Slot = require('../models/Slots');

router.get('/', async (req, res) => {
  try {
    const totalSlots = await Slot.countDocuments();
    const occupiedSlots = await Slot.countDocuments({ status: 'booked' });
    const freeSlots = totalSlots - occupiedSlots;

    const currentParked = await Slot.find({ status: 'booked' })
      .select('slotName vehicleNumber entryTime -_id')
      .limit(totalSlots)
      .lean();

    res.json({
      totalSlots,
      occupiedSlots,
      freeSlots,
      currentParked,
    });
  } catch (error) {
    console.error('Dashboard fetch error:', error);
    res.status(500).json({ message: 'Server error fetching dashboard data' });
  }
});

module.exports = router;