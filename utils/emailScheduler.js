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
    console.log(now)
    const reminders = await Reminder.find({ date: { $lte: now }, sent: false });
    console.log(reminders)
    for (const reminder of reminders) {
      const user = await User.findById(reminder.userId);
      if (!user) continue;

      const emailBody = `Hello ${user.name || ''},

      This is a reminder for your scheduled task: "${reminder.title}".

      📝 Description:
      ${reminder.description}

      📅 Scheduled Time: ${new Date(reminder.date).toLocaleString()}

      Thanks,
      ReminderBot ⏳`;

      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: user.email,
        subject: `Reminder: ${reminder.title}`,
        text: emailBody
      });

      reminder.sent = true;
      await reminder.save();
    }
  });
};
