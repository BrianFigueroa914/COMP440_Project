// login.js

const loginForm = document.getElementById('loginForm');
const loginErrorEl = document.getElementById('errorMsg');
const loginFields = ['username', 'password'];

function clearLoginError() {
  loginErrorEl.textContent = '';
}

loginFields.forEach((id) => {
  const field = document.getElementById(id);
  if (!field) {
    return;
  }

  // Ensure fields remain editable after failed attempts.
  field.disabled = false;
  field.readOnly = false;
  field.addEventListener('input', clearLoginError);
});

loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value;

  // Client-side validation using centralized validator
  const validation = InputValidator.validateCredentials(username, password);
  if (!validation.valid) {
    loginErrorEl.textContent = validation.error;
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
      window.location.href = '../dashboard/index.html';
    } else {
      loginErrorEl.textContent = result.error || 'Login failed.';
    }
  } catch (error) {
    loginErrorEl.textContent = 'Network error. Please try again.';
    console.error('Login error:', error);
  }
});

document.getElementById('signupBtn').addEventListener('click', function() {
  window.location.href = '../signupPage/index.html';
});