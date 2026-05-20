# 🍎 Bite - Smart Calorie & Nutrition Tracker

A full-stack calorie tracking app built with **Node.js + Express** (backend) and **React** (frontend).

## Features
- 🔍 **Search food** from a built-in database + Open Food Facts API
- 📷 **Barcode scanning** - type barcode to get exact nutrition data
- ✏️ **Manual entry** for homemade meals
- 📊 **Dashboard** with calorie & macro tracking rings
- 📅 **7-day history** with bar charts
- 🗑️ Delete logged meals

---

## Tech Stack
| Layer | Technology |
|---|---|
| Frontend | React 18, React Router, Recharts |
| Backend | Node.js, Express |
| API | Open Food Facts (free, no key needed) |
| Storage | JSON file (no database required) |

---

## Project Setup

### 1. Install dependencies

```bash
# Root
npm install

# Server
cd server && npm install

# Client  
cd ../client && npm install
```

### 2. Configure environment

```bash
cd server
cp .env.example .env
# No API key needed - Open Food Facts is free!
```

### 3. Run the project

**Option A - Run both together (from root):**
```bash
npm run dev
```

**Option B - Run separately:**
```bash
# Terminal 1 (Backend)
cd server && npm run dev
# Server runs at http://localhost:5000

# Terminal 2 (Frontend)
cd client && npm start
# App opens at http://localhost:3000
```

---

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/health` | Health check |
| GET | `/api/nutrition/search?q=chicken` | Search foods |
| GET | `/api/barcode/:code` | Lookup product by barcode |
| GET | `/api/meals?date=2025-01-01` | Get logged meals |
| POST | `/api/meals` | Log a new meal |
| DELETE | `/api/meals/:id` | Delete a meal |
| GET | `/api/meals/summary/week` | Weekly summary |

---

## 📌 GitHub - 5 Commits Guide

Sir ne bola hai minimum 5 commits. Yahan step-by-step guide hai:

### Step 1: Initialize repo
```bash
git init
git add README.md .gitignore
git commit -m "feat: initial project setup and README"
```

### Step 2: Add backend (Node.js server)
```bash
git add server/
git commit -m "feat: add Express backend with nutrition and barcode routes"
```

### Step 3: Add React frontend structure
```bash
git add client/src/index.js client/src/App.js client/src/App.css client/public/
git commit -m "feat: add React app structure with routing and global styles"
```

### Step 4: Add pages and components
```bash
git add client/src/pages/ client/src/components/ client/src/context/
git commit -m "feat: add Dashboard, LogMeal, History pages with MealContext"
```

### Step 5: Final polish and complete project
```bash
git add .
git commit -m "feat: complete Bite app with barcode lookup, charts, and meal logging"
```

### Push to GitHub
```bash
git remote add origin https://github.com/YOUR_USERNAME/bite-calorie-tracker.git
git branch -M main
git push -u origin main
```

---

## .gitignore

```
node_modules/
.env
server/data/meals.json
build/
.DS_Store
```

---

## Project Structure

```
bite-app/
├── client/                 # React Frontend
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.js
│   │   │   ├── MealCard.js
│   │   │   └── NutritionRing.js
│   │   ├── context/
│   │   │   └── MealContext.js
│   │   ├── pages/
│   │   │   ├── Dashboard.js
│   │   │   ├── LogMeal.js
│   │   │   └── History.js
│   │   ├── App.js
│   │   └── index.js
│   └── package.json
│
├── server/                 # Node.js Backend
│   ├── routes/
│   │   ├── nutrition.js   # Food search API
│   │   ├── barcode.js     # Barcode lookup
│   │   └── meals.js       # Meal logging CRUD
│   ├── data/
│   │   └── meals.json     # Auto-created on first run
│   ├── index.js           # Express server entry
│   ├── .env.example
│   └── package.json
│
├── package.json            # Root scripts
└── README.md
```
