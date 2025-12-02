// Notification service.
const express = require('express');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
require('dotenv').config();

const app = express();
app.use(bodyParser.json());

// Configure Nodemailer transporter.
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_APPLICATION_PASSWORD,
  },
});

// Send email notification.
app.post('/notify', async (req, res) => {
  const { to, subject, text } = req.body;

  // Validate required fields.
  if (!to || !subject || !text) {
    return res.status(400).json({ message: 'Email, subject, and text are required.' });
  }

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to,
    subject,
    text,
  };

  try {
    await transporter.sendMail(mailOptions);
    return res.status(200).json({ message: 'Email sent successfully.' });
  } catch (error) {
    console.error('Email sending error.', error);
    return res.status(500).json({ message: 'Error sending email.', error });
  }
});

// Start notification service.
const PORT = process.env.NOTIFI_PORT || 4002;
app.listen(PORT, () => {
  console.log(`Notification service listening on port ${PORT}`);
});
