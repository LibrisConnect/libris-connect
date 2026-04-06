import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import JoinRequest from '../models/JoinRequest.js';
import College from '../models/College.js';

const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

/**
 * POST /auth/login
 * Login with email and password
 */
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Find user by email
    let user = await User.findOne({ email }).populate('college');

    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Check if account is active
    if (!user.isActive) {
      return res.status(403).json({ error: 'Account is deactivated' });
    }

    // Compare password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      user: {
        _id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
        college: user.college,
      },
      token,
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

/**
 * POST /auth/register
 * Request to join a college
 */
router.post('/register', async (req, res) => {
  try {
    const { email, name, collegeCode, reason } = req.body;

    if (!email || !name || !collegeCode) {
      return res.status(400).json({ error: 'Email, name, and college code are required' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    // Find college by code
    const college = await College.findOne({ code: collegeCode });
    if (!college) {
      return res.status(404).json({ error: 'College not found. Please contact your college administrator.' });
    }

    // Check if join request already exists and is pending
    const existingRequest = await JoinRequest.findOne({
      email,
      college: college._id,
      status: 'pending',
    });
    if (existingRequest) {
      return res.status(400).json({ error: 'You already have a pending join request for this college' });
    }

    // Create join request
    const joinRequest = new JoinRequest({
      email,
      name,
      college: college._id,
      reason,
    });
    await joinRequest.save();

    res.status(201).json({
      message: 'Join request submitted successfully. Please wait for admin approval.',
      joinRequest,
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

/**
 * GET /auth/me
 * Get current user
 */
router.get('/me', async (req, res) => {
  try {
    // Extract token from Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const token = authHeader.substring(7);
    
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      const user = await User.findById(decoded.userId).populate('college');

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      res.json({
        _id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
        college: user.college,
      });
    } catch (tokenError) {
      return res.status(401).json({ error: 'Invalid token' });
    }
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Failed to get user' });
  }
});

export default router;
