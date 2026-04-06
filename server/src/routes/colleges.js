import express from 'express';
import College from '../models/College.js';

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

export default router;
