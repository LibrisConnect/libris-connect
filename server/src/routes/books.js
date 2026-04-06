import express from 'express';
import Book from '../models/Book.js';

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
router.post('/', async (req, res) => {
  try {
    const book = new Book(req.body);
    await book.save();
    await book.populate('college', 'name');

    res.status(201).json(book);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// PUT update book
router.put('/:id', async (req, res) => {
  try {
    const book = await Book.findByIdAndUpdate(req.params.id, req.body, {
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
router.delete('/:id', async (req, res) => {
  try {
    const book = await Book.findByIdAndDelete(req.params.id);

    if (!book) {
      return res.status(404).json({ error: 'Book not found' });
    }

    res.json({ message: 'Book deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
