# MongoDB Atlas Setup - Quick Reference

## ⚡ 5-Minute Setup

### 1. MongoDB Atlas (2 min)
```
Go to: atlas.mongodb.com
→ Create Project
→ Build Cluster (free tier)
→ Create User (save credentials)
→ Network Access: Allow all (for dev)
→ Copy connection string
```

### 2. Backend Config (1 min)
```bash
cd server
npm install
echo "MONGODB_URI=<your-connection-string>" > .env
```

### 3. Seed Database (1 min)
```bash
node src/scripts/seed.js
```

### 4. Start Server (1 min)
```bash
npm run dev
# Server runs on http://localhost:5000
```

---

## 📋 Connection String Format

```
mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/libris-connect?retryWrites=true&w=majority
                └─ user ─┘ └─ pass ─┘ └──────── host ───────────┘              └─ database ─┘
```

---

## 🔐 Environment Variables

**Server (.env)**
```env
MONGODB_URI=mongodb+srv://...
PORT=5000
NODE_ENV=development
```

**Client (.env.local)**
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

---

## 🚀 Running Everything

### Terminal 1: Backend
```bash
cd server && npm run dev
```

### Terminal 2: Frontend
```bash
cd client && npm run dev
```

### Terminal 3: Browser
```
http://localhost:3000
```

---

## 📊 Sample Data Included

After seeding, you'll have:
- 3 Colleges (IIT Madras, Osmania U, Vidyasagar U)
- 5 Books across categories (CS, Physics, Math, Chemistry)
- Ready to search and filter

---

## 🐛 Common Issues

| Problem | Solution |
|---------|----------|
| Connection refused | Check MongoDB URI, verify cluster is running |
| Books not showing | Run `node src/scripts/seed.js` |
| CORS error | Backend CORS already configured, restart server |
| Port 5000 in use | Change PORT in `.env` or kill process |
| API not found | Verify backend running: `curl http://localhost:5000/api/health` |

---

## 📦 What's New

✅ Express backend with MongoDB
✅ Three database models (Book, User, College)
✅ Full CRUD API for books
✅ Authentication endpoints
✅ Seed script with sample data
✅ CORS enabled for frontend
✅ Fallback to mock data if API unavailable

---

## 🔗 Useful Links

- [MongoDB Atlas Console](https://account.mongodb.com/)
- [Connection String Docs](https://www.mongodb.com/docs/atlas/driver-connection/)
- [Mongoose Documentation](https://mongoosejs.com/)
- [Express.js Docs](https://expressjs.com/)

---

## ✨ Next Steps

After setup:
1. ✅ Verify books show in search
2. 🔄 Add more books via API
3. 🔐 Implement real authentication
4. 📱 Deploy backend and frontend
5. 🎯 Configure for production

---

**Need help?** See `MONGODB_INTEGRATION.md` for detailed instructions.
