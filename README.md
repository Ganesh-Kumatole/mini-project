Fintracker – Financial Management Application
--------------------------------------------

A modern personal finance management application designed to help users efficiently track income, expenses, and overall financial health. Built using React, TypeScript, Vite, and Firebase, Fintracker provides a clean, fast, and secure experience for personal finance management.

Project Description
-------------------

Managing personal finances manually can be inefficient and error-prone. Fintracker solves this problem by providing a digital platform where users can record transactions, analyze spending patterns, and gain insights into their financial behavior. The application focuses on simplicity, real-time updates, and scalability.

Objectives
----------

• To track income and expense transactions efficiently  
• To provide clear insights into financial activities  
• To offer a secure and user-friendly interface  
• To enable future scalability with analytics and AI-based features  

Features
--------

💰 Transaction Management  
🏦 Account Management  
📊 Budget Tracking (Fully Functional)  
🔔 In-app Notifications for budget limits and overspending  
🎤 Voice-based Transaction Entry using AI  
🤖 AI-Powered Expense Categorization  
📈 Financial Analytics & Insights  
🧠 AI Insights Dashboard with predictions and recommendations  
📄 Export Financial Analysis as PDF  
🌙 Dark Mode Support  
🔐 Firebase Authentication  

AI & Advanced Features
---------------------

The application integrates advanced AI capabilities to enhance user experience and automate financial tracking:

Voice-based Transaction Entry
• Uses OpenAI Whisper model for speech-to-text conversion  
• Transcribed input is processed using Qwen 2.5 LLM  
• Extracts relevant financial details from user speech  
• Automatically fills transaction form fields  

AI Insights Dashboard
• Provides a short summary of user's financial history  
• Displays quick insight cards for better understanding  
• Predicts financial trends until the end of the month  
• Includes savings goal tracker (set and monitor goals)  
• Compares weekday vs weekend spending behavior  
• Shows budget health using progress indicators  
• Displays multiple charts and graphs for analysis  
• Generates AI-based financial recommendations  
• Allows exporting analysis reports as PDF  
• Includes AI chat support with follow-up questions (Qwen-2.5-7B model)  

All AI models are accessed via Hugging Face Inference API for seamless integration.

Tech Stack
----------

Frontend: React 18 + TypeScript  
Build Tool: Vite  
Styling: Tailwind CSS  
Backend: Firebase (Firestore, Authentication)  
Charts: Chart.js  
Routing: React Router DOM  

System Architecture
-------------------

The application follows a client-server architecture:

• Frontend handles UI rendering and user interactions  
• Firebase Authentication manages secure user login  
• Firestore stores transaction and user data in real time  
• Context API manages global application state  

This architecture ensures scalability, security, and real-time data synchronization.

Getting Started
---------------

Prerequisites
-------------

Node.js 18+ and npm  
Firebase account  

Installation
------------

Clone the repository:

git clone https://github.com/Ganesh-Kumatole/mini-project.git  
cd mini-project  

Install dependencies:

npm install  

Set up environment variables:

• Copy `.env.example` to `.env`  
• Fill in your Firebase configuration values  

Start the development server:

npm run dev  

Build for production:

npm run build  

Project Structure
-----------------

src/  
├── components/     # React components organized by feature  
├── context/        # React Context providers  
├── hooks/          # Custom React hooks  
├── services/       # Firebase and external services  
├── types/          # TypeScript type definitions  
├── utils/          # Utility functions  
└── styles/         # Global styles  

Firebase Setup
--------------

• Create a Firebase project using Firebase Console  
• Enable Authentication (Email/Password)  
• Create a Firestore database  
• Copy Firebase configuration into `.env` file  
• Deploy Firestore rules:

firebase deploy --only firestore:rules  

Implementations Made So Far
---------------------------

The following functionalities have been successfully implemented:

• User Authentication using Firebase (Email & Password)  
• Secure user-specific data storage using Firestore  
• Add, view, and manage income and expense transactions  
• Fully functional Budget Tracking system  
• In-app notifications for budget limits and overspending  
• Voice-based transaction entry using AI (Speech → Data extraction → Auto-fill)  
• AI-powered financial insights and analytics dashboard  
• Monthly prediction system based on current financial data  
• Savings goal tracking system  
• Comparison of weekday vs weekend transactions  
• Budget health monitoring with progress indicators  
• Export financial reports as PDF  
• AI chatbot for financial queries and follow-up questions  
• Context API for global state management  
• Responsive UI with Tailwind CSS and Dark Mode  
• Routing using React Router DOM  
• Type-safe development using TypeScript  

The project is structured to support scalability and future enhancements in AI and financial analytics.

Usage
-----

• Register or log in using Firebase Authentication  
• Add income and expense transactions  
• View financial summaries and insights  
• Track budgets and spending behavior  

Future Enhancements
-------------------

• Advanced data visualization dashboards  
• Monthly and yearly financial reports  
• Export data as CSV or PDF  
• Category-based expense analytics  
• Mobile application version  
• Enhanced AI-based expense predictions  

Deployment
----------

Deploy to Firebase Hosting:

npm run build  
firebase deploy  

Contributions
-------------

Ganesh Kumatole
• Project ideation and requirement analysis  
• Firebase setup (Authentication & Firestore)  
• Backend integration with frontend  
• Core logic for transaction and budget management  
• Project coordination and final integration  

Vinay Molkeri
• Project documentation and README enhancement  
• System architecture and workflow documentation  
• Feature analysis and implementation details  
• Repository structuring and formatting  
• Testing and validation support  

Koushik C
• Frontend UI component development  
• Styling and responsiveness using Tailwind CSS  
• Dark mode implementation  
• UI testing and improvements  

Rakesh Gadupudi
• Routing and navigation using React Router DOM  
• State management using Context API  
• Utility functions and TypeScript type definitions  
• Bug fixing and performance optimization  

All team members collaboratively reviewed the application to ensure correctness, usability, and maintainability.


License
-------

MIT License




