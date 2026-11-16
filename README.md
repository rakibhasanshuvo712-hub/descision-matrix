# DECISION MATRIX – AI-Powered Decision Intelligence System

**DECISION MATRIX** is an enterprise-grade, responsive, full-stack decision intelligence platform. It moves beyond superficial "pros and cons" checklists by evaluating complex, competing options through **14 ethical, logical, outcome, and resilience dimensions**.

---

## 🌟 Key Features

1. **14 Multi-Dimensional Evaluation Engine**:
   - **Ethics & Principles**: Moral Correctness, Ethical Responsibility, Human Welfare, Fairness & Equality
   - **Reasoning & Facts**: Logical Consistency, Evidence & Factual Support
   - **Outcomes & Impact**: Long-Term Benefits, Short-Term Benefits, Sustainability, Personal Goal Alignment
   - **Risk & Resilience**: Risk and Potential Harm (Safety Buffer)
   - **Resources & Practicality**: Financial Feasibility, Practical Feasibility
   - **Community & Society**: Social Impact

2. **Intelligent Weighted Ranking System**:
   - Mathematical formula:
     $$\text{Final Score} = \frac{\sum_{i=1}^{14} (\text{Criterion Score}_i \times \text{Weight}_i)}{\sum_{i=1}^{14} \text{Weight}_i}$$
   - Algorithmic tie-breaker cascading through Safety Buffer $\to$ Moral Correctness $\to$ Empirical Evidence.
   - Distinct separation of evidence confidence and evidence quality from final numerical scores.

3. **Zero-Bias Cognitive Architecture**:
   - Evaluates all options independently across identical criteria to avoid position bias (first/last bias).
   - Generates strengths, weaknesses, advantages, disadvantages, ethical dilemmas, hidden risks, short- and long-term consequences, best- and worst-case scenarios, underlying assumptions, and counterarguments.

4. **Transparent Explainability & Ethical Conflict Surfacing**:
   - Surfaces value conflicts explicitly rather than smoothing them into a single number.
   - Highlights missing information that could change the ranking.
   - Standard professional disclaimers for health, legal, and financial decisions.

5. **Modern Dashboard & Analytics**:
   - Real-time Recharts visualizations (Multidimensional Radar Chart & Benchmark Bar Charts).
   - Real-time weight slider tuning: immediately recalculates rankings and scores on the fly!
   - 1-Click PDF Report Export for executive review and physical archival.
   - Instant 1-Click Demo mode and Guest Mode (zero barriers to testing).

---

## 🛠️ Technology Stack

- **Frontend**:
  - React 18 / Vite
  - React Router DOM v7
  - Tailwind CSS + DaisyUI (Dark & Light theme system)
  - Recharts (Radar, Bar, and Line visualizations)
  - React Icons
  - Axios API client
  - jsPDF & Print-optimized CSS engine

- **Backend**:
  - Node.js & Express.js (MVC Pattern)
  - MongoDB & Mongoose ORM
  - JWT Authentication & bcryptjs Password Hashing
  - Dual-mode persistence: Seamless MongoDB Atlas connectivity with auto-initializing in-memory fallback store
  - Pluggable AI Service: Supports Google Gemini, OpenAI, or the built-in standalone cognitive engine
  - CORS, Dotenv, and Centralized Error Handling

- **Deployment**:
  - Railway production ready (`railway.json`, `Procfile`, Nixpacks)
  - Health check endpoint at `/api/health`
  - Automated static build serving from single container

---

## 📁 Project Architecture

```
decision-matrix/
├── package.json               # Root scripts (build:all, start, dev)
├── Procfile                   # Process file for cloud hosting
├── railway.json               # Railway Nixpacks deployment config
├── README.md                  # Complete documentation
│
├── backend/                   # Express.js REST API
│   ├── config/
│   │   └── db.js              # Resilient MongoDB connector & fallback
│   ├── controllers/
│   │   ├── authController.js  # JWT Auth, Register, Login, Guest sessions
│   │   ├── decisionController.js # Decision evaluation, scoring, CRUD
│   │   └── userController.js  # User profile and default weights
│   ├── middleware/
│   │   ├── authMiddleware.js  # JWT validation & optional guest auth
│   │   └── errorHandler.js    # Centralized HTTP error handling
│   ├── models/
│   │   ├── Decision.js        # Decision schema with 14 criteria & analysis
│   │   └── User.js            # User credentials, roles, and preferences
│   ├── routes/
│   │   ├── authRoutes.js      # /api/auth/*
│   │   ├── decisionRoutes.js  # /api/decisions/*
│   │   └── userRoutes.js      # /api/users/*
│   ├── services/
│   │   ├── aiService.js       # LLM provider adapter (Gemini / OpenAI)
│   │   ├── scoringService.js  # Weighted utility & comparative synthesis
│   │   └── seedService.js     # Demonstrative decision seeder
│   ├── utils/
│   │   └── criteriaList.js    # 14 Multi-dimensional criteria definitions
│   ├── .env.example           # Environment template
│   └── server.js              # Server entry point & static SPA server
│
└── frontend/                  # React + Tailwind + DaisyUI
    ├── public/
    ├── src/
    │   ├── components/
    │   │   ├── common/ScoreBadge.jsx
    │   │   └── layout/        # Navbar, Sidebar, MainLayout
    │   ├── context/
    │   │   ├── AuthContext.jsx  # Auth & guest management
    │   │   └── ThemeContext.jsx # Dark/Light theme toggler
    │   ├── pages/
    │   │   ├── LandingPage.jsx         # Landing page with interactive demo
    │   │   ├── LoginPage.jsx           # Sign in + 1-Click demo access
    │   │   ├── RegisterPage.jsx        # Account registration
    │   │   ├── DashboardPage.jsx       # Recharts dashboard & metrics
    │   │   ├── CreateDecisionPage.jsx  # Multi-step decision input & weight tuner
    │   │   ├── EvaluationResultsPage.jsx # 14-dimension breakdown & PDF export
    │   │   ├── DecisionHistoryPage.jsx # Filterable decision archive
    │   │   ├── UserProfilePage.jsx     # Profile & baseline weights
    │   │   └── SettingsPage.jsx        # System diagnostics & data backup
    │   ├── services/api.js             # Axios client with JWT interceptor
    │   ├── App.jsx                     # Route definitions
    │   ├── index.css                   # Tailwind base & glassmorphism
    │   └── main.jsx                    # Root render
    ├── tailwind.config.js
    └── vite.config.js
```

---

## 🚀 Local Installation & Setup

### Prerequisites
- Node.js (v18 or newer)
- npm (v9 or newer)
- Optional: MongoDB instance (or rely on the auto-active in-memory fallback)

### Step 1: Clone and Install
```bash
# Clone the repository
git clone <your-repo-url>
cd decision-matrix

# Install all dependencies (root, backend, frontend)
npm run build:all
```

### Step 2: Configure Environment Variables
Create `backend/.env` based on `backend/.env.example`:
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://127.0.0.1:27017/decision_matrix
JWT_SECRET=your_super_secret_jwt_key_here

# AI Engine Configuration
AI_PROVIDER=gemini
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-1.5-flash
```

*(Note: If no API key is specified, the system will seamlessly run its internal deterministic multi-criteria cognitive engine without failing.)*

### Step 3: Run the Application
You can run both backend and frontend together:
```bash
# Option A: Start single production container (serves frontend build via backend)
npm start

# Option B: Run development servers
# Terminal 1: Backend
cd backend && npm run dev

# Terminal 2: Frontend
cd frontend && npm run dev
```

Visit **`http://localhost:5000`** (production bundle) or **`http://localhost:5173`** (Vite dev server).

---

## ⚡ 1-Click Quick Demo Access

You can immediately explore the full system without creating an account:
1. Open the login page.
2. Click **"One-Click Demo Login"** (auto-fills `demo@decisionmatrix.ai` / `demo1234`).
3. Or click **"Continue as Guest"** for instant guest mode.

---

## 🚂 Railway Deployment Guide

This repository is optimized for deployment on [Railway](https://railway.com).

### Step-by-Step Railway Deployment:

1. **Push your code to GitHub**:
   ```bash
   git init
   git add .
   git commit -m "Initial commit: DECISION MATRIX"
   git branch -M main
   git remote add origin https://github.com/<your-username>/decision-matrix.git
   git push -u origin main
   ```

2. **Create New Project in Railway**:
   - Go to [Railway Dashboard](https://railway.com/dashboard).
   - Click **"New Project"** $\to$ **"Deploy from GitHub repo"**.
   - Select your `decision-matrix` repository.

3. **Provision MongoDB (Optional)**:
   - Click **"+ New"** in your Railway project canvas $\to$ **"Database"** $\to$ **"Add MongoDB"**.
   - Under your app service, link `MONGODB_URI` to `${{MongoDB.MONGO_URL}}`.
   - *Alternatively, you can provide an external MongoDB Atlas connection URI.*

4. **Configure Environment Variables in Railway**:
   Navigate to your service's **"Variables"** tab and add:
   - `NODE_ENV` = `production`
   - `JWT_SECRET` = `<generate-a-strong-random-secret>`
   - `MONGODB_URI` = `<your-mongodb-atlas-uri-or-railway-mongo-url>`
   - `AI_PROVIDER` = `gemini`
   - `GEMINI_API_KEY` = `<your-google-ai-studio-gemini-key>`

5. **Deploy**:
   - Railway will detect `railway.json`, run `npm run build:all`, and execute `node backend/server.js`.
   - Healthcheck will automatically verify `/api/health`.
   - Generate a domain under **Settings $\to$ Networking $\to$ Generate Domain**.

---

## 📡 REST API Reference

| Method | Endpoint | Description | Access |
|---|---|---|---|
| `GET` | `/api/health` | Health check & AI provider diagnostics | Public |
| `POST` | `/api/auth/register` | Register new user account | Public |
| `POST` | `/api/auth/login` | Authenticate user & get JWT token | Public |
| `POST` | `/api/auth/guest` | Initialize temporary guest session | Public |
| `GET` | `/api/auth/me` | Fetch active user credentials | Private (JWT) |
| `GET` | `/api/decisions/criteria` | Retrieve 14 criteria definitions & default weights | Public |
| `GET` | `/api/decisions/dashboard/stats`| Aggregate dashboard metrics & top options | Public / Guest |
| `GET` | `/api/decisions` | List decision records (supports `?search=`) | Public / Guest |
| `POST` | `/api/decisions` | Create decision & execute evaluation | Public / Guest |
| `GET` | `/api/decisions/:id` | Get full decision analysis & radar scores | Public / Guest |
| `PUT` | `/api/decisions/:id/evaluate` | Re-evaluate decision with adjusted weights | Public / Guest |
| `DELETE`| `/api/decisions/:id` | Delete decision record | Public / Guest |
| `GET` | `/api/users/profile` | Retrieve user preferences | Private (JWT) |
| `PUT` | `/api/users/profile` | Update profile & default criteria weights | Private (JWT) |

---

## ⚖️ Ethical & Decision Transparency Disclaimer

DECISION MATRIX is an analytical decision-support system. It is designed to expose cognitive blind spots, clarify competing priorities, and structure trade-offs. It does **not** provide binding legal, fiduciary, safety-critical, or medical advice. Users facing critical regulatory, financial, or healthcare decisions should consult accredited, certified professionals.

---

## 📜 License

MIT License © 2026 DECISION MATRIX Intelligence Systems.
