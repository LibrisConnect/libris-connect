# MongoDB Atlas Integration Guide

## Overview

Your LibrisConnect project now uses **MongoDB Atlas** as its primary database. The project consists of:

- **Frontend** (`/client`): Next.js application with React
- **Backend** (`/server`): Node.js/Express API server connected to MongoDB

## Quick Start

### 1. Set Up MongoDB Atlas

Follow the detailed setup guide in [`/server/MONGODB_SETUP.md`](./server/MONGODB_SETUP.md)

Key steps:
- Create MongoDB Atlas account
- Create a cluster (free tier available)
- Create database user
- Configure network access
- Get connection string

### 2. Configure Backend Server

```bash
cd server
npm install
```

Create `.env` file with your MongoDB connection string:
```env
MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/libris-connect?retryWrites=true&w=majority
PORT=5000
NODE_ENV=development
```

Seed sample data:
```bash
node src/scripts/seed.js
```

Start the server:
```bash
npm run dev
```

Server will run on `http://localhost:5000`

### 3. Configure Frontend Client

```bash
cd client
npm install
```

Frontend is already configured to use the backend API at `http://localhost:5000/api`

For custom API URL, update `.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

Start the frontend:
```bash
npm run dev
```

Open `http://localhost:3000` in your browser

## Project Structure

```
libris-connect/
├── client/                          # Next.js Frontend
│   ├── app/                          # Next.js App Router
│   ├── components/                   # React Components
│   ├── services/                     # API Service Layer
│   │   ├── books.ts                  # Books API (now async)
│   │   └── search-service.ts         # Search Service (now async)
│   ├── lib/
│   │   ├── api-client.ts            # NEW: MongoDB API Client
│   │   └── mock-books.ts            # Legacy mock data (fallback)
│   └── .env.local                    # Frontend config
│
├── server/                           # NEW: Express Backend
│   ├── src/
│   │   ├── index.js                  # Server entry point
│   │   ├── models/
│   │   │   ├── Book.js              # Book schema
│   │   │   ├── User.js              # User schema
│   │   │   └── College.js           # College schema
│   │   ├── routes/
│   │   │   ├── books.js             # Books API routes
│   │   │   └── auth.js              # Auth routes
│   │   └── scripts/
│   │       └── seed.js              # Database seeding
│   ├── package.json
│   ├── .env                          # Server config (git ignored)
│   ├── .env.example                  # Example env file
│   ├── .gitignore
│   └── MONGODB_SETUP.md              # Detailed MongoDB setup
│
├── package.json                      # Root package.json (if configured)
├── README.md                         # Project overview
└── MONGODB_INTEGRATION.md           # This file
```

## Database Models

### Book Schema
```javascript
{
  title: String,
  author: String,
  isbn: String (unique),
  description: String,
  category: String,
  publisher: String,
  publishedYear: Number,
  imageUrl: String,
  rating: Number (0-5),
  availability: {
    total: Number,
    available: Number
  },
  college: ObjectId (references College),
  createdBy: ObjectId (references User),
  createdAt: Date,
  updatedAt: Date
}
```

### User Schema
```javascript
{
  email: String (unique),
  name: String,
  role: String (student|librarian|admin),
  college: ObjectId (references College),
  isActive: Boolean,
  lastLogin: Date,
  createdAt: Date,
  updatedAt: Date
}
```

### College Schema
```javascript
{
  name: String (unique),
  code: String (unique),
  state: String,
  city: String,
  email: String,
  tier: String (tier1|tier2|tier3),
  libraryName: String,
  contactPerson: String,
  phone: String,
  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

## API Endpoints

### Books
- `GET /api/books` - Get all books (supports search, category, pagination)
- `GET /api/books/:id` - Get single book by ID
- `POST /api/books` - Create new book
- `PUT /api/books/:id` - Update book
- `DELETE /api/books/:id` - Delete book

### Authentication
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user profile

## What Changed in Frontend

### Before (Mock Data)
```typescript
// Synchronous, used mock data
const books = getBooks()
const colleges = getCollegeOptions()
```

### After (MongoDB API)
```typescript
// Asynchronous, fetches from backend
const books = await getBooks()
const colleges = await getCollegeOptions()
```

### Migration Summary
1. **books.ts** - Added async data fetching with API fallback to mock data
2. **search-service.ts** - Updated to use async API with local search fallback
3. **search/page.tsx** - Updated to handle async state management with `useTransition`
4. **api-client.ts** - NEW: Client for communicating with backend
5. **.env.local** - NEW: API configuration

## Development Workflow

### Terminal 1: Start MongoDB Via Atlas
No action needed - MongoDB is cloud-hosted

### Terminal 2: Start Backend Server
```bash
cd server
npm run dev
```

### Terminal 3: Start Frontend
```bash
cd client
npm run dev
```

Access the application at `http://localhost:3000`

## Fallback Behavior

The application is designed with graceful degradation:
- If the backend API is unavailable, the frontend falls back to mock data
- This allows development to continue even if the server is down
- Users see a console warning when using fallback data

## Deployment

### MongoDB Atlas
- No action needed for MongoDB - it's already hosted
- No additional infrastructure required

### Backend Server
Deploy the `/server` directory to:
- Vercel (with serverless functions)
- Railway
- Render
- DigitalOcean App Platform
- AWS EC2 / Lambda
- Any Node.js hosting

### Frontend
Deploy the `/client` directory to:
- Vercel (recommended for Next.js)
- Netlify
- AWS Static Site
- Any static hosting

Example Vercel deployment:
```bash
# Deploy frontend
vercel deploy --prod

# Deploy backend (if using serverless)
cd server
vercel deploy --prod
```

Environment variables for production:
```env
# .env.production
MONGODB_URI=mongodb+srv://prod_user:prod_password@cluster.mongodb.net/libris-connect
PORT=5000
NODE_ENV=production
```

## Troubleshooting

### MongoDB Connection Fails
- Check connection string in `.env`
- Verify database user credentials
- Ensure IP address is whitelisted in Atlas
- Check if cluster is running (not paused)

### Books Not Showing
- Ensure backend is running (`http://localhost:5000/api/health`)
- Check frontend logs for API errors
- Run seed script: `node server/src/scripts/seed.js`

### CORS Errors
- Backend CORS is configured for all origins in development
- For production, update CORS config in `server/src/index.js`

### Frontend Can't Connect to API
- Check `NEXT_PUBLIC_API_URL` in `.env.local`
- Verify backend port (default: 5000)
- Check firewall settings

## Next Steps

1. **User Authentication**
   - Integrate Microsoft Entra ID as mentioned in README
   - Update auth routes in `/server/src/routes/auth.js`

2. **Advanced Features**
   - Inter-Library Loans (ILL) workflow
   - Analytics and dashboard
   - File uploads for book covers
   - Rate limiting and validation

3. **Testing**
   - Add Jest/Vitest tests for backend routes
   - Add React Testing Library tests for components
   - Add E2E tests with Playwright

4. **Monitoring**
   - Set up MongoDB Atlas alerts
   - Add backend error logging
   - Monitor API performance

## Support

For MongoDB Atlas help:
- [MongoDB Atlas Documentation](https://www.mongodb.com/docs/atlas/)
- [Connection String Reference](https://www.mongodb.com/docs/atlas/driver-connection/)

For project issues:
- Check existing GitHub issues
- Create a new issue with reproduction steps
