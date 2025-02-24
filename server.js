const express = require('express');
const nodemailer = require('nodemailer');
const app = express();

app.post('/api/notify', async (req, res) => {
    const { projectId, projectTitle } = req.body;

    const transporter = nodemailer.createTransport({
        // Configure your email service here
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });

    try {
        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: 'your-email@example.com',
            subject: 'New Project Like!',
            text: `Someone liked your project: ${projectTitle} (ID: ${projectId})`
        });
        res.json({ success: true });
    } catch (error) {
        console.error('Failed to send email:', error);
        res.status(500).json({ error: 'Failed to send notification' });
    }
});

app.listen(3000); 