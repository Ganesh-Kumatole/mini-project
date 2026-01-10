# Fintracker - Financial Management Application

A modern personal finance management application built with React, TypeScript, Vite, and Firebase.

## Features

- 💰 Transaction Management
- 🏦 Account Management
- 📊 Budget Tracking
- 🤖 AI-Powered Expense Categorization
- 📈 Financial Analytics & Insights
- 🌙 Dark Mode Support
- 🔐 Firebase Authentication

## Tech Stack

- **Frontend**: React 18 + TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Backend**: Firebase (Firestore, Authentication)
- **Charts**: Chart.js
- **Routing**: React Router DOM

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Firebase account

### Installation

1. Clone the repository
2. Install dependencies:

   ```bash
   npm install
   ```

3. Set up environment variables:

   - Copy `.env.example` to `.env`
   - Fill in your Firebase configuration

4. Start the development server:

   ```bash
   npm run dev
   ```

5. Build for production:
   ```bash
   npm run build
   ```

## Project Structure

```
src/
├── components/     # React components organized by feature
├── context/        # React Context providers
├── hooks/          # Custom React hooks
├── services/       # Firebase and external services
├── types/          # TypeScript type definitions
├── utils/          # Utility functions
└── styles/         # Global styles
```

## Firebase Setup

1. Create a Firebase project at [Firebase Console](https://console.firebase.google.com/)
2. Enable Authentication (Email/Password)
3. Create Firestore database
4. Copy your Firebase config to `.env`
5. Deploy Firestore rules:
   ```bash
   firebase deploy --only firestore:rules
   ```

## Deployment

Deploy to Firebase Hosting:

```bash
npm run build
firebase deploy
```

## License

MIT
