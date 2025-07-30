const cron = require('node-cron');
const Reminder = require('../models/Reminder');
const User = require('../models/User');
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

module.exports = () => {
  cron.schedule('* * * * *', async () => {
    const now = new Date();
    const reminders = await Reminder.find({ date: { $lte: now }, sent: false });

    for (const reminder of reminders) {
      const user = await User.findById(reminder.userId);
      if (!user) continue;

      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: user.email,
        subject: `Reminder: ${reminder.title}`,
        text: reminder.description
      });

      reminder.sent = true;
      await reminder.save();
    }
  });
};
