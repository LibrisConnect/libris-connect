import fetch from 'node-fetch';

async function testLogin() {
  try {
    const response = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'raj.kumar@iitm.student.ac.in',
        password: 'Password123',
      }),
    });

    console.log('Response Status:', response.status);
    console.log('Response Headers:', response.headers.raw());
    
    const text = await response.text();
    console.log('Response Body (raw):', text);
    
    try {
      const data = JSON.parse(text);
      console.log('Response Body (parsed):', JSON.stringify(data, null, 2));
    } catch (e) {
      console.log('Failed to parse as JSON');
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

testLogin();
