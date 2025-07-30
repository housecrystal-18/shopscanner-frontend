import React from 'react';

export function TestApp() {
  return (
    <div style={{ padding: '20px', fontFamily: 'Arial' }}>
      <h1>🛍️ Shop Scanner Test</h1>
      <p>If you can see this, React is working!</p>
      <button onClick={() => alert('Button clicked!')}>
        Test Button
      </button>
      <div style={{ marginTop: '20px', padding: '10px', backgroundColor: '#f0f0f0' }}>
        <h3>Demo Login:</h3>
        <p>Email: demo@shopscanner.com</p>
        <p>Password: demo123</p>
      </div>
    </div>
  );
}