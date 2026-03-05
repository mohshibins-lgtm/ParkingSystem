const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

// ✅ SAFE MODEL LOAD
let Checkout;
try {
  Checkout = require('../models/checkout');
} catch (e) {
  console.log('Checkout model not found, using fallback');
}

// ✅ SINGLE QUERY
router.get('/', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    let query = { paymentStatus: 'completed' };
    
    if (startDate && endDate) {
      query.exitTime = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }
    
    const history = await Checkout.find(query)
      .sort({ exitTime: -1 })
      .limit()
      .lean();
    
    res.json(history);
  } catch (error) {
    console.error('History:', error);
    res.status(500).json({ message: 'No history data' });
  }
});

module.exports = router;