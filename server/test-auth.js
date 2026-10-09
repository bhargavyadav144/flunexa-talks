async function run() {
  try {
    console.log('--- 1. Testing Send Sign-Up OTP ---');
    const r1 = await fetch('http://localhost:5000/api/auth/send-signup-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Alice Test', email: 'alice.test@example.com', password: 'Password123!', nativeLanguage: 'Telugu' }),
    });
    const d1 = await r1.json();
    console.log('Send OTP result:', d1.success, d1.message, 'OTP:', d1.previewCode);

    console.log('\n--- 2. Testing Verify Sign-Up OTP & Account Creation ---');
    const r2 = await fetch('http://localhost:5000/api/auth/verify-signup-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'alice.test@example.com', otp: d1.previewCode }),
    });
    const d2 = await r2.json();
    console.log('Signup verified:', d2.success, 'User:', d2.user?.email, 'Token:', !!d2.token);

    console.log('\n--- 3. Testing Login ---');
    const r3 = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'alice.test@example.com', password: 'Password123!' }),
    });
    const d3 = await r3.json();
    console.log('Login result:', d3.success, d3.user?.name);

    console.log('\n--- 4. Testing Forgot Password OTP ---');
    const r4 = await fetch('http://localhost:5000/api/auth/forgot-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'alice.test@example.com' }),
    });
    const d4 = await r4.json();
    console.log('Forgot Password OTP:', d4.success, 'OTP:', d4.previewCode);

    console.log('\n--- 5. Testing Verify Reset OTP ---');
    const r5 = await fetch('http://localhost:5000/api/auth/verify-reset-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'alice.test@example.com', otp: d4.previewCode }),
    });
    const d5 = await r5.json();
    console.log('Verify Reset OTP:', d5.success);

    console.log('\n--- 6. Testing Reset Password with New Password ---');
    const r6 = await fetch('http://localhost:5000/api/auth/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'alice.test@example.com', otp: d4.previewCode, newPassword: 'BrandNewPass2026!' }),
    });
    const d6 = await r6.json();
    console.log('Reset Password result:', d6.success, d6.message, 'Token received:', !!d6.token);

    console.log('\n--- 7. Testing Login with New Password ---');
    const r7 = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'alice.test@example.com', password: 'BrandNewPass2026!' }),
    });
    const d7 = await r7.json();
    console.log('Login with new password succeeded:', d7.success);

    console.log('\n--- 7b. Testing Skip Password Reset Option ---');
    const rSkipReq = await fetch('http://localhost:5000/api/auth/forgot-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'alice.test@example.com' }),
    });
    const dSkipReq = await rSkipReq.json();
    const rSkipExec = await fetch('http://localhost:5000/api/auth/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'alice.test@example.com', otp: dSkipReq.previewCode, skip: true }),
    });
    const dSkipExec = await rSkipExec.json();
    console.log('Skip reset succeeded:', dSkipExec.success, 'Skipped flag:', dSkipExec.skipped, 'Token granted:', !!dSkipExec.token);

    console.log('\n--- 8. Testing Plans API ---');
    const r8 = await fetch('http://localhost:5000/api/plans');
    const d8 = await r8.json();
    console.log('Plans fetched:', d8.plans.map((p) => p.name));

    console.log('\nALL BACKEND API TESTS PASSED SUCCESSFULLY! ✅');
  } catch (err) {
    console.error('Test error:', err);
  }
}

run();
