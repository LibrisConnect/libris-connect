import mongoose from 'mongoose';

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
