# Content Idea Validator 🚀

An AI-powered full-stack web application to validate content ideas before investing time in creating them.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React.js, Tailwind CSS, Recharts |
| Backend | Node.js, Express.js |
| Database | MongoDB (Mongoose) |
| Auth | JWT Authentication |
| AI | Google Gemini API |
| Data | YouTube Data API v3, Reddit API |

---

## Project Structure

```
project_01/
├── backend/
│   ├── src/
│   │   ├── config/db.js
│   │   ├── controllers/
│   │   │   ├── auth.controller.js
│   │   │   ├── analysis.controller.js
│   │   │   └── dashboard.controller.js
│   │   ├── middleware/auth.middleware.js
│   │   ├── models/
│   │   │   ├── User.model.js
│   │   │   └── IdeaAnalysis.model.js
│   │   ├── routes/
│   │   │   ├── auth.routes.js
│   │   │   ├── analysis.routes.js
│   │   │   └── dashboard.routes.js
│   │   ├── services/
│   │   │   ├── youtube.service.js
│   │   │   ├── reddit.service.js
│   │   │   ├── gemini.service.js
│   │   │   └── scoring.service.js
│   │   └── index.js
│   ├── .env.example
│   └── package.json
│
└── frontend/
    ├── public/index.html
    ├── src/
    │   ├── components/
    │   │   ├── Navbar.js
    │   │   ├── PrivateRoute.js
    │   │   ├── ScoreCard.js
    │   │   ├── ScoreRadarChart.js
    │   │   └── LoadingSpinner.js
    │   ├── context/AuthContext.js
    │   ├── pages/
    │   │   ├── LandingPage.js
    │   │   ├── LoginPage.js
    │   │   ├── SignupPage.js
    │   │   ├── DashboardPage.js
    │   │   ├── AnalyzerPage.js
    │   │   ├── ReportPage.js
    │   │   └── ProfilePage.js
    │   ├── services/api.js
    │   ├── App.js
    │   ├── index.js
    │   └── index.css
    ├── tailwind.config.js
    ├── postcss.config.js
    └── package.json
```

---

## Setup Instructions

### Step 1 — Prerequisites
- Node.js v18+
- MongoDB running locally (or a MongoDB Atlas URI)
- API keys (see below)

### Step 2 — Get Your API Keys

| Key | Where to get it |
|-----|----------------|
| `YOUTUBE_API_KEY` | [Google Cloud Console](https://console.cloud.google.com) → Enable YouTube Data API v3 |
| `REDDIT_CLIENT_ID` + `REDDIT_CLIENT_SECRET` | [reddit.com/prefs/apps](https://www.reddit.com/prefs/apps) → Create app (script type) |
| `GEMINI_API_KEY` | [Google AI Studio](https://makersuite.google.com/app/apikey) |
| `JWT_SECRET` | Any long random string |
| `MONGO_URI` | `mongodb://localhost:27017/content-validator` or Atlas URI |

### Step 3 — Backend Setup

```bash
cd backend
cp .env.example .env
# Edit .env and fill in all API keys
npm install
npm run dev
# Server runs on http://localhost:5000
```

### Step 4 — Frontend Setup

```bash
cd frontend
npm install
npm start
# App runs on http://localhost:3000
```

---

## API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|---------|-------------|
| POST | `/api/auth/signup` | Register new user |
| POST | `/api/auth/login` | Login user |
| GET | `/api/auth/me` | Get current user (protected) |

### Analysis
| Method | Endpoint | Description |
|--------|---------|-------------|
| POST | `/api/analysis/analyze` | Run full analysis (protected) |
| GET | `/api/analysis/:id` | Get single analysis (protected) |

### Dashboard
| Method | Endpoint | Description |
|--------|---------|-------------|
| GET | `/api/dashboard/analyses` | List all analyses (protected) |
| DELETE | `/api/dashboard/analyses/:id` | Delete analysis (protected) |
| GET | `/api/dashboard/stats` | Get dashboard stats (protected) |

---

## Scoring Algorithm

| Score | Formula |
|-------|---------|
| Competition | Based on number of YT videos + avg views + recency |
| Demand | Reddit upvotes + comments + YouTube engagement |
| Originality | Inverse of competition; penalizes topic saturation |
| Viral Potential | `Demand×0.45 + Originality×0.35 + (100-Competition)×0.20` |
| **Overall** | `Demand×0.35 + Originality×0.30 + Viral×0.25 + (100-Comp)×0.10` |

---

## Deployment

### Backend → Render
1. Push to GitHub
2. Create new Web Service on [render.com](https://render.com)
3. Set build command: `npm install`
4. Set start command: `node src/index.js`
5. Add all env variables in Render dashboard

### Frontend → Vercel
1. Push to GitHub
2. Import project on [vercel.com](https://vercel.com)
3. Set `REACT_APP_API_URL` env var to your Render backend URL
4. Deploy

---

## Resume Bullet

> Built a full-stack AI-powered Content Idea Validator using React, Node.js, MongoDB, and Google Gemini API. Integrated YouTube Data API v3 and Reddit OAuth API to compute a weighted 4-metric scoring algorithm (competition, demand, originality, viral potential) with JWT authentication, protected dashboards, and persistent analysis history.
