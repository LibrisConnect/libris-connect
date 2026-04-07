import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import JoinRequest from '../models/JoinRequest.js';
import College from '../models/College.js';
import { authenticateToken, authorizeRoles } from '../middleware/auth.js';

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

    const normalizedEmail = email.trim().toLowerCase();

    // Find user by email
    let user = await User.findOne({ email: normalizedEmail }).populate('college');

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

    const normalizedEmail = email.trim().toLowerCase();

    // Check if user already exists
    const existingUser = await User.findOne({ email: normalizedEmail });
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
      email: normalizedEmail,
      college: college._id,
      status: 'pending',
    });
    if (existingRequest) {
      return res.status(400).json({ error: 'You already have a pending join request for this college' });
    }

    // Create join request
    const joinRequest = new JoinRequest({
      email: normalizedEmail,
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
 * GET /auth/join-requests
 * Get join requests for librarian/admin moderation
 */
router.get('/join-requests', authenticateToken, authorizeRoles('librarian', 'admin'), async (req, res) => {
  try {
    const status = req.query.status || 'pending';
    const allowedStatuses = ['pending', 'approved', 'rejected'];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status filter' });
    }

    const query = { status };

    // Librarians can only review requests for their own college.
    if (req.user.role === 'librarian') {
      query.college = req.user.college?._id;
    }

    const requests = await JoinRequest.find(query)
      .populate('college', '_id name code city state')
      .sort({ createdAt: -1 });

    res.json({ requests });
  } catch (error) {
    console.error('Fetch join requests error:', error);
    res.status(500).json({ error: 'Failed to fetch join requests' });
  }
});

/**
 * PATCH /auth/join-requests/:id
 * Approve or reject a join request
 */
router.patch('/join-requests/:id', authenticateToken, authorizeRoles('librarian', 'admin'), async (req, res) => {
  try {
    const { decision, adminNotes } = req.body;

    if (!['approved', 'rejected'].includes(decision)) {
      return res.status(400).json({ error: 'Decision must be approved or rejected' });
    }

    const joinRequest = await JoinRequest.findById(req.params.id).populate('college');

    if (!joinRequest) {
      return res.status(404).json({ error: 'Join request not found' });
    }

    if (joinRequest.status !== 'pending') {
      return res.status(400).json({ error: 'Join request has already been processed' });
    }

    // Librarians can only moderate requests for their own college.
    if (
      req.user.role === 'librarian' &&
      String(joinRequest.college._id) !== String(req.user.college?._id)
    ) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    joinRequest.status = decision;
    joinRequest.adminNotes = adminNotes?.trim() || undefined;
    joinRequest.approvedBy = req.user._id;
    joinRequest.approvedAt = new Date();

    let createdUser = null;

    if (decision === 'approved') {
      const existingUser = await User.findOne({ email: joinRequest.email });
      if (existingUser) {
        return res.status(400).json({ error: 'A user with this email already exists' });
      }

      const defaultPassword = process.env.JOIN_REQUEST_DEFAULT_PASSWORD || 'Password123';
      const user = new User({
        email: joinRequest.email,
        name: joinRequest.name,
        password: defaultPassword,
        role: 'student',
        college: joinRequest.college._id,
        isActive: true,
      });

      await user.save();
      createdUser = {
        _id: user._id,
        email: user.email,
        role: user.role,
        defaultPassword,
      };
    }

    await joinRequest.save();

    res.json({
      message:
        decision === 'approved'
          ? 'Join request approved and student account created'
          : 'Join request rejected',
      request: joinRequest,
      createdUser,
    });
  } catch (error) {
    console.error('Moderate join request error:', error);
    res.status(500).json({ error: 'Failed to process join request' });
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
