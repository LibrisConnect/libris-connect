import fetch from 'node-fetch';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import College from './src/models/College.js';
import Book from './src/models/Book.js';
import User from './src/models/User.js';

dotenv.config();

const API_URL = 'http://localhost:5000/api';
let testResults = [];
let authToken = null;
let authUser = null;

// Utility function for API calls
async function apiCall(endpoint, method = 'GET', body = null) {
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  if (authToken) {
    options.headers['Authorization'] = `Bearer ${authToken}`;
  }

  try {
    const response = await fetch(`${API_URL}${endpoint}`, options);
    const data = await response.json();
    return { status: response.status, data };
  } catch (error) {
    return { status: 500, data: { error: error.message } };
  }
}

// Test logger
function logTest(name, passed, details = '') {
  const result = {
    name,
    passed,
    details,
    timestamp: new Date().toISOString(),
  };
  testResults.push(result);
  const icon = passed ? '✅' : '❌';
  console.log(`${icon} ${name}`);
  if (details) console.log(`   └─ ${details}`);
}

async function runTests() {
  console.log('\n╔════════════════════════════════════════════════════════╗');
  console.log('║       LIBRISCONNECT - COMPREHENSIVE TEST SUITE        ║');
  console.log('╚════════════════════════════════════════════════════════╝\n');

  // ==========================================
  // TEST 1: College Listing
  // ==========================================
  console.log('\n📚 TEST 1: College Listing');
  console.log('─────────────────────────────');
  const collegesRes = await apiCall('/colleges');
  const collegesPassed =
    collegesRes.status === 200 && Array.isArray(collegesRes.data.colleges) && collegesRes.data.colleges.length === 8;
  logTest('Get colleges endpoint', collegesPassed, `${collegesRes.data.colleges?.length || 0} colleges found`);

  if (collegesPassed) {
    console.log('   Sample colleges:');
    collegesRes.data.colleges.slice(0, 2).forEach((college) => {
      console.log(`   • ${college.name} (${college.code})`);
    });
  }

  // ==========================================
  // TEST 2: Login with Incorrect Credentials
  // ==========================================
  console.log('\n🔐 TEST 2: Login with Incorrect Credentials');
  console.log('──────────────────────────────────────────');
  const wrongLoginRes = await apiCall('/auth/login', 'POST', {
    email: 'nonexistent@test.com',
    password: 'wrongpassword',
  });
  const wrongLoginPassed = wrongLoginRes.status === 401;
  logTest(
    'Reject invalid credentials',
    wrongLoginPassed,
    `Status ${wrongLoginRes.status}: ${wrongLoginRes.data.error}`
  );

  // ==========================================
  // TEST 3: Login with Correct Credentials
  // ==========================================
  console.log('\n✅ TEST 3: Login with Correct Credentials');
  console.log('─────────────────────────────────────────');
  const validLoginRes = await apiCall('/auth/login', 'POST', {
    email: 'raj.kumar@iitm.student.ac.in',
    password: 'Password123',
  });
  const validLoginPassed = validLoginRes.status === 200 && validLoginRes.data.token && validLoginRes.data.user;
  logTest(
    'Login with valid credentials',
    validLoginPassed,
    `User: ${validLoginRes.data.user?.name || 'N/A'}, Token: ${validLoginRes.data.token ? '✓' : '✗'}`
  );

  if (validLoginPassed) {
    authToken = validLoginRes.data.token;
    authUser = validLoginRes.data.user;
    console.log(`   User Details:`);
    console.log(`   • Email: ${authUser.email}`);
    console.log(`   • Name: ${authUser.name}`);
    console.log(`   • Role: ${authUser.role}`);
    console.log(`   • College: ${authUser.college?.name || 'N/A'}`);
  }

  // ==========================================
  // TEST 4: Get Current User (Auth Test)
  // ==========================================
  console.log('\n👤 TEST 4: Get Current User (Authentication)');
  console.log('────────────────────────────────────────────');
  if (authToken) {
    const mePassed = await apiCall('/auth/me');
    const meTestPassed = mePassed.status === 200 && mePassed.data._id;
    logTest(
      'Get authenticated user',
      meTestPassed,
      `Retrieved user: ${mePassed.data.name || 'N/A'}`
    );
  } else {
    logTest('Get authenticated user', false, 'No auth token available');
  }

  // ==========================================
  // TEST 5: Valid Join Request
  // ==========================================
  console.log('\n📋 TEST 5: Register/Join Request (Valid College)');
  console.log('────────────────────────────────────────────────');
  const uniqueEmail = `newstudent${Date.now()}@test.ac.in`;
  const validJoinRes = await apiCall('/auth/register', 'POST', {
    email: uniqueEmail,
    name: 'New Student',
    collegeCode: 'IITM',
    reason: 'Testing join functionality',
  });
  const validJoinPassed = validJoinRes.status === 201;
  logTest(
    'Submit valid join request',
    validJoinPassed,
    validJoinRes.data.message || validJoinRes.data.error
  );

  // ==========================================
  // TEST 6: Invalid Join Request (College Not Found)
  // ==========================================
  console.log('\n❌ TEST 6: Register/Join Request (Invalid College)');
  console.log('───────────────────────────────────────────────');
  const invalidJoinRes = await apiCall('/auth/register', 'POST', {
    email: 'another@test.ac.in',
    name: 'Another Student',
    collegeCode: 'INVALID',
  });
  const invalidJoinPassed = invalidJoinRes.status === 404;
  logTest(
    'Reject invalid college code',
    invalidJoinPassed,
    `Status ${invalidJoinRes.status}: ${invalidJoinRes.data.error}`
  );

  // ==========================================
  // TEST 7: Duplicate Email Join Request
  // ==========================================
  console.log('\n🔄 TEST 7: Duplicate Join Request (Same Email)');
  console.log('──────────────────────────────────────────────');
  const duplicateJoinRes = await apiCall('/auth/register', 'POST', {
    email: uniqueEmail,  // Use same email from Test 5
    name: 'Another Name',
    collegeCode: 'IITM',  // Same college as Test 5 to trigger duplicate check
  });
  const duplicateJoinPassed = duplicateJoinRes.status === 400;
  logTest(
    'Reject duplicate join request',
    duplicateJoinPassed,
    `Status ${duplicateJoinRes.status}: ${duplicateJoinRes.data.error}`
  );

  // ==========================================
  // TEST 8: Books Endpoint
  // ==========================================
  console.log('\n📖 TEST 8: Books Retrieval');
  console.log('──────────────────────────');
  const booksRes = await apiCall('/books');
  const booksPassed = booksRes.status === 200 && Array.isArray(booksRes.data.books) && booksRes.data.books.length > 0;
  logTest('Get books endpoint', booksPassed, `${booksRes.data.books?.length || 0} books retrieved`);

  if (booksPassed) {
    console.log('   Sample books:');
    booksRes.data.books.slice(0, 3).forEach((book) => {
      console.log(`   • "${book.title}" by ${book.author} (Rating: ${book.rating}/5)`);
    });
  }

  // ==========================================
  // DATABASE VERIFICATION
  // ==========================================
  console.log('\n💾 TEST 9: Database Integrity Verification');
  console.log('──────────────────────────────────────────');
  try {
    await mongoose.connect(process.env.MONGODB_URI);

    // Use actual models instead of empty schemas
    const colleges = await College.countDocuments();
    const books = await Book.countDocuments();
    const users = await User.countDocuments();

    logTest('Database connection', true, 'Connected to MongoDB Atlas');
    logTest('Colleges count', colleges === 8, `Expected 8, Found: ${colleges}`);
    logTest('Books count', books === 33, `Expected 33, Found: ${books}`);
    logTest('Users count', users === 41, `Expected 41, Found: ${users}`);

    // Check book ratings
    const booksWithRatings = await Book.find({ rating: { $exists: true, $gt: 0 } });
    logTest('Books with ratings', booksWithRatings.length > 0, `${booksWithRatings.length} books have ratings`);

    // Check password hashing
    const userDoc = await User.findOne({ email: 'raj.kumar@iitm.student.ac.in' });
    const passwordHashed = userDoc && userDoc.password && userDoc.password.startsWith('$2');
    logTest('Password hashing', passwordHashed, 'Passwords are bcrypt hashed');

    await mongoose.connection.close();
  } catch (error) {
    logTest('Database verification', false, error.message);
  }

  // ==========================================
  // TEST SUMMARY
  // ==========================================
  console.log('\n╔════════════════════════════════════════════════════════╗');
  console.log('║                     TEST SUMMARY                       ║');
  console.log('╚════════════════════════════════════════════════════════╝\n');

  const passed = testResults.filter((t) => t.passed).length;
  const total = testResults.length;
  const passPercentage = ((passed / total) * 100).toFixed(1);

  console.log(`Total Tests: ${total}`);
  console.log(`Passed: ${passed} ✅`);
  console.log(`Failed: ${total - passed} ❌`);
  console.log(`Pass Rate: ${passPercentage}%\n`);

  if (passed === total) {
    console.log('🎉 ALL TESTS PASSED! Project is working correctly!\n');
  } else {
    console.log('⚠️  Some tests failed. Review the details above.\n');
    console.log('Failed Tests:');
    testResults.filter((t) => !t.passed).forEach((t) => {
      console.log(`  ❌ ${t.name}: ${t.details}`);
    });
    console.log();
  }
}

// Run tests
runTests().catch(console.error);
