const Booking = require('../models/Booking');
const sendConfirmationEmail = require('../utils/sendConfirmationEmail'); // ✅ move email logic here

exports.createBooking = async (req, res) => {
  try {
    const { name, phone, email, date, time, people, paymentId } = req.body;

    // Add your custom seat logic, raft assignment etc. here

    const booking = new Booking({ name, phone, email, date, time, people, paymentId });
    await booking.save();

    // ✅ Send email after booking saved
    await sendConfirmationEmail({
      to: email,
      name,
      phone,
      date,
      time,
      people,
      paymentId
    });

    res.status(201).json({ success: true, booking });
  } catch (err) {
    console.error("❌ Booking error:", err.message);
    res.status(500).json({ success: false, error: err.message });
  }
};
