import express from 'express';
import College from '../models/College.js';
import { authenticateToken, authorizeRoles } from '../middleware/auth.js';

const router = express.Router();

/**
 * GET /api/colleges
 * Get all colleges
 */
router.get('/', async (req, res) => {
  try {
    const colleges = await College.find().select('_id name code city state');
    res.json({ colleges });
  } catch (error) {
    console.error('Error fetching colleges:', error);
    res.status(500).json({ error: 'Failed to fetch colleges' });
  }
});

/**
 * GET /api/colleges/:id
 * Get a single college by ID
 */
router.get('/:id', async (req, res) => {
  try {
    const college = await College.findById(req.params.id);
    
    if (!college) {
      return res.status(404).json({ error: 'College not found' });
    }
    
    res.json({ college });
  } catch (error) {
    console.error('Error fetching college:', error);
    res.status(500).json({ error: 'Failed to fetch college' });
  }
});

/**
 * POST /api/colleges
 * Create a college (admin only)
 */
router.post('/', authenticateToken, authorizeRoles('admin'), async (req, res) => {
  try {
    const college = new College(req.body);
    await college.save();
    res.status(201).json({ college });
  } catch (error) {
    console.error('Error creating college:', error);
    res.status(400).json({ error: error.message || 'Failed to create college' });
  }
});

/**
 * PUT /api/colleges/:id
 * Update a college (admin only)
 */
router.put('/:id', authenticateToken, authorizeRoles('admin'), async (req, res) => {
  try {
    const college = await College.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!college) {
      return res.status(404).json({ error: 'College not found' });
    }

    res.json({ college });
  } catch (error) {
    console.error('Error updating college:', error);
    res.status(400).json({ error: error.message || 'Failed to update college' });
  }
});

export default router;
