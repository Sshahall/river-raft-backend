const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');
const AdminStatus = require('../models/AdminStatus');
const sendConfirmationEmail = require('../utils/sendConfirmationEmail');

// GET available slots
router.get('/slots', async (req, res) => {
  const { date } = req.query;
  if (!date) return res.status(400).json({ error: 'Missing date' });

  const timeSlots = ['9:00 AM', '11:00 AM', '1:00 PM', '3:00 PM'];
  const slots = {};

  for (let time of timeSlots) {
    slots[time] = [
      { raftId: 1, booked: 0 },
      { raftId: 2, booked: 0 },
      { raftId: 3, booked: 0 },
      { raftId: 4, booked: 0 }
    ];
  }

  try {
    const bookings = await Booking.find({ date });

    for (let booking of bookings) {
      const { time, raftsUsed = [] } = booking;
      if (!slots[time]) continue;

      for (let ru of raftsUsed) {
        const raft = slots[time].find(r => r.raftId === ru.raftId);
        if (raft) raft.booked += ru.booked;
      }
    }

    for (let time of timeSlots) {
      slots[time] = slots[time].map(r => {
        let available = 0;
        if (r.booked === 5) available = 1;
        else if (r.booked < 5) available = 6 - r.booked;
        return { raftId: r.raftId, available };
      });
    }

    return res.json(slots);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error fetching slots' });
  }
});

// POST booking
router.post('/', async (req, res) => {
  const { name, phone, email, date, time, people, paymentId } = req.body;

  if (!name || !phone || !email || !date || !time || !people || !paymentId) {
    return res.status(400).json({ error: 'Missing booking info' });
  }

  try {
    // ✅ Enforce admin control
    const status = await AdminStatus.findOne();
    if (status?.disabled) {
      return res.status(403).json({ error: 'Booking is currently disabled due to weather or maintenance.' });
    }

    const bookings = await Booking.find({ date, time });

    const rafts = [
      { raftId: 1, available: 6 },
      { raftId: 2, available: 6 },
      { raftId: 3, available: 6 },
      { raftId: 4, available: 6 }
    ];

    for (let booking of bookings) {
      for (let ru of booking.raftsUsed || []) {
        const raft = rafts.find(r => r.raftId === ru.raftId);
        if (raft) raft.available -= ru.booked;
      }
    }

    let remaining = parseInt(people);
    const raftsUsed = [];

    // Assign full rafts (6)
    for (let r of rafts) {
      if (remaining >= 6 && r.available >= 6) {
        raftsUsed.push({ raftId: r.raftId, booked: 6 });
        r.available -= 6;
        remaining -= 6;
      }
    }

    // Assign partial (5 or 1)
    for (let r of rafts) {
      if (remaining === 5 && r.available >= 5) {
        raftsUsed.push({ raftId: r.raftId, booked: 5 });
        r.available -= 5;
        remaining -= 5;
      } else if (remaining === 1 && r.available === 1) {
        raftsUsed.push({ raftId: r.raftId, booked: 1 });
        r.available -= 1;
        remaining -= 1;
      }
    }

    if (remaining > 0) {
      return res.status(400).json({ error: 'Not enough seats available for this slot.' });
    }

    const newBooking = new Booking({
      name,
      phone,
      email,
      date,
      time,
      people,
      paymentId,
      raftsUsed
    });

    await newBooking.save();

    await sendConfirmationEmail({
      to: email,
      name,
      phone,
      date,
      time,
      people,
      paymentId,
      rafts: raftsUsed
    });

    return res.json({
      message: 'Booking successful & email sent',
      raftsUsed
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error during booking' });
  }
});

module.exports = router;
