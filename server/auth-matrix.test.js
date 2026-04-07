import fetch from 'node-fetch';

const API_URL = process.env.API_URL || 'http://localhost:5000/api';

const creds = {
  student: { email: 'raj.kumar@iitm.student.ac.in', password: 'Password123' },
  librarian: { email: 'librarian@iitm.ac.in', password: 'LibrarianPass123' },
  admin: { email: 'admin@libris-connect.ac.in', password: 'AdminPass123' },
};

const results = [];

function logResult(name, passed, details = '') {
  results.push({ name, passed, details });
  const icon = passed ? 'PASS' : 'FAIL';
  console.log(`[${icon}] ${name}${details ? ` - ${details}` : ''}`);
}

async function request(endpoint, method = 'GET', body = null, token = null) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers.Authorization = `Bearer ${token}`;

  const response = await fetch(`${API_URL}${endpoint}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  let data = {};
  try {
    data = await response.json();
  } catch {
    data = {};
  }

  return { status: response.status, data };
}

async function loginAs(role) {
  const response = await request('/auth/login', 'POST', creds[role]);
  if (response.status !== 200 || !response.data.token) {
    throw new Error(`Failed to login as ${role}`);
  }
  return response.data.token;
}

async function run() {
  console.log('\nAuthorization Matrix Tests\n');

  const studentToken = await loginAs('student');
  const librarianToken = await loginAs('librarian');
  const adminToken = await loginAs('admin');

  // 1) Admin can create college.
  const uniqueCode = `TC${Date.now().toString().slice(-4)}`;
  const createCollegeRes = await request(
    '/colleges',
    'POST',
    {
      name: `Test College ${uniqueCode}`,
      code: uniqueCode,
      state: 'Test State',
      city: 'Test City',
      email: `admin+${uniqueCode.toLowerCase()}@testcollege.edu`,
      tier: 'tier2',
      libraryName: 'Test Library',
      contactPerson: 'Test Admin',
      phone: '+91-0000000000',
      isActive: true,
    },
    adminToken
  );
  logResult('Admin create college', createCollegeRes.status === 201, `status=${createCollegeRes.status}`);

  const createdCollegeId = createCollegeRes.data?.college?._id;

  // 2) Admin can update college.
  let updateCollegeStatus = 0;
  if (createdCollegeId) {
    const updateCollegeRes = await request(
      `/colleges/${createdCollegeId}`,
      'PUT',
      { city: 'Updated City' },
      adminToken
    );
    updateCollegeStatus = updateCollegeRes.status;
  }
  logResult('Admin update college', updateCollegeStatus === 200, `status=${updateCollegeStatus}`);

  // 3) Admin cannot create books.
  const adminCreateBookRes = await request(
    '/books',
    'POST',
    {
      title: 'Admin Forbidden Book',
      author: 'Test Author',
      category: 'Testing',
      college: createdCollegeId,
      availability: { total: 1, available: 1 },
    },
    adminToken
  );
  logResult('Admin cannot create book', adminCreateBookRes.status === 403, `status=${adminCreateBookRes.status}`);

  // 4) Student cannot create books.
  const studentCreateBookRes = await request(
    '/books',
    'POST',
    {
      title: 'Student Forbidden Book',
      author: 'Test Author',
      category: 'Testing',
      availability: { total: 1, available: 1 },
    },
    studentToken
  );
  logResult('Student cannot create book', studentCreateBookRes.status === 403, `status=${studentCreateBookRes.status}`);

  // 5) Student cannot create college.
  const studentCreateCollegeRes = await request(
    '/colleges',
    'POST',
    {
      name: 'Student Forbidden College',
      code: `SF${Date.now().toString().slice(-3)}`,
      state: 'X',
      city: 'Y',
      email: 'student@test.edu',
      tier: 'tier3',
    },
    studentToken
  );
  logResult('Student cannot create college', studentCreateCollegeRes.status === 403, `status=${studentCreateCollegeRes.status}`);

  // 6) Librarian can create own-college book.
  const librarianCreateBookRes = await request(
    '/books',
    'POST',
    {
      title: `Librarian Test Book ${Date.now()}`,
      author: 'Librarian Author',
      category: 'Testing',
      isbn: `978-0-${Date.now().toString().slice(-9)}`,
      availability: { total: 2, available: 2 },
    },
    librarianToken
  );
  logResult('Librarian can create own-college book', librarianCreateBookRes.status === 201, `status=${librarianCreateBookRes.status}`);

  const createdBookId = librarianCreateBookRes.data?._id;

  // 7) Librarian cannot update another college book.
  const allBooksRes = await request('/books?limit=100', 'GET');
  const otherCollegeBook = (allBooksRes.data.books || []).find(
    (book) => book.college?.name && book.college.name !== 'Indian Institute of Technology Madras'
  );
  let crossCollegeStatus = 0;
  if (otherCollegeBook?._id) {
    const crossUpdateRes = await request(
      `/books/${otherCollegeBook._id}`,
      'PUT',
      { title: 'Illicit update attempt' },
      librarianToken
    );
    crossCollegeStatus = crossUpdateRes.status;
  }
  logResult('Librarian cannot update other-college book', crossCollegeStatus === 403, `status=${crossCollegeStatus}`);

  // Cleanup: delete created librarian test book.
  if (createdBookId) {
    await request(`/books/${createdBookId}`, 'DELETE', null, librarianToken);
  }

  const passed = results.filter((r) => r.passed).length;
  const total = results.length;
  console.log(`\nSummary: ${passed}/${total} passed`);

  if (passed !== total) {
    process.exitCode = 1;
  }
}

run().catch((error) => {
  console.error('Authorization tests failed to run:', error.message);
  process.exit(1);
});