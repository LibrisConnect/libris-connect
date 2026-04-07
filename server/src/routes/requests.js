import express from 'express';
import Book from '../models/Book.js';
import BookRequest from '../models/BookRequest.js';
import { authenticateToken, authorizeRoles } from '../middleware/auth.js';

const router = express.Router();

// POST /api/requests
// Create a new book request (student)
router.post('/', authenticateToken, authorizeRoles('student'), async (req, res) => {
  try {
    const { bookId } = req.body;

    if (!bookId) {
      return res.status(400).json({ error: 'bookId is required' });
    }

    const book = await Book.findById(bookId).populate('college', '_id name');
    if (!book) {
      return res.status(404).json({ error: 'Book not found' });
    }

    const existingPending = await BookRequest.findOne({
      requester: req.user._id,
      book: book._id,
      status: 'pending_approval',
    });

    if (existingPending) {
      return res.status(409).json({ error: 'A pending request already exists for this book' });
    }

    const request = new BookRequest({
      book: book._id,
      college: book.college._id,
      requester: req.user._id,
      status: 'pending_approval',
    });

    await request.save();
    await request.populate([
      { path: 'book', select: '_id title college', populate: { path: 'college', select: 'name' } },
      { path: 'requester', select: '_id name email' },
    ]);

    res.status(201).json({ request });
  } catch (error) {
    console.error('Create book request error:', error);
    res.status(500).json({ error: 'Failed to create request' });
  }
});

// GET /api/requests/me
// Student: get own requests
router.get('/me', authenticateToken, authorizeRoles('student'), async (req, res) => {
  try {
    const requests = await BookRequest.find({ requester: req.user._id })
      .populate([
        { path: 'book', select: '_id title college', populate: { path: 'college', select: 'name' } },
        { path: 'requester', select: '_id name email' },
      ])
      .sort({ createdAt: -1 });

    res.json({ requests });
  } catch (error) {
    console.error('Fetch my requests error:', error);
    res.status(500).json({ error: 'Failed to fetch requests' });
  }
});

// GET /api/requests
// Librarian/Admin: get requests by status
router.get('/', authenticateToken, authorizeRoles('librarian', 'admin'), async (req, res) => {
  try {
    const status = req.query.status || 'pending_approval';
    const allowedStatuses = ['pending_approval', 'approved', 'ready_for_pickup', 'rejected'];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status filter' });
    }

    const query = { status };

    if (req.user.role === 'librarian') {
      query.college = req.user.college?._id;
    }

    const requests = await BookRequest.find(query)
      .populate([
        { path: 'book', select: '_id title college', populate: { path: 'college', select: 'name' } },
        { path: 'requester', select: '_id name email' },
      ])
      .sort({ createdAt: -1 });

    res.json({ requests });
  } catch (error) {
    console.error('Fetch moderation requests error:', error);
    res.status(500).json({ error: 'Failed to fetch requests' });
  }
});

// PATCH /api/requests/:id
// Librarian/Admin: approve or reject a request
router.patch('/:id', authenticateToken, authorizeRoles('librarian', 'admin'), async (req, res) => {
  try {
    const { decision, notes } = req.body;

    if (!['approved', 'rejected'].includes(decision)) {
      return res.status(400).json({ error: 'Decision must be approved or rejected' });
    }

    const request = await BookRequest.findById(req.params.id).populate('book', '_id college');
    if (!request) {
      return res.status(404).json({ error: 'Request not found' });
    }

    if (request.status !== 'pending_approval') {
      return res.status(400).json({ error: 'Request has already been processed' });
    }

    if (
      req.user.role === 'librarian' &&
      String(request.book.college) !== String(req.user.college?._id)
    ) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    request.status = decision === 'approved' ? 'ready_for_pickup' : 'rejected';
    request.notes = notes?.trim() || undefined;
    request.processedBy = req.user._id;
    request.processedAt = new Date();

    await request.save();
    await request.populate([
      { path: 'book', select: '_id title college', populate: { path: 'college', select: 'name' } },
      { path: 'requester', select: '_id name email' },
    ]);

    res.json({
      message: decision === 'approved' ? 'Request marked ready for pickup' : 'Request rejected',
      request,
    });
  } catch (error) {
    console.error('Moderate request error:', error);
    res.status(500).json({ error: 'Failed to process request' });
  }
});

export default router;
