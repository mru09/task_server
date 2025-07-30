const mongoose = require('mongoose');

const ReminderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: String,
  description: String,
  date: Date,
  sent: { type: Boolean, default: false }
});

module.exports = mongoose.model('Reminder', ReminderSchema);
