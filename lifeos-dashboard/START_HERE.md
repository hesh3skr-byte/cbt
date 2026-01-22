# ⚡ START HERE - Simplest Way to Run Life OS Dashboard

## 🎯 3-Step Quick Start

### STEP 1: Install & Start MongoDB (Choose ONE option)

#### Option A: Docker (Easiest - 30 seconds)
```bash
# Install Docker (if not installed)
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Start MongoDB
docker run -d -p 27017:27017 --name lifeos-mongo mongo:latest
```

#### Option B: Use Free Cloud MongoDB (No installation)
1. Go to https://mongodb.com/cloud/atlas/register
2. Sign up (free)
3. Create a free cluster (M0)
4. Get connection string
5. Update `/home/user/cbt/lifeos-dashboard/backend/.env`:
   ```
   MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/lifeos-dashboard
   ```

---

### STEP 2: Start Backend Server

Open a terminal and run:
```bash
cd /home/user/cbt/lifeos-dashboard/backend
npm run dev
```

**Keep this terminal open!** You should see:
```
✅ MongoDB connected successfully
🚀 Server running on port 5000
```

---

### STEP 3: Start Frontend (New Terminal)

Open a **NEW** terminal and run:
```bash
cd /home/user/cbt/lifeos-dashboard/frontend
npm run dev
```

**Keep this terminal open too!** You should see:
```
➜  Local:   http://localhost:3000/
```

---

### 🌐 OPEN YOUR BROWSER

Visit: **http://localhost:3000**

---

## 🎉 That's It!

You should now see the Life OS Dashboard login page.

**First time:**
1. Click "Sign up"
2. Create an account
3. Start using your dashboard!

---

## ❌ If Something Goes Wrong

### MongoDB connection error?
```bash
# Check if MongoDB is running
docker ps | grep mongo
# OR
sudo systemctl status mongod
```

### Port already in use?
```bash
# Kill processes on port 5000 or 3000
sudo lsof -ti:5000 | xargs kill -9
sudo lsof -ti:3000 | xargs kill -9
```

### Still stuck?
Read the detailed guide: `/home/user/cbt/lifeos-dashboard/QUICKSTART.md`
