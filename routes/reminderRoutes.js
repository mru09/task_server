const express = require('express');
const Reminder = require('../models/Reminder');
const verifyUser = require('../middleware/verifyUser');

const router = express.Router();

router.post('/', verifyUser, async (req, res) => {
  try {
    const reminder = await Reminder.create({ ...req.body, userId: req.userId });
    res.status(201).json(reminder);
  } catch (error) {
    console.error('Error creating reminder:', error);
    res.status(500).json({ message: 'Failed to create reminder' });
  }
});

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
  } catch (error) {
    console.error('Error fetching reminders:', error);
    res.status(500).json({ message: 'Failed to fetch reminders' });
  }
});

router.put('/:id', verifyUser, async (req, res) => {
  try {
    const updated = await Reminder.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      req.body,
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ message: 'Reminder not found' });
    }

    res.json(updated);
  } catch (error) {
    console.error('Error updating reminder:', error);
    res.status(500).json({ message: 'Failed to update reminder' });
  }
});

router.delete('/:id', verifyUser, async (req, res) => {
  try {
    const deleted = await Reminder.findOneAndDelete({ _id: req.params.id, userId: req.userId });

    if (!deleted) {
      return res.status(404).json({ message: 'Reminder not found' });
    }

    res.json({ message: 'Reminder deleted' });
  } catch (error) {
    console.error('Error deleting reminder:', error);
    res.status(500).json({ message: 'Failed to delete reminder' });
  }
});

module.exports = router;
