const express = require('express');
const Slot = require('../models/Slots');
const Settings = require('../models/Settings');
const Checkout = require('../models/checkout');
const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const { slotName } = req.body;
    const cleanSlotName = slotName.trim().toLowerCase();

    let settings = await Settings.findOne();
    if (!settings) {
      settings = new Settings({
        perHourMoney: 10, 
        initialMoney: 30, 
        initialMoneyTime: 1
      });
      await settings.save();
    }

    const slot = await Slot.findOne({ 
      slotName: cleanSlotName,
      vehicleNumber: { $ne: null, $exists: true }
    });

    if (!slot) {
      return res.status(404).json({ 
        error: `No vehicle in slot "${cleanSlotName}"` 
      });
    }

    
    const now = new Date();
    const entryTime = new Date(slot.entryTime);
    const durationMs = now - entryTime;
    const totalHours = Math.max(0.1, durationMs / (1000 * 60 * 60));
    
    let amount;
    if (totalHours <= settings.initialMoneyTime) {
      amount = settings.initialMoney;
    } else {
      const extraHours = totalHours - settings.initialMoneyTime;
      amount = settings.initialMoney + (extraHours * settings.perHourMoney);
    }

    const vehicleNumber = slot.vehicleNumber;
    const duration = `${Math.floor(totalHours)}h ${Math.round((totalHours % 1) * 60)}m`;

    const checkoutRecord = new Checkout({
      slotName: cleanSlotName,
      vehicleNumber: vehicleNumber,
      entryTime: slot.entryTime,
      exitTime: now,
      duration: durationMs,
      amount: Math.round(amount),
      totalTimeSpent: duration,
      paymentStatus: 'completed'
    });
    await checkoutRecord.save();

    
    slot.vehicleNumber = null;
    slot.entryTime = null;
    slot.status = 'free';
    await slot.save();

    
    const arduino = req.app.locals.arduino;
    if (arduino && arduino.writable) {
      arduino.write('FREE');  
      console.log(`📡 Arduino: Slot ${cleanSlotName} FREE`);
    }

    res.json({
      success: true,
      slot: cleanSlotName,
      vehicle: vehicleNumber,
      entryTime: entryTime.toLocaleString('en-IN'),
      duration: duration,
      amount: Math.round(amount)
    });

  } catch (error) {
    console.error('❌ Checkout ERROR:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;