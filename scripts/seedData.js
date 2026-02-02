#!/usr/bin/env node
/**
 * Firestore Test Data Seed Script
 *
 * This script populates your Firestore database with sample transactions and budgets
 * for testing purposes.
 *
 * Setup:
 * 1. Download your Firebase Service Account Key from Firebase Console
 *    - Go to Project Settings > Service Accounts > Generate New Private Key
 *    - Save it as `serviceAccountKey.json` in the project root
 * 2. Install firebase-admin: npm install firebase-admin
 * 3. Run: node scripts/seedData.js
 */

import admin from 'firebase-admin';
import fs from 'fs';
import path from 'path';

const serviceAccount = JSON.parse(
  fs.readFileSync(path.resolve('serviceAccountKey.json'), 'utf-8'),
);

// Initialize Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: serviceAccount.project_id,
});

const db = admin.firestore();

// Sample users (you can modify these)
const SAMPLE_USERS = [
  {
    uid: 'test-user-1',
    email: 'testuser1@example.com',
    name: 'John Doe',
  },
  {
    uid: 'test-user-2',
    email: 'testuser2@example.com',
    name: 'Jane Smith',
  },
];

// Generate sample transactions for a user
function generateTransactions(userId, count = 30) {
  const transactions = [];
  const categories = [
    'Food & Dining',
    'Transportation',
    'Utilities',
    'Entertainment',
    'Healthcare',
    'Shopping',
    'Bills',
    'Groceries',
  ];
  const now = new Date();

  for (let i = 0; i < count; i++) {
    const daysAgo = Math.floor(Math.random() * 90); // Last 90 days
    const txDate = new Date(now);
    txDate.setDate(txDate.getDate() - daysAgo);

    const isExpense = Math.random() > 0.3; // 70% expenses, 30% income
    const amount = isExpense
      ? Math.floor(Math.random() * 500) + 10 // $10-$510
      : Math.floor(Math.random() * 3000) + 500; // $500-$3500

    transactions.push({
      amount,
      category: categories[Math.floor(Math.random() * categories.length)],
      date: admin.firestore.Timestamp.fromDate(txDate),
      description: isExpense
        ? `Sample ${isExpense ? 'expense' : 'income'} #${i + 1}`
        : `Income #${i + 1}`,
      type: isExpense ? 'expense' : 'income',
      userId,
      createdAt: admin.firestore.Timestamp.now(),
      updatedAt: admin.firestore.Timestamp.now(),
    });
  }

  return transactions;
}

// Generate sample budgets for a user
function generateBudgets(userId) {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

  const budgets = [
    {
      category: 'Food & Dining',
      limitAmount: 500,
      period: 'monthly',
      startDate: admin.firestore.Timestamp.fromDate(startOfMonth),
      endDate: admin.firestore.Timestamp.fromDate(endOfMonth),
      userId,
      createdAt: admin.firestore.Timestamp.now(),
      updatedAt: admin.firestore.Timestamp.now(),
    },
    {
      category: 'Transportation',
      limitAmount: 300,
      period: 'monthly',
      startDate: admin.firestore.Timestamp.fromDate(startOfMonth),
      endDate: admin.firestore.Timestamp.fromDate(endOfMonth),
      userId,
      createdAt: admin.firestore.Timestamp.now(),
      updatedAt: admin.firestore.Timestamp.now(),
    },
    {
      category: 'Entertainment',
      limitAmount: 200,
      period: 'monthly',
      startDate: admin.firestore.Timestamp.fromDate(startOfMonth),
      endDate: admin.firestore.Timestamp.fromDate(endOfMonth),
      userId,
      createdAt: admin.firestore.Timestamp.now(),
      updatedAt: admin.firestore.Timestamp.now(),
    },
    {
      category: 'Shopping',
      limitAmount: 400,
      period: 'monthly',
      startDate: admin.firestore.Timestamp.fromDate(startOfMonth),
      endDate: admin.firestore.Timestamp.fromDate(endOfMonth),
      userId,
      createdAt: admin.firestore.Timestamp.now(),
      updatedAt: admin.firestore.Timestamp.now(),
    },
  ];

  return budgets;
}

// Main seeding function
async function seedData() {
  console.log('🌱 Starting Firestore data seeding...\n');

  try {
    for (const user of SAMPLE_USERS) {
      console.log(`📝 Seeding data for user: ${user.name} (${user.email})`);

      // Generate and add transactions
      const transactions = generateTransactions(user.uid, 30);
      const transactionsRef = db
        .collection('users')
        .doc(user.uid)
        .collection('transactions');

      for (const tx of transactions) {
        await transactionsRef.add(tx);
      }
      console.log(`   ✅ Added ${transactions.length} transactions`);

      // Generate and add budgets
      const budgets = generateBudgets(user.uid);
      const budgetsRef = db
        .collection('users')
        .doc(user.uid)
        .collection('budgets');

      for (const budget of budgets) {
        await budgetsRef.add(budget);
      }
      console.log(`   ✅ Added ${budgets.length} budgets\n`);
    }

    console.log(
      '✨ Seeding complete! Your Firestore database now has test data.',
    );
    console.log('\n📊 Next steps:');
    console.log('   1. Log in with one of these test accounts:');
    SAMPLE_USERS.forEach((user) => {
      console.log(`      - Email: ${user.email} (or use Google auth)`);
    });
    console.log(
      '   2. Visit http://localhost:5173/dashboard to see your transactions and budgets',
    );
    console.log(
      '   3. Check the charts on Dashboard, Transactions, and Budgets pages\n',
    );

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding data:', error);
    process.exit(1);
  }
}

seedData();
