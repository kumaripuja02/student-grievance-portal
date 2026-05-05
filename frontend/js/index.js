const API = 'http://localhost:8000/api';

function switchTab(tab, el) {
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  el.classList.add('active');
  document.getElementById('loginForm').classList.toggle('hidden', tab !== 'login');
  document.getElementById('registerForm').classList.toggle('hidden', tab !== 'register');
}

async function login() {
  const email = document.getElementById('loginEmail').value;
  const password = document.getElementById('loginPassword').value;
  const msg = document.getElementById('loginMsg');

  if (!email || !password) {
    msg.className = 'message error';
    msg.textContent = 'Please fill in all fields';
    return;
  }

  try {
    const res = await fetch(`${API}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();

    if (res.ok) {
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      msg.className = 'message success';
      msg.textContent = 'Login successful! Redirecting...';
      setTimeout(() => {
        window.location.href = data.user.role === 'admin' ? 'admin.html' : 'student.html';
      }, 1000);
    } else {
      msg.className = 'message error';
      msg.textContent = data.message;
    }
  } catch (err) {
    msg.className = 'message error';
    msg.textContent = 'Cannot connect to server. Is it running?';
  }
}

async function register() {
  const name = document.getElementById('regName').value;
  const email = document.getElementById('regEmail').value;
  const password = document.getElementById('regPassword').value;
  const role = document.getElementById('regRole').value;
  const msg = document.getElementById('registerMsg');

  if (!name || !email || !password) {
    msg.className = 'message error';
    msg.textContent = 'Please fill in all fields';
    return;
  }

  try {
    const res = await fetch(`${API}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password, role })
    });
    const data = await res.json();

    if (res.ok) {
      msg.className = 'message success';
      msg.textContent = 'Account created! Please login.';
    } else {
      msg.className = 'message error';
      msg.textContent = data.message;
    }
  } catch (err) {
    msg.className = 'message error';
    msg.textContent = 'Cannot connect to server. Is it running?';
  }
}