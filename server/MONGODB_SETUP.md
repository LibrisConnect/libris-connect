# MongoDB Atlas Setup Guide

## Prerequisites

1. **MongoDB Atlas Account**: Create a free account at https://www.mongodb.com/cloud/atlas

## Step 1: Create MongoDB Atlas Cluster

1. Sign in to [MongoDB Atlas](https://account.mongodb.com/account/login)
2. Click "Create a Project" (or use existing project)
3. Click "Create a Deployment"
4. Select **Shared** (free tier)
5. Choose your region (recommended: closest to your users or Asia Pacific)
6. Click "Create Deployment"
7. Wait for the cluster to be ready (usually 2-3 minutes)

## Step 2: Create Database User

1. In your cluster view, go to **Database Access** (left sidebar)
2. Click **"+ Add New Database User"**
3. Set **Authentication Method** to "Password"
4. Enter **Username** (e.g., `librisconnect_user`)
5. Enter **Password** (save this securely)
6. Set **Database User Privileges** to "Built-in Role" → "Atlas Admin"
7. Click "Add User"

## Step 3: Configure Network Access

1. Go to **Network Access** (left sidebar)
2. Click **"+ Add IP Address"**
3. Choose:
   - **ALLOW ACCESS FROM ANYWHERE** (for development/testing)
   - Or add specific IPs (for production)
4. Click "Confirm"

## Step 4: Get Connection String

1. Go back to **Databases** view
2. Click **"Connect"** on your cluster
3. Select **"Drivers"**
4. Copy the connection string (looks like):
   ```
   mongodb+srv://librisconnect_user:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
5. Replace `<password>` with your actual password

## Step 5: Configure Environment Variables

1. Create `.env` file in `/server` directory
2. Paste your connection string:
   ```
   MONGODB_URI=mongodb+srv://librisconnect_user:your_password@cluster0.xxxxx.mongodb.net/libris-connect?retryWrites=true&w=majority
   PORT=5000
   NODE_ENV=development
   ```

## Step 6: Install Dependencies & Seed Data

```bash
cd server
npm install
node src/scripts/seed.js
```

## Step 7: Start Server

```bash
npm run dev
```

Server will run at `http://localhost:5000`

## API Endpoints

### Books
- `GET /api/books` - Get all books
- `GET /api/books/:id` - Get single book
- `POST /api/books` - Create book
- `PUT /api/books/:id` - Update book
- `DELETE /api/books/:id` - Delete book

### Authentication
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

## MongoDB Atlas Console Features

- **Storage**: Monitor data usage
- **Performance**: View query performance and metrics
- **Backup**: Automated daily backups (free tier)
- **Alerts**: Set up notifications for cluster issues
