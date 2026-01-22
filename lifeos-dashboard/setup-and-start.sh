#!/bin/bash

set -e

echo "╔════════════════════════════════════════════════╗"
echo "║   Life OS Dashboard - Automated Setup         ║"
echo "╚════════════════════════════════════════════════╝"
echo ""

# Color codes
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if running with sudo
if [ "$EUID" -ne 0 ]; then
    echo -e "${YELLOW}⚠️  This script needs sudo privileges to install MongoDB${NC}"
    echo "Please run: sudo ./setup-and-start.sh"
    echo ""
    echo "Or follow manual instructions in START_HERE.md"
    exit 1
fi

# Function to check if MongoDB is installed
check_mongodb() {
    if command -v mongod &> /dev/null; then
        return 0
    else
        return 1
    fi
}

# Function to check if Docker is installed
check_docker() {
    if command -v docker &> /dev/null; then
        return 0
    else
        return 1
    fi
}

echo "🔍 Checking MongoDB installation..."
if check_mongodb; then
    echo -e "${GREEN}✅ MongoDB is already installed${NC}"
elif check_docker; then
    echo -e "${YELLOW}📦 MongoDB not found, but Docker is available${NC}"
    echo "   Starting MongoDB in Docker..."
    docker run -d -p 27017:27017 --name lifeos-mongo mongo:latest || {
        echo -e "${YELLOW}   MongoDB container already exists, starting it...${NC}"
        docker start lifeos-mongo
    }
    echo -e "${GREEN}✅ MongoDB started in Docker${NC}"
else
    echo -e "${YELLOW}📦 Installing MongoDB...${NC}"

    # Install MongoDB on Ubuntu
    wget -qO - https://www.mongodb.org/static/pgp/server-7.0.asc | apt-key add -
    echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu $(lsb_release -cs)/mongodb-org/7.0 multiverse" | tee /etc/apt/sources.list.d/mongodb-org-7.0.list
    apt-get update
    apt-get install -y mongodb-org

    # Start MongoDB
    systemctl start mongod
    systemctl enable mongod

    echo -e "${GREEN}✅ MongoDB installed and started${NC}"
fi

echo ""
echo "📦 Installing Node.js dependencies..."
cd backend
npm install --silent
cd ../frontend
npm install --silent
cd ..

echo -e "${GREEN}✅ Dependencies installed${NC}"
echo ""
echo "════════════════════════════════════════════════"
echo ""
echo -e "${GREEN}🎉 Setup Complete!${NC}"
echo ""
echo "To start the application, run these commands in TWO separate terminals:"
echo ""
echo -e "${YELLOW}Terminal 1 (Backend):${NC}"
echo "  cd /home/user/cbt/lifeos-dashboard/backend"
echo "  npm run dev"
echo ""
echo -e "${YELLOW}Terminal 2 (Frontend):${NC}"
echo "  cd /home/user/cbt/lifeos-dashboard/frontend"
echo "  npm run dev"
echo ""
echo -e "${GREEN}Then open your browser to:${NC} http://localhost:3000"
echo ""
echo "════════════════════════════════════════════════"
