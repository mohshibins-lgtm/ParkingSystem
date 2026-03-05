const express = require('express');
const router = express.Router();
const User = require('../models/User');

// Get all staffs (id, name, age)
router.get('/', async (req, res) => {
  try {
    const staffs = await User.find({}, 'id name age').lean();
    res.json(staffs);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get full staff details by id
router.get('/:id', async (req, res) => {
  try {
    const staff = await User.findById(req.params.id).lean();
    if (!staff) return res.status(404).json({ message: 'Staff not found' });
    res.json(staff);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Update staff details by id
router.put('/:id', async (req, res) => {
  try {
    const updated = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return res.status(404).json({ message: 'Staff not found' });
    res.json({ message: 'Staff updated', staff: updated });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete staff by id
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await User.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Staff not found' });
    res.json({ message: 'Staff deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Add new staff
router.post('/', async (req, res) => {
  try {
    const user = new User(req.body);
    await user.save();
    res.status(201).json({ message: 'Staff added', staff: user });
  } catch (err) {
    console.error('Error adding staff:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

