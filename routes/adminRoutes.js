const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');
const AdminStatus = require('../models/AdminStatus');
const { Parser } = require('json2csv');
const verifyAdmin = require('../middleware/verifyAdmin');

// Get All Bookings
router.get('/all', verifyAdmin, async (req, res) => {
  try {
    const bookings = await Booking.find().sort({ date: -1 });
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch all bookings' });
  }
});

// Export All Bookings as CSV
router.get('/all/export', verifyAdmin, async (req, res) => {
  try {
    const bookings = await Booking.find().sort({ date: -1 });
    const fields = ['name', 'phone', 'date', 'time', 'people', 'paymentId', 'status'];
    const parser = new Parser({ fields });
    const csv = parser.parse(bookings);

    res.header('Content-Type', 'text/csv');
    res.attachment(`all_bookings_${new Date().toISOString().slice(0, 10)}.csv`);
    res.send(csv);
  } catch (err) {
    res.status(500).json({ error: 'Export failed' });
  }
});

// Get Tomorrow's Bookings
router.get('/tomorrow', verifyAdmin, async (req, res) => {
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  const dateStr = tomorrow.toISOString().split('T')[0];

  try {
    const bookings = await Booking.find({ date: dateStr });
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch tomorrow bookings' });
  }
});

// Export Tomorrow's Bookings as CSV
router.get('/tomorrow/export', verifyAdmin, async (req, res) => {
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  const dateStr = tomorrow.toISOString().split('T')[0];

  try {
    const bookings = await Booking.find({ date: dateStr });
    const fields = ['name', 'phone', 'date', 'time', 'people', 'paymentId', 'status'];
    const parser = new Parser({ fields });
    const csv = parser.parse(bookings);

    res.header('Content-Type', 'text/csv');
    res.attachment(`tomorrow_bookings_${dateStr}.csv`);
    res.send(csv);
  } catch (err) {
    res.status(500).json({ error: 'Export failed' });
  }
});

// Get Failed Bookings (no paymentId)
router.get('/failed-bookings', verifyAdmin, async (req, res) => {
  try {
    const bookings = await Booking.find({ paymentId: { $exists: false } });
    res.json(bookings);
  } catch (error) {
    console.error("Error fetching failed bookings:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ Public route to get booking status (used by user-facing booking form)
router.get('/public-booking-status', async (req, res) => {
  try {
    const status = await AdminStatus.findOne();
    res.json({ disabled: status?.disabled || false });
  } catch (err) {
    res.status(500).json({ error: 'Failed to get booking status' });
  }
});

// Get Booking Status (from DB)
router.get('/booking-status', verifyAdmin, async (req, res) => {
  try {
    const status = await AdminStatus.findOne();
    res.json({ disabled: status?.disabled || false });
  } catch (err) {
    res.status(500).json({ error: 'Failed to get booking status' });
  }
});

// Update Booking Status (Save to DB)
router.post('/booking-status', verifyAdmin, async (req, res) => {
  try {
    const { disabled } = req.body;
    const status = await AdminStatus.findOneAndUpdate({}, { disabled }, { upsert: true, new: true });
    res.json({ disabled: status.disabled });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update booking status' });
  }
});

module.exports = router;
