const express = require('express');
const router = express.Router();
const Grievance = require('../models/Grievance');
const auth = require('../middleware/authMiddleware');

// SUBMIT grievance (student only)
router.post('/submit', auth, async (req, res) => {
  try {
    const { title, description, category, priority } = req.body;

    const grievance = new Grievance({
      title,
      description,
      category,
      priority,
      student: req.user.id,
      studentName: req.user.name,
      studentEmail: req.user.email
    });

    await grievance.save();
    res.status(201).json({ message: 'Grievance submitted successfully', grievance });

  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// GET my grievances (student)
router.get('/my', auth, async (req, res) => {
  try {
    const grievances = await Grievance.find({ student: req.user.id }).sort({ createdAt: -1 });
    res.json(grievances);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// GET all grievances (admin only)
router.get('/all', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }
    const grievances = await Grievance.find().sort({ createdAt: -1 });
    res.json(grievances);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// UPDATE grievance status (admin only)
router.put('/update/:id', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const { status, assignedTo, adminRemarks } = req.body;

    const grievance = await Grievance.findByIdAndUpdate(
      req.params.id,
      { status, assignedTo, adminRemarks },
      { new: true }
    );

    if (!grievance) {
      return res.status(404).json({ message: 'Grievance not found' });
    }

    res.json({ message: 'Grievance updated successfully', grievance });

  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// DELETE grievance (admin only)
router.delete('/delete/:id', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    await Grievance.findByIdAndDelete(req.params.id);
    res.json({ message: 'Grievance deleted successfully' });

  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;