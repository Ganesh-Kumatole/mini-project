<div align="center">

# 💰 FinTracker

### A Personal Finance Management Application

[![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.2-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Firebase](https://img.shields.io/badge/Firebase-10-FFCA28?style=for-the-badge&logo=firebase&logoColor=black)](https://firebase.google.com/)
[![Vite](https://img.shields.io/badge/Vite-5-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-3-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)

**Track. Analyze. Grow.**

</div>

---

## 🧱 Tech Stack

| Layer                  | Technology                                     |
| ---------------------- | ---------------------------------------------- |
| **Frontend Framework** | React 18 + TypeScript 5.2                      |
| **Build Tool**         | Vite 5                                         |
| **Styling**            | Tailwind CSS 3                                 |
| **Routing**            | React Router DOM v6                            |
| **Backend / Database** | Firebase 10 (Firestore)                        |
| **Authentication**     | Firebase Auth (Email + Google OAuth)           |
| **Charts**             | Chart.js 4 + react-chartjs-2                   |
| **AI / ML**            | HuggingFace Inference API (Whisper + Qwen 2.5) |
| **PDF Export**         | jsPDF + html2canvas                            |
| **News**               | NewsAPI                                        |
| **Currency Rates**     | Open Exchange Rates API                        |

---

## Features:

### 📊 Dashboard

- Live **Net Balance**, **Monthly Income**, and **Monthly Expense** stat cards computed directly from Firestore in real-time
- Interactive **Line Chart** (6-month income vs. expense trends)
- **Donut Chart** — expense breakdown by category for the last 30 days
- **Budget vs Actual Bar Chart** — visual budget utilization
- Quick **Add Transaction** shortcut right from the dashboard

### 💳 Transaction Management

- Add, edit, and delete transactions with a polished modal UI
- **Dual-category system** — separate curated category lists for Income (Salary, Freelance, Business, Dividends, etc.) and Expense (Food & Dining, Housing, Subscriptions, Fitness, etc.)
- **Voice-powered entry** — speak your transaction naturally, AI fills the form automatically
- **Recurring transaction** toggle
- Dynamic currency symbol in all amount fields (respects your active currency setting)
- Filter & search across all transaction history

### 🎤 AI Voice Input

- Records audio via the browser's MediaRecorder API
- Transcribes speech using **OpenAI Whisper** (via HuggingFace Inference API)
- Extracts structured transaction data (amount, category, type, description) using **Qwen 2.5 LLM**
- Auto-fills the transaction form — just speak and confirm

### 🧠 AI Insights

- **Personalized AI Financial Summary** generated from your actual transaction history
- **Predictive month-end spend forecast** based on daily averages
- **Month-over-Month change** analysis
- **Weekday vs Weekend spending** breakdown
- **Top expense category** deep-dive
- **Budget Health** monitor with per-category progress indicators
- **Savings Goal Tracker** — set a monthly target and watch progress with a dynamic color-coded progress bar
- **AI Tip Cards** — tailored financial recommendations (not generic advice)
- **AI Chatbot** — ask follow-up financial questions powered by Qwen-2.5-7B
- Export full analysis as a **PDF report**

### 🏦 Budget Management

- Create budgets per expense category with configurable periods (monthly, weekly, etc.)
- Set **notification thresholds** (e.g., alert at 75% spending)
- Real-time **spent vs. limit** progress bars with color-coded status (safe / warning / over-budget)
- Edit or delete budgets with an inline modal

### 📰 Financial News Feed

- Live financial news via **NewsAPI**
- **Category tabs** — General, Markets, Crypto, Economy, and more
- **Client-side search** with `/` keyboard shortcut
- **Country & content-type filters** with active filter pills
- **Bookmark** articles (persisted to localStorage)
- **Auto-refresh** every 30 minutes with countdown timer
- Skeleton loading states and polished error UI

### ⚙️ Settings

- **Profile Management** — display name & profile picture upload (Firebase Storage)
- **Multi-Currency support** — live USD → INR (and others) exchange rate conversion affecting all data points instantly
- **Theme toggle** — Dark / Light mode with system preference detection
- **Notification preferences** — in-app and budget alert toggles
- **Security** — password change and account management
- **Danger Zone** — data reset option

### 🔐 Authentication

- Firebase Auth — Email/Password and **Google OAuth**
- Two-column polished login/signup pages with branding panel
- Field-level validation with blur triggers and live password strength meter (sign-up)
- **Return-URL session persistence** — users return to their intended page after login
- Protected Routes with automatic redirect

---

## 🏗️ Architecture

```
fintracker/
├── src/
│   ├── components/
│   │   ├── auth/          # LandingPage, LoginPage, SignupPage
│   │   ├── budgets/       # Budgets + EditBudgetModal
│   │   ├── common/        # ErrorBoundary, Toast, ProtectedRoute
│   │   ├── dashboard/     # Dashboard, Charts, StatCards, NewsCard
│   │   ├── insights/      # Insights, AI Chat, SavingsGoalSection
│   │   ├── layout/        # Header, Sidebar, ProtectedRoute
│   │   ├── news/          # NewsPage
│   │   ├── settings/      # Settings
│   │   └── transactions/  # Transactions, AddModal, EditModal
│   ├── constants/
│   │   └── categories.ts  # Centralized income/expense category lists
│   ├── context/
│   │   ├── AuthContext     # Firebase user state
│   │   ├── CurrencyContext # Active currency + live exchange rate
│   │   ├── ThemeContext    # Dark/Light mode
│   │   └── ToastContext    # App-wide toast notifications
│   ├── hooks/
│   │   ├── useTransactions # Firestore real-time subscription
│   │   ├── useBudgets      # Budget CRUD + real-time listener
│   │   ├── useDashboard    # Aggregated monthly totals
│   │   ├── useInsights     # Complex computed financial metrics
│   │   └── useNotifications
│   ├── services/
│   │   ├── firebase/       # Firestore CRUD wrappers
│   │   ├── ai/             # HuggingFace Whisper + Qwen integration
│   │   └── news/           # NewsAPI integration
│   ├── types/              # TypeScript interfaces & type definitions
│   └── utils/              # formatters, helpers
├── images/                 # App screenshots
├── firestore.rules         # Firestore security rules
└── firebase.json           # Firebase hosting config
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18+ and npm
- **Firebase** account (free tier is sufficient)
- **HuggingFace** account + API token (for AI features)

### Installation

**1. Clone the repository**

```bash
git clone https://github.com/Ganesh-Kumatole/mini-project.git
cd mini-project
```

**2. Install dependencies**

```bash
npm install
```

**3. Configure environment variables**

Create a `.env` file in the root directory:

```env
# Firebase
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id

# HuggingFace (AI features)
VITE_HUGGINGFACE_API_KEY=hf_your_token_here
```

**4. Start the development server**

```bash
npm run dev
```

The app will be live at `http://localhost:3000`.

---

## 🔥 Firebase Setup

**1. Create a Firebase project**

- Go to [Firebase Console](https://console.firebase.google.com/)
- Create a new project and register a Web App

**2. Enable required services**

- **Authentication** → Enable Email/Password and Google providers
- **Firestore Database** → Create in production mode
- **Storage** → Create a default bucket (for profile picture uploads)

**3. Deploy Firestore security rules**

```bash
firebase deploy --only firestore:rules
```

**4. (Optional) Deploy to Firebase Hosting**

```bash
npm run build
firebase deploy
```

---

## 🎯 Usage Guide

| Step | Action                                                            |
| ---- | ----------------------------------------------------------------- |
| 1    | Register or log in with Email or Google                           |
| 2    | Add your income and expense transactions                          |
| 3    | Set up budgets for your expense categories                        |
| 4    | Explore the **Dashboard** for a live financial overview           |
| 5    | Visit **AI Insights** for personalized analysis & recommendations |
| 6    | Set a **Savings Goal** and track your progress                    |
| 7    | Browse the **News Feed** to stay on top of financial markets      |
| 8    | Switch currencies or themes from **Settings**                     |

---

## 🎥 App Demonstration

Watch the complete 2-minute demonstration of the working application here:
👉 **[Fintracker App Demo Video](./src/assets/videos/fintracker-demo.mp4)**

---

## 👥 Team Information

This repository serves as a unified codebase for two distinct academic course projects. Below are the team members associated with each respective course submission.

### Cloud Computing & AI Services Course Team

| Name                 | Roll Number |
| :------------------- | :---------- |
| **Inturi Mokshagna** | 23BCS056    |
| **Rakesh Gadupudi**  | 23BCS049    |
| **Ganesh Kumatole**  | 23BCS050    |

---

### Mini-Project Course Team

| Name                | Roll Number |
| :------------------ | :---------- |
| **Vinay Molkeri**   | 23BCS132    |
| **Ganesh Kumatole** | 23BCS050    |
| **Koushik C**       | 23BCS073    |
| **Rakesh Gadupudi** | 23BCS049    |

---

<div align="center">

Made with ❤️ by Team FinTracker · Built for an era of smarter personal finance.

</div>
