// signup.js

document.getElementById('signupForm').addEventListener('submit', async function(event) {
  event.preventDefault();

  const username = document.getElementById('username').value.trim();
  const password = document.getElementById('password').value;
  const confirmPassword = document.getElementById('confirmPassword').value;

  // Client-side validation using centralized validator
  let validation = InputValidator.validateCredentials(username, password);
  if (!validation.valid) {
    document.getElementById('errorMsg').textContent = validation.error;
    return;
  }

  // Validate password match
  validation = InputValidator.validatePasswordMatch(password, confirmPassword);
  if (!validation.valid) {
    document.getElementById('errorMsg').textContent = validation.error;
    return;
  }

  try {
    const response = await fetch('http://localhost:8080/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });

    const result = await response.json();

    if (result.success) {
      alert('Signup successful!');
      window.location.href = '../loginPage/index.html';
    } else {
      document.getElementById('errorMsg').textContent = result.error || 'Signup failed.';
    }
  } catch (error) {
    document.getElementById('errorMsg').textContent = 'Network error.';
  }
});

// back to login
const loginBtn = document.getElementById('loginBtn');
if (loginBtn) {
  loginBtn.addEventListener('click', function() {
    window.location.href = '../loginPage/index.html';
  });
}
