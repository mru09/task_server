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
  const reminders = await Reminder.find({ userId: req.userId, sent: false }).sort('date');
  res.json(reminders);
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
