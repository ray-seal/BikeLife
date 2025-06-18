const express = require('express');
const router = express.Router();
const multer = require('multer');
const Photo = require('../models/Photo');
const jwt = require('jsonwebtoken');

const storage = multer.diskStorage({
  destination: 'uploads/',
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ storage });

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

// Upload a photo
router.post('/upload', auth, upload.single('photo'), async (req, res) => {
  const { ride, caption } = req.body;
  const photo = await Photo.create({
    user: req.userId,
    ride,
    path: req.file.path,
    caption
  });
  res.json(photo);
});

// Get all photos (feed)
router.get('/feed', async (req, res) => {
  const photos = await Photo.find().sort({ date: -1 }).limit(20);
  res.json(photos);
});

module.exports = router;
