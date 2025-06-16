const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser');
require('dotenv').config(); // ✅ Only needed once

const bookingRoutes = require('./routes/bookingRoutes');
const adminRoutes = require('./routes/adminRoutes');
const adminAuthRoutes = require('./routes/adminAuthRoutes');

const app = express();

const allowedOrigins = [
  'http://localhost:3000',
  'https://river-raft-frontend.vercel.app/' // ✅ Replace with actual frontend URL
];
// Middleware
app.use(cors({
  origin: allowedOrigins ,
  credentials: true,
}));
app.use(express.json());
app.use(cookieParser());

// MongoDB Atlas Connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('✅ MongoDB connected to Atlas'))
  .catch((err) => console.error('❌ MongoDB connection failed:', err));

// Routes
app.use('/api/bookings', bookingRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/admin-auth', adminAuthRoutes);

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
