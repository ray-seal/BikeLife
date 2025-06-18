const express = require('express');
const router = express.Router();
const Ride = require('../models/Ride');
const User = require('../models/User');
const jwt = require('jsonwebtoken');

const auth = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Unauthorized' });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    req.userId = decoded.id;
    next();
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
};

// Record a ride
router.post('/record', auth, async (req, res) => {
  const { route } = req.body;
  const ride = await Ride.create({ user: req.userId, route });
  res.json(ride);
});

// List my rides
router.get('/mine', auth, async (req, res) => {
  const rides = await Ride.find({ user: req.userId }).populate('photos');
  res.json(rides);
});

module.exports = router;
