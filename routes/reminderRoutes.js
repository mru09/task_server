const express = require('express');
const Reminder = require('../models/Reminder');
const verifyUser = require('../middleware/verifyUser');

const router = express.Router();

// Create
router.post('/', verifyUser, async (req, res) => {
  const reminder = await Reminder.create({ ...req.body, userId: req.userId });
  res.status(201).json(reminder);
});

// Read all reminders
router.get('/', verifyUser, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const skip = (page - 1) * limit;

    const [reminders, totalCount] = await Promise.all([
      Reminder.find({ userId: req.userId, sent: false })
        .sort('date')
        .skip(skip)
        .limit(limit),
      Reminder.countDocuments({ userId: req.userId, sent: false })
    ]);

    const totalPages = Math.ceil(totalCount / limit);

    res.json({
      reminders,
      totalPages,
      currentPage: page,
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch reminders' });
  }
});

// Update
router.put('/:id', verifyUser, async (req, res) => {
  const updated = await Reminder.findOneAndUpdate(
    { _id: req.params.id, userId: req.userId },
    req.body,
    { new: true }
  );
  res.json(updated);
});

// Delete
router.delete('/:id', verifyUser, async (req, res) => {
  await Reminder.findOneAndDelete({ _id: req.params.id, userId: req.userId });
  res.json({ message: 'Reminder deleted' });
});

module.exports = router;
