import { Router } from 'express';
import { authService } from '../services/authService';
import nodemailer from 'nodemailer';

const router = Router();

// Verify Firebase token
router.post('/verify', async (req, res) => {
  try {
    const { idToken } = req.body;
    
    if (!idToken) {
      return res.status(400).json({ error: 'ID token is required' });
    }

    const user = await authService.verifyToken(idToken);
    res.json({ user });
  } catch (error) {
    console.error('Auth verification error:', error);
    res.status(401).json({ error: 'Invalid token' });
  }
});

export { router as authRoutes };

// Contact creator (public form relay)
router.post('/contact/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { name, email, message } = req.body || {};
    if (!name || !email || !message) return res.status(400).json({ error: 'Missing fields' });

    // Create transporter from env or fallback to console
    const host = process.env.SMTP_HOST;
    const port = process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : 587;
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;
    if (!host || !user || !pass) {
      console.log('Contact message (no SMTP configured):', { toUserId: userId, name, email, message });
      return res.json({ ok: true, info: 'SMTP not configured; logged to server.' });
    }
    const transporter = nodemailer.createTransport({ host, port, secure: port === 465, auth: { user, pass } });

    await transporter.sendMail({
      from: `ISOWS Contact <${user}>`,
      to: user, // In a full impl, look up the creator’s email by userId
      subject: `New inquiry for user ${userId}`,
      text: `From: ${name} <${email}>
User ID: ${userId}

${message}`
    });

    res.json({ ok: true });
  } catch (e) {
    console.error('Contact relay error:', e);
    res.status(500).json({ error: 'Failed to send message' });
  }
});
