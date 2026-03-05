const express = require('express');
const router = express.Router();
const Admin = require('../models/Admin');


// Get current admin info (except password)
router.get('/', async (req, res) => {
  try {
    const admin = await Admin.findOne().lean();
    if(!admin) return res.status(404).json({ message: 'Admin not found' });
    res.json({ name: admin.name });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Update admin name or password
router.put('/', async (req, res) => {
  const { name, password } = req.body;
  try {
    const admin = await Admin.findOne();
    if(!admin) return res.status(404).json({ message: 'Admin not found' });

    if(name) admin.name = name;
    if(password) admin.password = password; // Hash in production

    await admin.save();
    res.json({ message: 'Admin updated successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// For initial setup: create admin if none exists
router.post('/init', async (req, res) => {
  try {
    const existing = await Admin.findOne();
    if(existing) return res.status(400).json({ message: 'Admin already exists' });

    const { name, password } = req.body;
    if(!name || !password) return res.status(400).json({ message: 'Name and password required' });

    const admin = new Admin({ name, password });
    await admin.save();
    res.status(201).json({ message: 'Admin created' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Existing routes ...

// Admin login verification route
router.post('/login', async (req, res) => {
  try {
    const { password } = req.body;
    if (!password) return res.status(400).json({ success: false, message: 'Password required' });

    const admin = await Admin.findOne();
    if (!admin) return res.status(404).json({ success: false, message: 'Admin not found' });

    const entered = password.trim();
    const stored = admin.password.trim();


    if (entered === stored) {
      return res.json({ success: true, message: 'Password verified' });
    } else {
      return res.status(401).json({ success: false, message: 'Invalid password' });
    }
  } catch (error) {
    console.error('Login route error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;