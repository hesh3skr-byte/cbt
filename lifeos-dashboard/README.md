# 🌟 Life OS Dashboard

A transformative, Apple-inspired productivity and wellness dashboard that provides daily clarity across all life aspects. Built with React, Node.js, MongoDB, and Whoop API integration.

## ✨ Features

### 🏥 **Whoop Health Integration**
- Recovery ring visualization (Apple Watch-style)
- HRV trends and sleep analytics
- 7-day recovery history sparklines
- Smart caching (6-hour TTL) to minimize API calls
- Actionable insights based on recovery scores

### 🎯 **Life Balance Radar**
- 8-dimensional life assessment (Physical, Mental, Financial, Career, Relationships, Learning, Spiritual, Fun)
- Spider chart visualization with Apple aesthetics
- Overall balance score calculation
- Category-by-category breakdown

### ✅ **Task Management (GTD + Eisenhower Matrix)**
- Inbox-based task capture
- Four-quadrant Eisenhower Matrix
- Priority levels and due dates
- Task statistics and completion rates

### 🔥 **Habit Tracking**
- Daily and weekly habit support
- Streak calculation (current and longest)
- Visual heatmap calendar (last 30 days)
- Goal-linkage for identity-based habits

### 🎯 **Goal Setting**
- Identity-linked goals across 8 life categories
- Milestone tracking with weighted progress
- Automatic progress calculation
- Habit integration

### 💰 **Financial Tracking**
- Income, expense, and budget management
- Monthly summaries with category breakdowns
- Budget vs actual visualization
- Recurring transaction support

### 🧠 **Mental Health (CBT Integration)**
- Mood tracking with 5-level scale
- Thought record templates (situation → thoughts → distortions → reframe)
- Gratitude logging
- 30-day mood trend analysis
- Life balance ratings feed into radar chart

## 🏗️ Architecture

```
lifeos-dashboard/
├── backend/                 # Node.js + Express + TypeScript
│   ├── src/
│   │   ├── models/         # Mongoose schemas
│   │   ├── routes/         # API endpoints
│   │   ├── services/       # Business logic (Whoop, etc.)
│   │   ├── middleware/     # Auth, rate limiting, validation
│   │   ├── utils/          # JWT, encryption, database
│   │   └── server.ts       # Express app entry point
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/               # React + TypeScript + Tailwind
│   ├── src/
│   │   ├── components/
│   │   │   ├── Auth/      # Login, Register, Protected Routes
│   │   │   ├── Dashboard/ # Main layout
│   │   │   ├── Modules/   # Whoop, LifeBalance, Tasks, Habits, etc.
│   │   │   ├── Charts/    # ProgressRing, Sparkline, RadarChart
│   │   │   └── Shared/    # Card, Button, Input
│   │   ├── contexts/      # AuthContext for global state
│   │   ├── hooks/         # Custom React hooks
│   │   ├── utils/         # API client, helpers
│   │   └── types/         # TypeScript interfaces
│   ├── package.json
│   ├── tailwind.config.js # Apple design tokens
│   └── vite.config.ts
│
└── README.md
```

## 🚀 Getting Started

### Prerequisites

- **Node.js** v18+ and npm
- **MongoDB** (local or cloud instance)
- **Whoop API Key** (optional, for health data)

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd lifeos-dashboard
```

### 2. Backend Setup

```bash
cd backend
npm install

# Create .env file
cp .env.example .env

# Edit .env with your configuration:
# - MONGODB_URI=mongodb://localhost:27017/lifeos-dashboard
# - JWT_SECRET=your-secret-key
# - ENCRYPTION_KEY=your-32-character-key

# Start development server
npm run dev
```

Backend will run on `http://localhost:5000`

### 3. Frontend Setup

```bash
cd ../frontend
npm install

# Create .env file (if needed)
echo "VITE_API_URL=http://localhost:5000/api" > .env.local

# Start development server
npm run dev
```

Frontend will run on `http://localhost:3000`

### 4. Database Setup

MongoDB will automatically create collections on first use. No manual schema setup required.

### 5. First Login

1. Navigate to `http://localhost:3000`
2. Click "Sign up" to create an account
3. Fill in your name, email, and password (min 8 chars)
4. You'll be redirected to the dashboard

## 🔧 Configuration

### Environment Variables

#### Backend (.env)
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/lifeos-dashboard
JWT_SECRET=your-super-secret-jwt-key
JWT_REFRESH_SECRET=your-refresh-secret-key
JWT_EXPIRE=7d
JWT_REFRESH_EXPIRE=30d
ENCRYPTION_KEY=your-32-character-encryption-key
CORS_ORIGIN=http://localhost:3000
```

#### Frontend (.env.local)
```env
VITE_API_URL=http://localhost:5000/api
```

### Whoop Integration

1. Get your Whoop API key from [developer.whoop.com](https://developer.whoop.com)
2. In the dashboard, go to Settings
3. Paste your API key and save
4. Data will sync automatically every 6 hours

## 📊 API Endpoints

### Authentication
- `POST /api/auth/register` - Create account
- `POST /api/auth/login` - Login
- `POST /api/auth/refresh` - Refresh access token
- `GET /api/auth/me` - Get current user
- `PATCH /api/auth/settings` - Update settings

### Whoop
- `POST /api/whoop/connect` - Store API key
- `GET /api/whoop/sync` - Fetch latest data
- `GET /api/whoop/summary` - Get weekly trends
- `GET /api/whoop/recovery/:date` - Get specific day
- `DELETE /api/whoop/disconnect` - Remove integration

### Goals
- `GET /api/goals` - List all goals
- `POST /api/goals` - Create goal
- `PATCH /api/goals/:id` - Update goal
- `DELETE /api/goals/:id` - Delete goal
- `POST /api/goals/:id/milestone/:index` - Mark milestone complete
- `GET /api/goals/analytics/progress` - Get progress data

### Habits
- `GET /api/habits` - List all habits
- `POST /api/habits` - Create habit
- `POST /api/habits/:id/complete` - Mark habit complete
- `GET /api/habits/analytics/streaks` - Get all streaks

### Tasks
- `GET /api/tasks` - List tasks
- `POST /api/tasks` - Create task
- `PATCH /api/tasks/:id` - Update task
- `GET /api/tasks/matrix/view` - Get Eisenhower matrix
- `GET /api/tasks/analytics/stats` - Get statistics

### Financials
- `GET /api/finances` - List transactions
- `POST /api/finances` - Create transaction
- `GET /api/finances/summary/monthly` - Monthly summary

### Health
- `GET /api/health` - List health records
- `POST /api/health` - Log workout/nutrition
- `GET /api/health/summary/weekly` - Weekly summary

### Mood
- `GET /api/mood` - List mood entries
- `POST /api/mood` - Create mood entry
- `GET /api/mood/trends/monthly` - 30-day trends
- `GET /api/mood/life-balance/latest` - Latest life balance

## 🎨 Design Philosophy

### Apple-Inspired Aesthetics

- **Minimalism**: Max 4-6 modules visible, ample whitespace
- **Typography**: SF Pro Display font family
- **Color Palette**: Neutral grays with blue/green/purple accents
- **Animations**: Subtle fade-ins, spring effects (no aggressive bouncing)
- **Shadows**: Soft, layered shadows for depth
- **Rings**: Apple Watch-style progress rings for recovery/budgets
- **Charts**: Clean, minimal Chart.js styling

### Tailwind Design Tokens

```javascript
colors: {
  canvas: '#FAFAFA',      // Background
  surface: '#FFFFFF',     // Cards
  border: '#E5E5E5',      // Dividers
  text-primary: '#1D1D1F',
  text-secondary: '#6E6E73',
  accent-blue: '#007AFF',  // iOS blue
  accent-green: '#34C759', // Success
  accent-purple: '#AF52DE' // Goals
}
```

## 🔐 Security Features

- **JWT Authentication** with refresh tokens (7-day access, 30-day refresh)
- **Password Hashing** with bcrypt (10 salt rounds)
- **API Key Encryption** for Whoop keys (AES-256-CBC)
- **Rate Limiting**:
  - Auth endpoints: 5 req/min
  - Whoop sync: 10 req/hour
  - General API: 100 req/min
- **Input Validation** with express-validator
- **CORS** protection
- **Helmet.js** security headers

## 📱 Responsive Design

- **Mobile**: Stacked modules, touch-friendly buttons
- **Tablet**: 2-column grid
- **Desktop**: 3-column grid with max-width container

## 🧪 Testing (Future Enhancement)

```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test
```

## 🚢 Production Deployment

### Backend

```bash
cd backend
npm run build
npm start
```

### Frontend

```bash
cd frontend
npm run build
# Serve the dist/ folder with your preferred hosting (Vercel, Netlify, etc.)
```

### Environment Variables

Set production values for:
- `MONGODB_URI` (MongoDB Atlas recommended)
- `JWT_SECRET` (strong random string)
- `ENCRYPTION_KEY` (32-character random string)
- `CORS_ORIGIN` (your frontend domain)

## 📈 Roadmap

- [ ] Pomodoro timer module
- [ ] Financial pie charts for expenses
- [ ] Habit heatmap improvements
- [ ] Dark mode support
- [ ] Mobile app (React Native)
- [ ] Calendar view for tasks
- [ ] AI-powered insights (GPT integration)
- [ ] Social features (accountability partners)
- [ ] Export data to PDF/CSV

## 🤝 Contributing

This is a personal productivity tool, but contributions are welcome:

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push and create a Pull Request

## 📄 License

MIT License - feel free to use for personal or commercial projects.

## 🙏 Acknowledgments

- **LifeOS Dashboard** for inspiration
- **Apple** for design excellence
- **Whoop** for health data API
- **CBT principles** for mental health features

---

**Built with care for transformative daily clarity. Every element serves a purpose.** 💚
