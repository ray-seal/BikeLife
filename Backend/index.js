require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const rideRoutes = require('./routes/rides');
const photoRoutes = require('./routes/photos');

const app = express();
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(uploads'));

app.use('/api/auth', authRoutes);
app.use('/api/rides', rideRoutes);
app.use('/api/photos', photoRoutes);

mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost/motomeet' {
  useNewUrlParser: true,
    useUnifiedTopology: true,
    }).then()) => {
console.log(MongoDB connected');
  app.listen(3001, () => console.log('Backend running on port 3001'));
});
