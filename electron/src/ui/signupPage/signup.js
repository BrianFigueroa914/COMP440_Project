// signup.js

const signupForm = document.getElementById('signupForm');
const signupErrorEl = document.getElementById('errorMsg');
const signupFields = ['username', 'password', 'confirmPassword', 'firstName', 'lastName', 'email', 'phoneNumber'];

function clearSignupError() {
  signupErrorEl.textContent = '';
}

signupFields.forEach((id) => {
  const field = document.getElementById(id);
  if (!field) {
    return;
  }

  // Ensure fields remain editable after failed attempts.
  field.disabled = false;
  field.readOnly = false;
  field.addEventListener('input', clearSignupError);
});

signupForm.addEventListener('submit', async function(event) {
  event.preventDefault();

  const username = document.getElementById('username').value.trim();
  const password = document.getElementById('password').value;
  const confirmPassword = document.getElementById('confirmPassword').value;
  const firstName = document.getElementById('firstName').value.trim();
  const lastName = document.getElementById('lastName').value.trim();
  const email = document.getElementById('email').value.trim();
  const phoneNumber = document.getElementById('phoneNumber').value.trim();

  // Client-side validation using centralized validator
  let validation = InputValidator.validateCredentials(username, password);
  if (!validation.valid) {
    signupErrorEl.textContent = validation.error;
    return;
  }

  // Validate password match
  validation = InputValidator.validatePasswordMatch(password, confirmPassword);
  if (!validation.valid) {
    signupErrorEl.textContent = validation.error;
    return;
  }

  validation = InputValidator.validateRegistrationData(
    username,
    password,
    firstName,
    lastName,
    email,
    phoneNumber
  );
  if (!validation.valid) {
    signupErrorEl.textContent = validation.error;
    return;
  }

  try {
    const response = await fetch('http://localhost:8080/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password, firstName, lastName, email, phoneNumber })
    });

    const result = await response.json();

    if (result.success) {
      await AppModal.show('Signup successful!', 'Success');
      window.location.href = '../loginPage/index.html';
    } else {
      signupErrorEl.textContent = result.error || 'Signup failed.';
    }
  } catch (error) {
    signupErrorEl.textContent = 'Network error.';
  }
});

// back to login
const loginBtn = document.getElementById('loginBtn');
if (loginBtn) {
  loginBtn.addEventListener('click', function() {
    window.location.href = '../loginPage/index.html';
  });
}
