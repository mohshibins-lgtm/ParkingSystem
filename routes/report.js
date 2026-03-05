const express = require('express');
const router = express.Router();
const Checkout = require('../models/checkout'); // Adjust path as needed
const Settings = require('../models/Settings'); // Adjust path as needed

router.get('/', async (req, res) => {
  try {
    const { start, end } = req.query;

    // Build filter for checkoutTime
    const filter = {};
    if (start) filter.exitTime = { $gte: new Date(start) };
    if (end) {
      filter.exitTime = filter.checkoutTime || {};
      // Include entire end date by adding 23:59:59.999
      filter.exitTime.$lte = new Date(new Date(end).setHours(23,59,59,999));
    }

    // Fetch settings to calculate prices
    const settings = await Settings.findOne();
    if (!settings) {
      return res.status(500).json({ message: 'Parking settings not configured' });
    }

    // Fetch all matching checkouts
    const checkouts = await Checkout.find(filter).lean();

    // Calculate fee per vehicle
    function calculateFee(entryTime, exitTime) {
      const msDiff = exitTime - entryTime;
      const hoursSpent = msDiff / (1000 * 60 * 60);

      if (hoursSpent <= settings.initialMoneyTime) {
        return settings.initialMoney;
      } else {
        const extraHours = Math.ceil(hoursSpent - settings.initialMoneyTime);
        return settings.initialMoney + (extraHours * settings.perHourMoney);
      }
    }

    // Aggregate data by date (YYYY-MM-DD)
    const dailyData = {};

    checkouts.forEach(doc => {
      if (!doc.entryTime || !doc.exitTime) return; // skip incomplete entries
      const dateKey = doc.exitTime.toISOString().slice(0, 10); // format: YYYY-MM-DD

      if (!dailyData[dateKey]) {
        dailyData[dateKey] = { totalVehicles: 0, totalAmount: 0 };
      }
      dailyData[dateKey].totalVehicles += 1;
      dailyData[dateKey].totalAmount += calculateFee(doc.entryTime, doc.exitTime);
    });

    // Convert to array and sort descending by date (newest first)
    const report = Object.entries(dailyData)
      .map(([date, data]) => ({
        date,
        totalVehicles: data.totalVehicles,
        totalAmount: data.totalAmount,
      }))
      .sort((a, b) => b.date.localeCompare(a.date));

    res.json(report);
  } catch (err) {
    console.error('Error fetching report:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;