const express = require('express');
const router = express.Router();
const Slot = require('../models/Slots');

router.post('/', async (req, res) => {
  try {

    console.log("🚗 Automatic booking request received");

    const { vehicleNumber } = req.body;

    if (!vehicleNumber) {
      return res.json({ success: false, message: "Vehicle number required" });
    }

    const sensorStatus = req.app.locals.sensorStatus;

    if (!sensorStatus || !sensorStatus.lastUpdated) {
      return res.status(500).json({ success: false, message: "Sensor system not ready" });
    }

    // 🔥 Freshness check (max 6 seconds old)
    const diff = (Date.now() - new Date(sensorStatus.lastUpdated)) / 1000;
    if (diff > 6) {
      return res.status(500).json({ success: false, message: "Sensor data outdated" });
    }

    const slotOrder = ["p1", "p2"];

    let wrongParkingDetected = false;


for (let slotName of slotOrder) {

  const slot = await Slot.findOne({ slotName });
  if (!slot) continue;

  const dbFree = slot.status === "free";
  const sensorFree = sensorStatus[slotName] === "FREE";
  const sensorOccupied = sensorStatus[slotName] === "OCCUPIED";

  // 🚨 Wrong parking case
  if (dbFree && sensorOccupied) {
    wrongParkingExists = true;
    continue; // check next slot
  }

  // ✅ Valid allocation
  if (dbFree && sensorFree) {

    slot.status = "booked";
    slot.vehicleNumber = vehicleNumber.toUpperCase();
    slot.entryTime = new Date();

    await slot.save();

    return res.json({
      success: true,
      message: "Slot allocated successfully",
      slotName: slot.slotName
    });
  }
}

// 🚨 If no slot allocated
if (wrongParkingExists) {
  return res.json({
    success: false,
    message: "Wrong parking detected in free slot"
  });
}

return res.json({
  success: false,
  message: "No free slots available"
});

  } catch (error) {
    console.error("❌ AUTO BOOK ERROR:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

module.exports = router;