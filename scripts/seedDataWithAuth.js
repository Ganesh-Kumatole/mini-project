#!/usr/bin/env node
/**
 * Firestore + Authentication Test Data Seed Script
 *
 * This script:
 * 1. Creates test users in Firebase Authentication with email/password
 * 2. Populates their Firestore database with sample transactions and budgets
 *
 * Setup:
 * 1. Download your Firebase Service Account Key from Firebase Console
 *    - Go to Project Settings > Service Accounts > Generate New Private Key
 *    - Save it as `serviceAccountKey.json` in the project root
 * 2. Install firebase-admin: npm install firebase-admin
 * 3. Run: node scripts/seedDataWithAuth.js
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

const auth = admin.auth();
const db = admin.firestore();

// Sample test users with passwords
const SAMPLE_USERS = [
  {
    email: 'testuser1@example.com',
    password: 'TestPassword123!',
    name: 'John Doe',
  },
  {
    email: 'testuser2@example.com',
    password: 'TestPassword123!',
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
  console.log('🌱 Starting Firestore + Authentication data seeding...\n');

  try {
    for (const user of SAMPLE_USERS) {
      console.log(`📝 Processing user: ${user.name} (${user.email})`);

      // Step 1: Create user in Firebase Authentication
      let uid;
      try {
        const userRecord = await auth.createUser({
          email: user.email,
          password: user.password,
          displayName: user.name,
        });
        uid = userRecord.uid;
        console.log(`   ✅ Created Firebase Auth user (UID: ${uid})`);
      } catch (authError) {
        // User might already exist, try to get it
        if (authError.code === 'auth/email-already-exists') {
          console.log(`   ⚠️  User already exists in Firebase Auth`);
          const userRecord = await auth.getUserByEmail(user.email);
          uid = userRecord.uid;
          console.log(`   ℹ️  Using existing user (UID: ${uid})`);
        } else {
          throw authError;
        }
      }

      // Step 2: Create/update Firestore data for this user
      // Create user document
      await db.collection('users').doc(uid).set(
        {
          uid,
          email: user.email,
          displayName: user.name,
          createdAt: admin.firestore.Timestamp.now(),
          updatedAt: admin.firestore.Timestamp.now(),
        },
        { merge: true },
      );

      // Generate and add transactions
      const transactions = generateTransactions(uid, 30);
      const transactionsRef = db
        .collection('users')
        .doc(uid)
        .collection('transactions');

      for (const tx of transactions) {
        await transactionsRef.add(tx);
      }
      console.log(`   ✅ Added ${transactions.length} transactions`);

      // Generate and add budgets
      const budgets = generateBudgets(uid);
      const budgetsRef = db.collection('users').doc(uid).collection('budgets');

      for (const budget of budgets) {
        await budgetsRef.add(budget);
      }
      console.log(`   ✅ Added ${budgets.length} budgets\n`);
    }

    console.log(
      '✨ Seeding complete! Your Firestore database now has test data.',
    );
    console.log('\n🔐 Test Account Credentials:');
    console.log('   ┌─ Account 1');
    console.log(`   ├─ Email: ${SAMPLE_USERS[0].email}`);
    console.log(`   └─ Password: ${SAMPLE_USERS[0].password}`);
    console.log('   ┌─ Account 2');
    console.log(`   ├─ Email: ${SAMPLE_USERS[1].email}`);
    console.log(`   └─ Password: ${SAMPLE_USERS[1].password}`);
    console.log('\n📊 Next steps:');
    console.log('   1. Start the dev server: npm run dev');
    console.log('   2. Go to http://localhost:5173/login');
    console.log(`   3. Login with email: ${SAMPLE_USERS[0].email}`);
    console.log(`   4. Password: ${SAMPLE_USERS[0].password}`);
    console.log('   5. Visit Dashboard to see your transactions and budgets\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding data:', error);
    process.exit(1);
  }
}

seedData();
