const API = '';

export async function fetchConfig() {
  const res = await fetch(`${API}/api/config`);
  return res.json();
}

export async function fetchPublicReports(filters = {}) {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([k, v]) => { if (v) params.set(k, v); });
  const res = await fetch(`${API}/api/reports/public?${params}`);
  return res.json();
}

export async function fetchNotices() {
  const res = await fetch(`${API}/api/notices`);
  return res.json();
}

export async function submitReport(formData) {
  const res = await fetch(`${API}/api/reports/submit`, { method: 'POST', body: formData });
  if (!res.ok) { const err = await res.json(); throw new Error(err.detail || 'Submission failed'); }
  return res.json();
}

export async function lookupReport(cin, reference) {
  const res = await fetch(`${API}/api/reports/lookup?cin=${encodeURIComponent(cin)}&reference=${encodeURIComponent(reference)}`);
  if (!res.ok) { const err = await res.json(); throw new Error(err.detail || 'Not found'); }
  return res.json();
}

export async function login(email, password) {
  const res = await fetch(`${API}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) { const err = await res.json(); throw new Error(err.detail || 'Login failed'); }
  return res.json();
}

function authHeaders() {
  const token = localStorage.getItem('ecoguard_token');
  return { Authorization: `Bearer ${token}` };
}

export async function fetchAuthorityReports(filters = {}) {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([k, v]) => { if (v) params.set(k, v); });
  const res = await fetch(`${API}/api/authority/reports?${params}`, { headers: authHeaders() });
  if (res.status === 401) throw new Error('Unauthorized');
  return res.json();
}

export async function fetchReportDetail(id) {
  const res = await fetch(`${API}/api/authority/reports/${id}`, { headers: authHeaders() });
  if (res.status === 401) throw new Error('Unauthorized');
  return res.json();
}

export async function updateReport(id, data) {
  const res = await fetch(`${API}/api/authority/reports/${id}`, {
    method: 'PATCH',
    headers: { ...authHeaders(), 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) { const err = await res.json(); throw new Error(err.detail || 'Update failed'); }
  return res.json();
}

export async function addNote(reportId, noteType, content) {
  const res = await fetch(`${API}/api/authority/reports/${reportId}/notes`, {
    method: 'POST',
    headers: { ...authHeaders(), 'Content-Type': 'application/json' },
    body: JSON.stringify({ note_type: noteType, content }),
  });
  if (!res.ok) { const err = await res.json(); throw new Error(err.detail || 'Failed to add note'); }
  return res.json();
}

export async function fetchStats() {
  const res = await fetch(`${API}/api/authority/stats`, { headers: authHeaders() });
  if (res.status === 401) throw new Error('Unauthorized');
  return res.json();
}
