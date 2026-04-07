import mongoose from 'mongoose';

const borrowHistorySchema = new mongoose.Schema(
  {
    borrowerName: {
      type: String,
      required: true,
      trim: true,
    },
    borrowerEmail: {
      type: String,
      trim: true,
      lowercase: true,
    },
    borrowedAt: {
      type: Date,
      required: true,
    },
    dueAt: {
      type: Date,
      required: true,
    },
    returnedAt: {
      type: Date,
    },
    status: {
      type: String,
      enum: ['borrowed', 'returned', 'overdue'],
      default: 'returned',
    },
    conditionOnReturn: {
      type: String,
      enum: ['excellent', 'good', 'fair', 'poor'],
    },
    notes: {
      type: String,
      trim: true,
    },
  },
  { _id: false }
);

const conditionReviewSchema = new mongoose.Schema(
  {
    reviewerName: {
      type: String,
      required: true,
      trim: true,
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
      required: true,
    },
    condition: {
      type: String,
      enum: ['excellent', 'good', 'fair', 'poor'],
      required: true,
    },
    review: {
      type: String,
      required: true,
      trim: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

const bookSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    author: {
      type: String,
      required: true,
      trim: true,
    },
    isbn: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    category: {
      type: String,
      required: true,
      trim: true,
    },
    publisher: {
      type: String,
      trim: true,
    },
    publishedYear: {
      type: Number,
    },
    imageUrl: {
      type: String,
    },
    rating: {
      type: Number,
      min: 0,
      max: 5,
      default: 0,
    },
    availability: {
      total: {
        type: Number,
        default: 0,
      },
      available: {
        type: Number,
        default: 0,
      },
    },
    borrowPolicy: {
      maxBorrowDays: {
        type: Number,
        default: 14,
      },
      renewalLimit: {
        type: Number,
        default: 1,
      },
      dailyFineInr: {
        type: Number,
        default: 3,
      },
    },
    borrowHistory: {
      type: [borrowHistorySchema],
      default: [],
    },
    conditionReviews: {
      type: [conditionReviewSchema],
      default: [],
    },
    college: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'College',
      required: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model('Book', bookSchema);
