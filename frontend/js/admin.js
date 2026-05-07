const API = 'https://student-grievance-portal-1.onrender.com/api';
const token = localStorage.getItem('token');
const user = JSON.parse(localStorage.getItem('user') || '{}');
if (!token) {
  window.location.href = 'index.html';
}

document.getElementById('welcomeMsg').textContent = `Welcome, ${user.name || 'Admin'}!`;

loadGrievances();

let allGrievances = [];

async function loadGrievances() {
  try {
    const res = await fetch(`${API}/grievance/all`, {
      headers: { 'Authorization': token }
    });
    allGrievances = await res.json();
    updateStats(allGrievances);
    renderGrievances(allGrievances);
  } catch (err) {
    console.error('Error loading grievances:', err);
  }
}

function updateStats(grievances) {
  document.getElementById('totalCount').textContent = grievances.length;
  document.getElementById('pendingCount').textContent = grievances.filter(g => g.status === 'Pending').length;
  document.getElementById('progressCount').textContent = grievances.filter(g => g.status === 'In Progress').length;
  document.getElementById('resolvedCount').textContent = grievances.filter(g => g.status === 'Resolved').length;
}

function filterGrievances() {
  const status = document.getElementById('filterStatus').value;
  const category = document.getElementById('filterCategory').value;

  let filtered = allGrievances;
  if (status) filtered = filtered.filter(g => g.status === status);
  if (category) filtered = filtered.filter(g => g.category === category);
  renderGrievances(filtered);
}

function renderGrievances(grievances) {
  const list = document.getElementById('grievanceList');

  if (grievances.length === 0) {
    list.innerHTML = `
      <div class="empty-state">
        <div class="icon">📭</div>
        <p>No grievances found.</p>
      </div>`;
    return;
  }

  list.innerHTML = grievances.map(g => `
    <div class="grievance-card ${g.status.replace(' ', '-')}">
      <div class="grievance-header">
        <div class="grievance-title">${g.title}</div>
        <span class="badge ${g.status.replace(' ', '-')}">${g.status}</span>
      </div>
      <div class="grievance-meta">
        👤 ${g.studentName} (${g.studentEmail}) &nbsp;|&nbsp;
        📁 ${g.category} &nbsp;|&nbsp;
        🔥 Priority: ${g.priority} &nbsp;|&nbsp;
        👥 Assigned: ${g.assignedTo}
      </div>
      <div class="grievance-desc">${g.description}</div>
      ${g.adminRemarks ? `<div style="background:#f0f2f5;padding:10px;border-radius:6px;font-size:13px;margin-bottom:8px;">💬 Remarks: ${g.adminRemarks}</div>` : ''}
      <div class="update-form">
        <div>
          <label>Status</label>
          <select id="status-${g._id}">
            <option ${g.status === 'Pending' ? 'selected' : ''}>Pending</option>
            <option ${g.status === 'In Progress' ? 'selected' : ''}>In Progress</option>
            <option ${g.status === 'Resolved' ? 'selected' : ''}>Resolved</option>
            <option ${g.status === 'Rejected' ? 'selected' : ''}>Rejected</option>
          </select>
        </div>
        <div>
          <label>Assign To</label>
          <select id="assign-${g._id}">
            <option ${g.assignedTo === 'Not Assigned' ? 'selected' : ''}>Not Assigned</option>
            <option ${g.assignedTo === 'Academic Dept' ? 'selected' : ''}>Academic Dept</option>
            <option ${g.assignedTo === 'Hostel Dept' ? 'selected' : ''}>Hostel Dept</option>
            <option ${g.assignedTo === 'Infrastructure Dept' ? 'selected' : ''}>Infrastructure Dept</option>
            <option ${g.assignedTo === 'Finance Dept' ? 'selected' : ''}>Finance Dept</option>
          </select>
        </div>
        <div>
          <label>Remarks</label>
          <input type="text" id="remarks-${g._id}" placeholder="Add remarks..." value="${g.adminRemarks || ''}" />
        </div>
        <div style="display:flex;gap:8px;">
          <button class="update-btn" onclick="updateGrievance('${g._id}')">Update</button>
          <button class="delete-btn" onclick="deleteGrievance('${g._id}')">Delete</button>
        </div>
      </div>
      <div class="grievance-footer">
        <span>📅 Submitted: ${new Date(g.createdAt).toLocaleDateString()}</span>
        <span>🔄 Updated: ${new Date(g.updatedAt).toLocaleDateString()}</span>
      </div>
    </div>
  `).join('');
}

async function updateGrievance(id) {
  const status = document.getElementById(`status-${id}`).value;
  const assignedTo = document.getElementById(`assign-${id}`).value;
  const adminRemarks = document.getElementById(`remarks-${id}`).value;

  try {
    const res = await fetch(`${API}/grievance/update/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token
      },
      body: JSON.stringify({ status, assignedTo, adminRemarks })
    });

    if (res.ok) {
      alert('✅ Grievance updated successfully!');
      loadGrievances();
    } else {
      alert('❌ Failed to update grievance');
    }
  } catch (err) {
    alert('Server error. Try again.');
  }
}

async function deleteGrievance(id) {
  if (!confirm('Are you sure you want to delete this grievance?')) return;

  try {
    const res = await fetch(`${API}/grievance/delete/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': token }
    });

    if (res.ok) {
      alert('✅ Grievance deleted!');
      loadGrievances();
    } else {
      alert('❌ Failed to delete grievance');
    }
  } catch (err) {
    alert('Server error. Try again.');
  }
}

function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.href = 'index.html';
}