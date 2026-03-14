async function trigger() {
  try {
    const res = await fetch('http://localhost:3000/api/auth/forgot-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'rubiel1985@gmail.com' })
    });
    const data = await res.json();
    console.log('Response Status:', res.status);
    console.log('Response Body:', data);
  } catch (e) {
    console.error('Trigger Error:', e.message);
  }
}

trigger();
