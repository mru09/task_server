const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const reminderRoutes = require('./routes/reminderRoutes');
const userRoutes = require('./routes/userRoutes'); 

dotenv.config();
const app = express();
app.use(cors()); 
app.use(express.json());

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log(err));

app.use('/api/user', userRoutes);
app.use('/api/reminders', reminderRoutes);

module.exports = app;
