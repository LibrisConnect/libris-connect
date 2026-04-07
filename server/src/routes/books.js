import express from 'express';
import Book from '../models/Book.js';
import { authenticateToken, authorizeRoles } from '../middleware/auth.js';

const router = express.Router();

// GET all books
router.get('/', async (req, res) => {
  try {
    const { search, category, page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    let query = {};

    if (search) {
      query = {
        $or: [
          { title: { $regex: search, $options: 'i' } },
          { author: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } },
        ],
      };
    }

    if (category) {
      query.category = category;
    }

    const books = await Book.find(query)
      .populate('college', 'name')
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await Book.countDocuments(query);

    res.json({
      books,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET single book
router.get('/:id', async (req, res) => {
  try {
    const book = await Book.findById(req.params.id).populate('college').populate('createdBy', 'name email');

    if (!book) {
      return res.status(404).json({ error: 'Book not found' });
    }

    res.json(book);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST create book
router.post('/', authenticateToken, authorizeRoles('librarian'), async (req, res) => {
  try {
    const payload = { ...req.body };

    // Librarians can only create books under their own college.
    if (req.user.role === 'librarian') {
      payload.college = req.user.college?._id ?? req.user.college;
    }

    payload.createdBy = req.user._id;

    const book = new Book(payload);
    await book.save();
    await book.populate('college', 'name');

    res.status(201).json(book);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// PUT update book
router.put('/:id', authenticateToken, authorizeRoles('librarian'), async (req, res) => {
  try {
    const existingBook = await Book.findById(req.params.id);

    if (!existingBook) {
      return res.status(404).json({ error: 'Book not found' });
    }

    // Librarians can only update books from their own college.
    if (
      req.user.role === 'librarian' &&
      String(existingBook.college) !== String(req.user.college?._id ?? req.user.college)
    ) {
      return res.status(403).json({ error: 'You can only update books from your college' });
    }

    const payload = { ...req.body };
    if (req.user.role === 'librarian') {
      payload.college = existingBook.college;
    }

    const book = await Book.findByIdAndUpdate(req.params.id, payload, {
      new: true,
      runValidators: true,
    }).populate('college', 'name');

    if (!book) {
      return res.status(404).json({ error: 'Book not found' });
    }

    res.json(book);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// DELETE book
router.delete('/:id', authenticateToken, authorizeRoles('librarian'), async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);

    if (!book) {
      return res.status(404).json({ error: 'Book not found' });
    }

    // Librarians can only delete books from their own college.
    if (
      req.user.role === 'librarian' &&
      String(book.college) !== String(req.user.college?._id ?? req.user.college)
    ) {
      return res.status(403).json({ error: 'You can only delete books from your college' });
    }

    await Book.findByIdAndDelete(req.params.id);

    res.json({ message: 'Book deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
