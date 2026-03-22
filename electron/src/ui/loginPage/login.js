// login.js

document.getElementById("loginForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value;

  // Client-side validation using centralized validator
  const validation = InputValidator.validateCredentials(username, password);
  if (!validation.valid) {
    document.getElementById('errorMsg').textContent = validation.error;
    return;
  }

  try {
    const response = await fetch("http://localhost:8080/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password })
    });

    const result = await response.json();
    if (result.success) {
      alert('Login successful!');
      window.location.href = '../dashboard/index.html';
    } else {
      document.getElementById('errorMsg').textContent = result.error || 'Login failed.';
    }
  } catch (error) {
    document.getElementById('errorMsg').textContent = 'Network error. Please try again.';
    console.error('Login error:', error);
  }
});

document.getElementById('signupBtn').addEventListener('click', function() {
  window.location.href = '../signupPage/index.html';
});