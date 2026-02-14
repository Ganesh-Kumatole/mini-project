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
📊 Budget Tracking  
🤖 AI-Powered Expense Categorization  
📈 Financial Analytics & Insights  
🌙 Dark Mode Support  
🔐 Firebase Authentication  

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

The following functionalities have been successfully implemented in the project:

• User Authentication using Firebase (Email & Password)
• Secure user-based data access using Firebase Authentication
• Real-time storage of income and expense transactions using Firestore
• Add, view, and manage financial transactions
• Budget tracking structure for monitoring expenses
• Context API for global state management
• Modular component-based frontend architecture
• Responsive UI built with Tailwind CSS
• Dark Mode support for better user experience
• Routing and navigation using React Router DOM
• Type-safe development using TypeScript
• Scalable project structure for future feature additions

The application is designed to support future enhancements such as advanced analytics, AI-based insights, and data export features.

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




