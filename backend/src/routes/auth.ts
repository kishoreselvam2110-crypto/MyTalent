import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma';

const router = Router();

// In-memory OTP store for prototype (mock OTP = "123456")
const otpStore: Record<string, { otp: string; expiresAt: number }> = {};

// POST /api/auth/send-otp
router.post('/send-otp', async (req: Request, res: Response) => {
  const { mobile } = req.body;
  if (!mobile || !/^[6-9]\d{9}$/.test(mobile)) {
    return res.status(400).json({ error: 'Invalid Indian mobile number' });
  }

  // Mock: always use "123456" as OTP in development
  const otp = process.env.NODE_ENV === 'production' ? Math.floor(100000 + Math.random() * 900000).toString() : '123456';
  otpStore[mobile] = { otp, expiresAt: Date.now() + 5 * 60 * 1000 }; // 5 min

  // In production, send via SMS provider (e.g., Twilio)
  console.log(`📱 OTP for ${mobile}: ${otp}`);

  res.json({ success: true, message: 'OTP sent', ...(process.env.NODE_ENV !== 'production' && { devOtp: otp }) });
});

// POST /api/auth/verify-otp
router.post('/verify-otp', async (req: Request, res: Response) => {
  const { mobile, otp } = req.body;
  if (!mobile || !otp) return res.status(400).json({ error: 'Mobile and OTP required' });

  const record = otpStore[mobile];
  if (!record) return res.status(400).json({ error: 'OTP not sent or expired. Request again.' });
  if (Date.now() > record.expiresAt) {
    delete otpStore[mobile];
    return res.status(400).json({ error: 'OTP expired' });
  }
  if (record.otp !== otp) return res.status(400).json({ error: 'Invalid OTP' });

  // OTP verified — clean up
  delete otpStore[mobile];

  // Upsert user
  const user = await prisma.user.upsert({
    where: { mobile },
    update: {},
    create: { mobile, location: '', education: '' },
  });

  res.json({ success: true, user });
});

export default router;
