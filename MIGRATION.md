# Migration Guide: Mock Data → MongoDB Atlas

This document explains the changes made to migrate LibrisConnect from mock/local data to MongoDB Atlas.

---

## 📊 What Changed

### Frontend Changes

#### 1. Added API Client (`lib/api-client.ts`)
**Purpose:** Centralized HTTP client for backend communication

```typescript
// NEW: For all API calls
import { apiClient } from '@/lib/api-client'

await apiClient.getBooks(search, category)
await apiClient.getBook(id)
await apiClient.createBook(data)
```

#### 2. Updated Books Service (`services/books.ts`)
**Impact:** Now async with fallback to mock data

```typescript
// BEFORE: Synchronous
export function getBooks(): Book[] {
  return mockBooks
}

// AFTER: Asynchronous with fallback
export async function getBooks(): Promise<Book[]> {
  try {
    const response = await apiClient.getBooks()
    return response.books || []
  } catch {
    return mockBooks // Fallback
  }
}
```

#### 3. Updated Search Service (`services/search-service.ts`)
**Impact:** Now queries backend instead of local filtering

```typescript
// BEFORE: Local filtering only
export function searchBooks(query: string): Book[] {
  return getBooks().filter(...)
}

// AFTER: Backend search with local fallback
export async function searchBooks(query: string): Promise<Book[]> {
  try {
    return await apiClient.getBooks(query)
  } catch {
    // Local fallback search
  }
}
```

#### 4. Updated Search Page (`app/search/page.tsx`)
**Impact:** Now handles async state with React 19

```typescript
// BEFORE: Synchronous filtering
const filteredBooks = useMemo(
  () => searchBooks(searchQuery),
  [searchQuery]
)

// AFTER: Async with useTransition
const [filteredBooks, setFilteredBooks] = useState<Book[]>([])
const [isPending, startTransition] = useTransition()

useEffect(() => {
  startTransition(async () => {
    const results = await searchBooks(searchQuery)
    setFilteredBooks(results)
  })
}, [searchQuery])
```

---

## 🏗️ Backend Structure (NEW)

### Created `/server` Directory

```
server/
├── src/
│   ├── index.js              # Express server
│   ├── models/
│   │   ├── Book.js           # Mongoose Book schema
│   │   ├── User.js           # Mongoose User schema
│   │   └── College.js        # Mongoose College schema
│   ├── routes/
│   │   ├── books.js          # CRUD routes for books
│   │   └── auth.js           # Authentication routes
│   └── scripts/
│       └── seed.js           # Database seeding script
├── package.json
├── .env                      # Database credentials
├── .env.example
├── .gitignore
└── MONGODB_SETUP.md
```

### New Dependencies

**Backend:**
```json
{
  "express": "^4.18.2",
  "mongoose": "^8.0.0",
  "dotenv": "^16.3.1",
  "cors": "^2.8.5",
  "compression": "^1.7.4"
}
```

**Frontend:**
- No new dependencies (uses native `fetch`)

---

## 🔄 Data Flow Comparison

### BEFORE: Mock Data
```
User Action
    ↓
React Component
    ↓
Search Service (searchBooks)
    ↓
Books Service (getBooks)
    ↓
Mock Data Array (mockBooks.ts)
    ↓
Render Results
```

### AFTER: MongoDB + API
```
User Action
    ↓
React Component
    ↓
Search Service (searchBooks)
    ↓
API Client (apiClient.getBooks)
    ↓
HTTP GET /api/books
    ↓
Express Server
    ↓
MongoDB Query
    ↓
Return JSON
    ↓
Render Results
```

---

## 🔌 Configuration

### Frontend
```env
# .env.local (NEW)
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

For production:
```env
NEXT_PUBLIC_API_URL=https://api.your-domain.com/api
```

### Backend
```env
# .env (NEW)
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/libris-connect
PORT=5000
NODE_ENV=development
```

---

## 📈 API Endpoints

All new endpoints are under `/api/`:

### Books
- `GET /api/books` - Search and list
- `GET /api/books/:id` - Get single book
- `POST /api/books` - Create
- `PUT /api/books/:id` - Update
- `DELETE /api/books/:id` - Delete

### Auth
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get user

---

## 🗂️ Database Schema

### Books Collection
```javascript
{
  _id: ObjectId,
  title: String,
  author: String,
  isbn: String,
  description: String,
  category: String,
  publisher: String,
  publishedYear: Number,
  imageUrl: String,
  rating: Number,
  availability: { total: Number, available: Number },
  college: ObjectId,      // Reference to College
  createdBy: ObjectId,    // Reference to User
  createdAt: Date,
  updatedAt: Date
}
```

### Mock Data Preservation
The original mock data (`lib/mock-books.ts`) is kept as:
- **Fallback data** if API fails
- **Local development reference**
- **Seed data source** (can be enhanced)

---

## ✨ Benefits

| Aspect | Before | After |
|--------|--------|-------|
| **Storage** | In-memory arrays | Cloud database |
| **Persistence** | Lost on app restart | Persistent |
| **Scalability** | Limited to mock size | Scales to 1000s |
| **Real-time** | N/A | Can add real-time sync |
| **Multi-user** | Not supported | Full support |
| **Search** | Client-side filtering | Server-side queries |
| **Deployment** | Single deploy | Backend + Frontend |

---

## 🔄 Gradual Migration Path

### Phase 1: ✅ Completed
- Created Express backend
- Set up MongoDB connection
- Created API routes
- Added seed data

### Phase 2: Parallel Running
- Frontend can use both mock data and API
- Falls gracefully to mock if API unavailable
- Can test both simultaneously

### Phase 3: Future
- Remove mock data completely
- Add more complex features
- Implement real authentication
- Add inter-library loan workflows

---

## 🧪 Testing Migration

### Test 1: Backend Alone
```bash
cd server
npm run dev
curl http://localhost:5000/api/health
# Should respond with server status
```

### Test 2: Database Connection
```bash
curl http://localhost:5000/api/books
# Should return array of books from MongoDB
```

### Test 3: Frontend + Backend
```bash
cd client && npm run dev
# Open http://localhost:3000
# Search should work and show books from MongoDB
```

### Test 4: Fallback Mode
```bash
# Stop backend server
# Frontend should still show mock data
# Check browser console for warning message
```

---

## 📝 Code Migration Examples

### Example 1: Updating a Component

**Before:**
```typescript
import { getBooks } from '@/services/books'

export function BookList() {
  const books = getBooks() // Synchronous
  return <div>{books.map(...)}</div>
}
```

**After:**
```typescript
import { getBooks } from '@/services/books'
import { useEffect, useState } from 'react'

export function BookList() {
  const [books, setBooks] = useState([])
  
  useEffect(() => {
    getBooks().then(setBooks) // Asynchronous
  }, [])
  
  return <div>{books.map(...)}</div>
}
```

### Example 2: Adding a New Feature

**Create backend route (`server/src/routes/books.js`):**
```javascript
router.get('/featured', async (req, res) => {
  const featured = await Book.find({ rating: { $gte: 4.5 } })
  res.json(featured)
})
```

**Use in frontend (`lib/api-client.ts`):**
```typescript
async getFeaturedBooks(): Promise<any> {
  return this.request('/books/featured')
}
```

**Use in component:**
```typescript
const featured = await apiClient.getFeaturedBooks()
```

---

## ⚠️ Breaking Changes

### For Frontend Developers

1. **getBooks() is now async**
   ```typescript
   // Old: const books = getBooks()
   // New: const books = await getBooks()
   ```

2. **Search functions are now async**
   ```typescript
   // Old: searchBooks(query)
   // New: await searchBooks(query)
   ```

3. **College options need to be fetched**
   ```typescript
   // Old: Synchronous
   // New: await getCollegeOptions()
   ```

### For API Consumers

1. **New backend required** - Can't run frontend-only anymore
2. **Environment variables** - Must set `NEXT_PUBLIC_API_URL`
3. **CORS** - Already configured but may need adjustment for production

---

## 🚀 Rollback Plan

If you need to revert to mock data only:

1. Revert `services/books.ts` from async to synchronous
2. Revert `services/search-service.ts` to use local filtering
3. Revert `app/search/page.tsx` to remove async state management
4. Remove backend entirely

However, with fallback behavior in place, the system degrades gracefully!

---

## ❓ FAQ

**Q: Will the app work without the backend?**
A: Yes! Frontend falls back to mock data automatically.

**Q: Can I run everything locally?**
A: Yes! With MongoDB Atlas, you don't need local MongoDB setup.

**Q: Do I need to change my components?**
A: Only if they were directly calling `getBooks()`. Most will work with fallback.

**Q: What about TypeScript types?**
A: Book types remain the same. MongoDB documents auto-convert to TypeScript types.

**Q: Can I still use mock data in development?**
A: Yes! Backend being offline = automatic fallback to mock data.

---

## 📚 Additional Resources

- [MONGODB_INTEGRATION.md](../MONGODB_INTEGRATION.md) - Complete guide
- [QUICK_START.md](../QUICK_START.md) - Quick reference
- [README.md](../README.md) - Project overview

---

**Version:** 1.0  
**Date:** April 2024  
**Status:** Completed
