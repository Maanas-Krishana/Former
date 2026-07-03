import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import { requireAuth, AuthRequest } from '../middleware/auth';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-readynest-key-change-me';

async function verifyTurnstile(token: string) {
  if (!token) return false;
  const formData = new URLSearchParams();
  formData.append('secret', process.env.TURNSTILE_SECRET_KEY || '');
  formData.append('response', token);
  
  try {
    const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      body: formData
    });
    const data = await res.json();
    return data.success;
  } catch (err) {
    return false;
  }
}

// Register User
router.post('/signup', async (req, res) => {
  try {
    const { name, email, password, turnstileToken } = req.body;

    const isValidHuman = await verifyTurnstile(turnstileToken);
    if (!isValidHuman) return res.status(400).json({ message: 'Human verification failed' });

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const newUser = new User({ name, email, passwordHash });
    await newUser.save();

    const token = jwt.sign({ userId: newUser._id }, JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({ token, user: { id: newUser._id, name, email } });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Login User
router.post('/login', async (req, res) => {
  try {
    const { email, password, turnstileToken } = req.body;

    const isValidHuman = await verifyTurnstile(turnstileToken);
    if (!isValidHuman) return res.status(400).json({ message: 'Human verification failed' });

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '7d' });

    res.json({ token, user: { id: user._id, name: user.name, email } });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Google Login / Signup
router.post('/google', async (req, res) => {
  try {
    const { token: googleToken, turnstileToken } = req.body;

    const isValidHuman = await verifyTurnstile(turnstileToken);
    if (!isValidHuman) return res.status(400).json({ message: 'Human verification failed' });

    const googleVerifyRes = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${googleToken}`);
    if (!googleVerifyRes.ok) {
      return res.status(400).json({ message: 'Invalid Google Token' });
    }

    const payload = await googleVerifyRes.json();
    const { email, name } = payload;

    if (!email) {
      return res.status(400).json({ message: 'Email not provided by Google' });
    }

    let user = await User.findOne({ email });
    if (!user) {
      // Sign-Up: Create new user if they don't exist
      user = new User({ name, email, passwordHash: 'google-oauth-account' });
      await user.save();
    }

    const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: user._id, name: user.name, email } });
  } catch (error) {
    console.error("Google Auth Error:", error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update Profile
router.put('/profile', requireAuth, async (req: AuthRequest, res) => {
  try {
    const { name, password } = req.body;
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (name) user.name = name;
    if (password) {
      const salt = await bcrypt.genSalt(10);
      user.passwordHash = await bcrypt.hash(password, salt);
    }
    
    await user.save();
    res.json({ message: 'Profile updated successfully', user: { id: user._id, name: user.name, email: user.email } });
  } catch (error) {
    res.status(500).json({ message: 'Error updating profile' });
  }
});

export default router;
