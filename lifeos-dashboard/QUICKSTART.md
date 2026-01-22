# 🚀 Quick Start Guide - Life OS Dashboard

## Option 1: Using Docker (Recommended - Easiest)

### Step 1: Start MongoDB with Docker
```bash
# Start MongoDB in a Docker container
docker run -d -p 27017:27017 --name lifeos-mongo mongo:latest

# Verify it's running
docker ps | grep lifeos-mongo
```

### Step 2: Start the Backend
```bash
cd /home/user/cbt/lifeos-dashboard/backend
npm run dev
```

You should see:
```
✅ MongoDB connected successfully
🚀 Server running on port 5000
```

### Step 3: Start the Frontend (New Terminal)
```bash
cd /home/user/cbt/lifeos-dashboard/frontend
npm run dev
```

You should see:
```
  VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://localhost:3000/
```

### Step 4: Open Your Browser
Visit: **http://localhost:3000**

---

## Option 2: Install MongoDB Locally

### On Ubuntu/Debian:
```bash
# Import MongoDB public key
wget -qO - https://www.mongodb.org/static/pgp/server-7.0.asc | sudo apt-key add -

# Add MongoDB repository
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu $(lsb_release -cs)/mongodb-org/7.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list

# Install MongoDB
sudo apt-get update
sudo apt-get install -y mongodb-org

# Start MongoDB
sudo systemctl start mongod
sudo systemctl enable mongod

# Verify
sudo systemctl status mongod
```

### On macOS:
```bash
brew tap mongodb/brew
brew install mongodb-community@7.0
brew services start mongodb-community@7.0
```

### On Windows:
Download and install from: https://www.mongodb.com/try/download/community

Then follow **Step 2-4** from Option 1 above.

---

## Option 3: Use MongoDB Atlas (Cloud - Free Tier)

### Step 1: Create Free Account
1. Go to https://www.mongodb.com/cloud/atlas/register
2. Sign up for free
3. Create a free cluster (M0)
4. Get your connection string

### Step 2: Update Backend .env
```bash
cd /home/user/cbt/lifeos-dashboard/backend
```

Edit `.env` and replace `MONGODB_URI` with your Atlas connection string:
```env
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/lifeos-dashboard
```

Then follow **Step 2-4** from Option 1.

---

## 🎯 Using the Automated Startup Script

If you have MongoDB installed (locally or Docker), you can use the automated script:

```bash
cd /home/user/cbt/lifeos-dashboard
./start.sh
```

This will:
- ✅ Check/start MongoDB
- ✅ Install dependencies (if needed)
- ✅ Start backend on http://localhost:5000
- ✅ Start frontend on http://localhost:3000
- ✅ Open your browser automatically

---

## 📋 Manual Step-by-Step (Without Script)

### Terminal 1 - Backend:
```bash
cd /home/user/cbt/lifeos-dashboard/backend
npm run dev
```

**Leave this running!** You should see:
```
✅ MongoDB connected successfully
🚀 Server running on port 5000
🌍 Environment: development
📡 CORS enabled for: http://localhost:3000
```

### Terminal 2 - Frontend:
```bash
cd /home/user/cbt/lifeos-dashboard/frontend
npm run dev
```

**Leave this running!** You should see:
```
  VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://localhost:3000/
  ➜  Network: use --host to expose
```

### Open Browser:
Visit: **http://localhost:3000**

---

## 🎨 First Time Setup

1. **Sign Up:**
   - Click "Sign up"
   - Enter your name, email, and password (min 8 characters)
   - Click "Sign Up"

2. **You're In!**
   - You'll be redirected to the dashboard
   - You'll see placeholder modules

3. **Connect Whoop (Optional):**
   - Get your API key from https://developer.whoop.com
   - Go to Settings in the dashboard
   - Paste your Whoop API key
   - Data will sync automatically

---

## ✅ Verification Checklist

- [ ] Backend running on http://localhost:5000
- [ ] Frontend running on http://localhost:3000
- [ ] Can access http://localhost:3000 in browser
- [ ] Can create an account
- [ ] Can login
- [ ] Can see dashboard

---

## 🐛 Troubleshooting

### "Cannot connect to MongoDB"
- **Solution 1:** Check if MongoDB is running: `docker ps` or `sudo systemctl status mongod`
- **Solution 2:** Restart MongoDB: `docker restart lifeos-mongo` or `sudo systemctl restart mongod`
- **Solution 3:** Check `.env` file has correct `MONGODB_URI`

### "Port 5000 already in use"
- **Solution:** Find and kill the process: `lsof -ti:5000 | xargs kill -9`
- Or change `PORT` in `backend/.env`

### "Port 3000 already in use"
- **Solution:** Find and kill the process: `lsof -ti:3000 | xargs kill -9`
- Or Vite will prompt you to use port 3001

### "Module not found" errors
- **Solution:** Reinstall dependencies:
  ```bash
  cd backend && rm -rf node_modules && npm install
  cd ../frontend && rm -rf node_modules && npm install
  ```

### Frontend shows blank page
- **Solution 1:** Check browser console (F12) for errors
- **Solution 2:** Ensure backend is running first
- **Solution 3:** Clear browser cache and reload

---

## 🔥 Quick Test (Backend API)

Test if backend is running:
```bash
curl http://localhost:5000/health
```

Expected response:
```json
{
  "status": "healthy",
  "timestamp": "2026-01-22T...",
  "uptime": 123.456
}
```

---

## 📱 Accessing from Another Device

If you want to access from your phone or another computer on the same network:

1. **Find your IP address:**
   ```bash
   # Linux/Mac
   ifconfig | grep "inet " | grep -v 127.0.0.1

   # Or
   hostname -I
   ```

2. **Update backend CORS:**
   Edit `backend/.env`:
   ```env
   CORS_ORIGIN=http://YOUR_IP:3000
   ```

3. **Start frontend with --host:**
   ```bash
   cd frontend
   npm run dev -- --host
   ```

4. **Visit from other device:**
   `http://YOUR_IP:3000`

---

**Need help?** Check the logs:
- Backend: The terminal where `npm run dev` is running (backend)
- Frontend: The terminal where `npm run dev` is running (frontend)
- Browser console: Press F12 → Console tab
