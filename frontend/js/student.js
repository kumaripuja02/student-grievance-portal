const API = 'https://student-grievance-portal-1.onrender.com/api';
const token = localStorage.getItem('token');
const user = JSON.parse(localStorage.getItem('user') || '{}');

if (!token) window.location.href = 'index.html';

document.getElementById('welcomeMsg').textContent = `Welcome, ${user.name}!`;

loadGrievances();

function switchTab(tab, el) {
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  el.classList.add('active');
  document.getElementById('submitSection').classList.toggle('hidden', tab !== 'submit');
  document.getElementById('myGrievancesSection').classList.toggle('hidden', tab !== 'mygrievances');
  if (tab === 'mygrievances') loadGrievances();
}

async function submitGrievance() {
  const title = document.getElementById('title').value;
  const description = document.getElementById('description').value;
  const category = document.getElementById('category').value;
  const priority = document.getElementById('priority').value;
  const msg = document.getElementById('submitMsg');

  if (!title || !description || !category) {
    msg.className = 'message error';
    msg.textContent = 'Please fill in all fields';
    return;
  }

  try {
    const res = await fetch(`${API}/grievance/submit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token
      },
      body: JSON.stringify({ title, description, category, priority })
    });
    const data = await res.json();

    if (res.ok) {
      msg.className = 'message success';
      msg.textContent = '✅ Grievance submitted successfully!';
      document.getElementById('title').value = '';
      document.getElementById('description').value = '';
      document.getElementById('category').value = '';
      loadGrievances();
    } else {
      msg.className = 'message error';
      msg.textContent = data.message;
    }
  } catch (err) {
    msg.className = 'message error';
    msg.textContent = 'Server error. Try again.';
  }
}

async function loadGrievances() {
  try {
    const res = await fetch(`${API}/grievance/my`, {
      headers: { 'Authorization': token }
    });
    const grievances = await res.json();

    document.getElementById('totalCount').textContent = grievances.length;
    document.getElementById('pendingCount').textContent = grievances.filter(g => g.status === 'Pending').length;
    document.getElementById('progressCount').textContent = grievances.filter(g => g.status === 'In Progress').length;
    document.getElementById('resolvedCount').textContent = grievances.filter(g => g.status === 'Resolved').length;

    const list = document.getElementById('grievanceList');
    if (grievances.length === 0) {
      list.innerHTML = `
        <div class="empty-state">
          <div class="icon">📭</div>
          <p>No grievances submitted yet.</p>
        </div>`;
      return;
    }

    list.innerHTML = grievances.map(g => `
      <div class="grievance-card ${g.status.replace(' ', '-')}">
        <div class="grievance-header">
          <div class="grievance-title">${g.title}</div>
          <span class="badge ${g.status.replace(' ', '-')}">${g.status}</span>
        </div>
        <div class="grievance-meta">📁 ${g.category} &nbsp;|&nbsp; 🔥 Priority: ${g.priority} &nbsp;|&nbsp; 👤 Assigned to: ${g.assignedTo}</div>
        <div class="grievance-desc">${g.description}</div>
        ${g.adminRemarks ? `<div class="admin-remarks">💬 Admin Remarks: ${g.adminRemarks}</div>` : ''}
        <div class="grievance-footer">
          <span>📅 Submitted: ${new Date(g.createdAt).toLocaleDateString()}</span>
        </div>
      </div>
    `).join('');

  } catch (err) {
    console.error('Error loading grievances:', err);
  }
}

function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.href = 'index.html';
}