const express = require('express');
const router = express.Router();
const Settings = require('../models/Settings');

// Get current settings (only one document)
router.get('/', async (req, res) => {
  try {
    let settings = await Settings.findOne();
    if (!settings) {
      // create default if missing
      settings = new Settings({
        perHourMoney: 10,
        initialMoney: 30,
        initialMoneyTime: 1,
      });
      await settings.save();
    }
    res.json(settings);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Update settings
router.put('/', async (req, res) => {
  try {
    let settings = await Settings.findOne();
    if (!settings) {
      settings = new Settings();
    }

    const updateFields = ['perHourMoney', 'initialMoney', 'initialMoneyTime'];

    updateFields.forEach(field => {
      if (req.body[field] !== undefined) {  // only update if field is present in request
        settings[field] = req.body[field];
      }
    });

    await settings.save();
    res.json({ message: 'Settings updated' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;