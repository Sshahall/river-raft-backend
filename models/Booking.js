const mongoose = require('mongoose');

const raftSchema = new mongoose.Schema({
  raftId: Number,
  booked: Number,
});

const bookingSchema = new mongoose.Schema({
  name: String,
  phone: String,
  email: String, // ✅ Add email here
  date: String,  // format: YYYY-MM-DD
  time: String,  // format: 09:00 AM, 10:30 AM etc.
  people: Number,
  paymentId: String,
  raftsUsed: [raftSchema], // store raft assignment
});

module.exports = mongoose.model('Booking', bookingSchema);
