# MongoDB Atlas Setup Checklist ✅

Complete these steps to set up your LibrisConnect project with MongoDB Atlas.

---

## 🔧 Prerequisites Check

- [ ] Node.js 18+ installed (`node --version`)
- [ ] npm 9+ installed (`npm --version`)
- [ ] Git installed (`git --version`)
- [ ] Text editor/IDE ready (VS Code recommended)

---

## 1️⃣ MongoDB Atlas Account Setup (10 min)

- [ ] Go to https://account.mongodb.com/account/register
- [ ] Create account with email
- [ ] Verify email address
- [ ] Create or select organization
- [ ] Create project (name it "libris-connect")

---

## 2️⃣ Create Free Cluster (5 min)

- [ ] Click "Create a Deployment"
- [ ] Select "Shared" tier (free)
- [ ] Choose region (recommended: Asia Pacific)
- [ ] Click "Create Deployment"
- [ ] Wait for cluster to be ready (usually 2-3 minutes)

---

## 3️⃣ Create Database User (3 min)

- [ ] Go to "Database Access" in left menu
- [ ] Click "+ Add New Database User"
- [ ] Set authentication to "Password"
- [ ] Enter username: `librisconnect_user`
- [ ] Enter strong password (save securely)
- [ ] Set role to "Atlas Admin" (for development)
- [ ] Click "Add User"

---

## 4️⃣ Configure Network Access (3 min)

- [ ] Go to "Network Access" in left menu
- [ ] Click "+ Add IP Address"
- [ ] For development: Select "ALLOW ACCESS FROM ANYWHERE"
- [ ] Click "Confirm"
- [ ] Note: For production, restrict to specific IPs

---

## 5️⃣ Get Connection String (2 min)

- [ ] Go to "Databases" view
- [ ] Click "Connect" on your cluster
- [ ] Select "Drivers"
- [ ] Copy connection string
- [ ] Format should be: `mongodb+srv://username:password@cluster...`

---

## 6️⃣ Clone Repository (2 min)

```bash
# If not already cloned
git clone https://github.com/yourusername/libris-connect.git
cd libris-connect
```

- [ ] Repository cloned locally
- [ ] You're in the `libris-connect` directory

---

## 7️⃣ Backend Configuration (5 min)

```bash
cd server
npm install
```

- [ ] Navigated to `/server` directory
- [ ] npm install completed

**Create `.env` file:**

```bash
cat > .env << EOF
MONGODB_URI=mongodb+srv://librisconnect_user:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/libris-connect?retryWrites=true&w=majority
PORT=5000
NODE_ENV=development
EOF
```

Replace `YOUR_PASSWORD` with your actual password

- [ ] Created `.env` file with MongoDB URI
- [ ] Replaced password placeholder with actual password
- [ ] PORT set to 5000
- [ ] NODE_ENV set to development

---

## 8️⃣ Verify Backend Connection (5 min)

```bash
# Start the backend server
npm run dev
```

Expected output:
```
✓ Connected to MongoDB Atlas
Server running on http://localhost:5000
```

- [ ] Backend started without errors
- [ ] See "Connected to MongoDB Atlas" message

---

## 9️⃣ Seed Database (3 min)

**Open new terminal/tab:**

```bash
cd libris-connect/server
node src/scripts/seed.js
```

Expected output:
```
Connected to MongoDB Atlas
Cleared existing data
Created 3 colleges
Created 5 books
✓ Database seeded successfully
```

- [ ] Seed script ran successfully
- [ ] See "3 colleges" created
- [ ] See "5 books" created
- [ ] See success message

---

## 🔟 Verify Data in MongoDB Atlas (2 min)

- [ ] Go to MongoDB Atlas console
- [ ] Click on your cluster
- [ ] Click "Collections"
- [ ] Verify these collections exist:
  - [ ] `books` (should have 5 documents)
  - [ ] `colleges` (should have 3 documents)
  - [ ] `users` (may be empty)

---

## 1️⃣1️⃣ Frontend Configuration (3 min)

```bash
cd ../client
npm install
```

- [ ] Navigated to `/client` directory
- [ ] npm install completed
- [ ] `.env.local` file already created with API URL

---

## 1️⃣2️⃣ Start Frontend (5 min)

```bash
npm run dev
```

Expected output:
```
  ◇ Local:        http://localhost:3000
```

- [ ] Frontend started successfully
- [ ] See "localhost:3000" in terminal

---

## 1️⃣3️⃣ Test Application (5 min)

- [ ] Open browser to `http://localhost:3000`
- [ ] Navigate to Search page
- [ ] See list of 5 books from MongoDB
- [ ] Search for "algorithms" - should find 1 book
- [ ] Filter by college - see options populated
- [ ] No console errors (warnings are okay)

---

## 1️⃣4️⃣ Verify Backend API (3 min)

Open new terminal and test API directly:

```bash
# Test health endpoint
curl http://localhost:5000/api/health

# Test books endpoint
curl http://localhost:5000/api/books
```

- [ ] `/api/health` returns status
- [ ] `/api/books` returns array of books

---

## ✅ Setup Complete!

Your LibrisConnect project is now set up with MongoDB Atlas!

### What's Running:
- ✅ MongoDB Atlas (cloud database)
- ✅ Express backend (port 5000)
- ✅ Next.js frontend (port 3000)
- ✅ Sample data seeded

### Next Steps:

1. **Explore the codebase**
   - [ ] Check `/server/src/models` for database schemas
   - [ ] Check `/server/src/routes` for API endpoints
   - [ ] Check `/client/lib/api-client.ts` for API client

2. **Try adding data**
   - [ ] Create a new book via API
   - [ ] See it appear in frontend search

3. **Deploy** (when ready)
   - [ ] Follow deployment guides in `MONGODB_INTEGRATION.md`
   - [ ] Deploy backend to Railway or Render
   - [ ] Deploy frontend to Vercel

---

## 🐛 Troubleshooting

### Issue: Connection refused to MongoDB
- [ ] Check MONGODB_URI in `.env`
- [ ] Verify password is correct
- [ ] Check cluster is running in Atlas
- [ ] Verify IP is whitelisted

### Issue: Port 5000 already in use
- [ ] Change PORT in `.env` to different number
- [ ] Or kill process: `lsof -ti:5000 | xargs kill -9`

### Issue: Books not showing in frontend
- [ ] Verify backend running: `curl http://localhost:5000/api/health`
- [ ] Run seed script: `node server/src/scripts/seed.js`
- [ ] Check browser console for errors

### Issue: CORS errors
- [ ] Backend CORS already configured for `*` in development
- [ ] Restart backend server
- [ ] Clear browser cache

### Issue: npm install fails
- [ ] Delete `node_modules` folder
- [ ] Delete `package-lock.json`
- [ ] Run `npm install` again
- [ ] Ensure Node.js 18+ installed

---

## 📞 Need Help?

- [MONGODB_INTEGRATION.md](../MONGODB_INTEGRATION.md) - Detailed guide
- [QUICK_START.md](../QUICK_START.md) - Quick reference
- [MIGRATION.md](../MIGRATION.md) - Understanding changes
- [MongoDB Atlas Docs](https://docs.mongodb.com/atlas/)

---

## 🎉 Congratulations!

Your MongoDB Atlas integration is complete!

**Keep this checklist handy for:**
- Setting up on different machines
- Onboarding team members
- Disaster recovery

---

**Last Updated:** April 2024
