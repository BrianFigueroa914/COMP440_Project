// signup.js

document.getElementById('signupForm').addEventListener('submit', async function(event) {
  event.preventDefault();

  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;
  const confirmPassword = document.getElementById('confirmPassword').value;

  if (password !== confirmPassword) {
    document.getElementById('errorMsg').textContent = 'Passwords do not match.';
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
