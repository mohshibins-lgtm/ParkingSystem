const express = require('express');
const router = express.Router();
const Slot = require('../models/Slots');

router.post('/', async (req, res) => {
  try {

    const { vehicleNumber } = req.body;

    if (!vehicleNumber) {
      return res.json({ success: false, message: 'Vehicle number required' });
    }

    // 1️⃣ Get latest sensor status
    const sensorStatus = req.app.locals.sensorStatus;

    if (!sensorStatus) {
      return res.status(500).json({ success: false, message: 'Sensor system not ready' });
    }

    // 2️⃣ Find first FREE slot
    const slot = await Slot.findOne({ status: 'free' });

    if (!slot) {
      return res.json({ success: false, message: 'No free slots available' });
    }

    // 3️⃣ Prevent booking if sensor shows occupied or wrong
    if (slot.slotName === 'p1' && (sensorStatus.p1 === 'OCCUPIED' || sensorStatus.p1 === 'WRONG')) {
      return res.json({ success: false, message: 'Slot P1 is not actually free' });
    }

    if (slot.slotName === 'p2' && (sensorStatus.p2 === 'OCCUPIED' || sensorStatus.p2 === 'WRONG')) {
      return res.json({ success: false, message: 'Slot P2 is not actually free' });
    }

    // 4️⃣ Book slot
    slot.status = 'booked';
    slot.vehicleNumber = vehicleNumber.toUpperCase();
    slot.entryTime = new Date();
    await slot.save();

    // 5️⃣ Notify Arduino
    const arduino = req.app.locals.arduino;
    if (arduino && arduino.writable) {
      arduino.write(`BOOKED_${slot.slotName}\n`);
      console.log(`📡 Arduino: Slot ${slot.slotName} BOOKED`);
    }

    return res.json({
      success: true,
      message: 'Slot allocated automatically',
      slotName: slot.slotName,
      vehicleNumber: slot.vehicleNumber
    });

  } catch (error) {
    console.error("AUTO BOOK ERROR:", error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

/*setInterval(() =>{
  fetch('/api/dashboard-data')
},2000);*/

module.exports = router;