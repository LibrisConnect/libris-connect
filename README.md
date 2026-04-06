# LibrisConnect 📚
### A Multi-Tenant Collaborative Resource Ecosystem for Indian Higher Education

<p align="center">
  <img src="https://img.shields.io/badge/Status-In%20Development-yellow?style=for-the-badge" />
  <img src="https://img.shields.io/badge/Version-1.0.0--DRAFT-blue?style=for-the-badge" />
  <img src="https://img.shields.io/badge/Database-MongoDB%20Atlas-13aa52?style=for-the-badge&logo=mongodb" />
  <img src="https://img.shields.io/badge/Framework-Next.js%2016-black?style=for-the-badge&logo=nextdotjs" />
</p>

---

## 🌐 Overview

**LibrisConnect** is a scalable, cloud-native resource sharing platform that enables educational institutions across India to collaborate securely. The platform bridges the resource gap between Tier-1 and Tier-2/3 colleges by enabling inter-institutional sharing of academic resources.

> *"A student in a village in Andhra Pradesh should have access to the same academic resources as a student at IIT Madras."*

---

## ✨ Key Features

| Feature | Description |
|---|---|
| 🏛 **Multi-Tenancy** | Complete data isolation between colleges using MongoDB partitioning |
| 🔍 **Global Search** | Search across the entire college network |
| 📤 **Inter-Library Loans** | Request and approval workflow between institutions |
| 🔐 **Secure Access** | Role-based access control |
| 👥 **Role System** | Student, Librarian, and Admin roles |
| 📊 **Analytics** | Track resource usage and demand |

---

## 🏗 Architecture

```
┌──────────────────────────┐
│   Next.js Frontend       │
│   (Client)               │
└────────────┬─────────────┘
             │ HTTP/HTTPS
┌────────────▼─────────────┐
│  Express.js API Server   │
│  (Backend)               │
└────────────┬─────────────┘
             │
┌────────────▼─────────────┐
│   MongoDB Atlas          │
│   (Database)             │
└──────────────────────────┘
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- MongoDB Atlas account (free tier available)

### Step 1: Clone Repository
```bash
git clone https://github.com/yourusername/libris-connect.git
cd libris-connect
```

### Step 2: Set Up MongoDB Atlas
Follow the complete guide in [`MONGODB_INTEGRATION.md`](./MONGODB_INTEGRATION.md) or [`server/MONGODB_SETUP.md`](./server/MONGODB_SETUP.md)

Quick summary:
1. Create MongoDB Atlas account
2. Create a free cluster
3. Create database user
4. Get connection string

### Step 3: Configure Backend
```bash
cd server
npm install

# Create .env file with your MongoDB connection string
echo "MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/libris-connect?retryWrites=true&w=majority" > .env
echo "PORT=5000" >> .env
echo "NODE_ENV=development" >> .env

# Seed sample data
node src/scripts/seed.js

# Start backend server
npm run dev
```

### Step 4: Configure Frontend
```bash
cd ../client
npm install

# Frontend is pre-configured to use http://localhost:5000/api
# Optionally customize in .env.local if needed

# Start frontend
npm run dev
```

### Step 5: Access Application
Open `http://localhost:3000` in your browser

---

## 📁 Project Structure

```
libris-connect/
├── client/                    # Next.js Frontend
│   ├── app/                   # App directory with pages
│   ├── components/            # React components
│   ├── services/              # API client services
│   ├── lib/                   # Utilities and helpers
│   │   └── api-client.ts      # MongoDB API client
│   ├── types/                 # TypeScript types
│   └── package.json
│
├── server/                    # Express Backend
│   ├── src/
│   │   ├── index.js           # Express server
│   │   ├── models/            # MongoDB schemas
│   │   │   ├── Book.js
│   │   │   ├── User.js
│   │   │   └── College.js
│   │   ├── routes/            # API endpoints
│   │   │   ├── books.js
│   │   │   └── auth.js
│   │   └── scripts/
│   │       └── seed.js        # Database seeding
│   ├── MONGODB_SETUP.md       # Detailed setup guide
│   └── package.json
│
├── MONGODB_INTEGRATION.md     # Complete integration guide
└── README.md                  # This file
```

---

## 📚 API Documentation

### Books Endpoints

#### GET `/api/books`
Retrieve books with search and filters
```bash
GET /api/books?search=algorithms&category=CS&page=1&limit=20
```

Response:
```json
{
  "books": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "title": "Introduction to Algorithms",
      "author": "Cormen",
      "isbn": "978-0-262-03384-8",
      "category": "Computer Science",
      "college": { "_id": "...", "name": "IIT Madras" },
      "availability": { "total": 15, "available": 8 },
      "rating": 4.8,
      "createdAt": "2024-01-15T10:30:00Z"
    }
  ],
  "pagination": {
    "total": 42,
    "page": 1,
    "pages": 3
  }
}
```

#### GET `/api/books/:id`
Get specific book details
```bash
GET /api/books/507f1f77bcf86cd799439011
```

#### POST `/api/books`
Create new book (requires authentication)
```bash
POST /api/books
Content-Type: application/json

{
  "title": "Design Patterns",
  "author": "Gang of Four",
  "isbn": "0-201-63361-2",
  "category": "Software Design",
  "college": "507f1f77bcf86cd799439012",
  "availability": { "total": 10, "available": 5 }
}
```

#### PUT `/api/books/:id`
Update book details
```bash
PUT /api/books/507f1f77bcf86cd799439011
```

#### DELETE `/api/books/:id`
Delete book
```bash
DELETE /api/books/507f1f77bcf86cd799439011
```

### Authentication Endpoints

#### POST `/api/auth/login`
Login user
```bash
POST /api/auth/login
Content-Type: application/json

{
  "email": "student@college.edu",
  "collegeId": "507f1f77bcf86cd799439012"
}
```

Response:
```json
{
  "user": {
    "_id": "507f1f77bcf86cd799439013",
    "email": "student@college.edu",
    "name": "John Doe",
    "role": "student",
    "college": { "_id": "...", "name": "IIT Madras" }
  },
  "token": "JWT_TOKEN_..."
}
```

#### GET `/api/auth/me`
Get current user profile
```bash
GET /api/auth/me
X-User-ID: 507f1f77bcf86cd799439013
```

---

## 🛠 Development

### Running Both Servers

Terminal 1 - Backend:
```bash
cd server
npm run dev
```

Terminal 2 - Frontend:
```bash
cd client
npm run dev
```

### Available Scripts

**Backend:**
- `npm run dev` - Start with auto-reload
- `npm start` - Start production server
- `node src/scripts/seed.js` - Seed database with sample data

**Frontend:**
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint

---

## 🗄️ Database Schema

### Collections

**Books** - Academic resources
- title, author, isbn, description, category
- publisher, publishedYear, imageUrl, rating
- availability (total, available)
- college (reference), createdBy (reference)

**Users** - College members
- email, name, role (student|librarian|admin)
- college (reference), isActive, lastLogin

**Colleges** - Participating institutions
- name, code, state, city, tier (tier1|tier2|tier3)
- email, libraryName, contactPerson, phone

---

## 🔒 Security

- CORS enabled for local development
- Data isolation at college level
- User role-based access control
- Secure API endpoints
- MongoDB Atlas encryption at rest

### Production Considerations
- Enable HTTPS/SSL
- Configure CORS for specific domains
- Implement JWT authentication
- Rate limiting
- Environment variable management
- Database backups

---

## 📦 Deployment

### MongoDB Atlas
- Already hosted cloud-side
- Available at `mongo+srv://...` connection string
- Automatic backups included

### Backend Deployment
Deploy `/server` to any Node.js hosting:
- Vercel (serverless)
- Railway
- Render
- AWS EC2/Lambda
- DigitalOcean App Platform

### Frontend Deployment
Deploy `/client` to any static hosting:
- Vercel (recommended for Next.js)
- Netlify
- AWS S3 + CloudFront
- Any CDN provider

---

## 🚨 Troubleshooting

### MongoDB Connection Issues
- Verify connection string format
- Check database username/password
- Ensure IP whitelisted in Atlas Network Access
- Confirm cluster is running (not paused)

### API Not Responding
- Check backend running on port 5000
- Verify `MONGODB_URI` in `.env`
- Check logs: `npm run dev`

### Frontend Can't Connect
- Verify backend is running
- Check `NEXT_PUBLIC_API_URL` in `.env.local`
- Look for CORS errors in browser console

### Books Not Showing
- Run seed script: `node server/src/scripts/seed.js`
- Check MongoDB collections in Atlas console
- Verify API endpoint: `curl http://localhost:5000/api/health`

---

## 📖 Documentation

- [Complete MongoDB Integration Guide](./MONGODB_INTEGRATION.md)
- [MongoDB Atlas Setup Instructions](./server/MONGODB_SETUP.md)
- [API Contracts](./client/docs/API_CONTRACTS.md)

---

## 🤝 Contributing

Contributions are welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

---

## 📄 License

This project is licensed under the MIT License - see LICENSE file for details.

---

## 🙏 Acknowledgments

- MongoDB Atlas for database hosting
- Next.js for the frontend framework
- Express.js for the backend framework
- India's educational institutions for inspiration

---

## 📞 Support

For issues and questions:
- Check existing GitHub issues
- Create a new issue with reproduction steps
- Email: support@libris-connect.com

---

**Last Updated:** April 2024  
**Status:** Active Development  
**Database:** MongoDB Atlas  
**Backend:** Node.js + Express  
**Frontend:** Next.js 16 + React 19
