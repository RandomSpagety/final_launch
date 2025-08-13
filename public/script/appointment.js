// --- Debug helpers ---
function report(where, err, extra) {
  const msg = `[${where}] ${err?.message || err}${extra ? ` | ${extra}` : ''}`;
  console.error(msg, err);
  alert(msg);
}
window.addEventListener('error', e => report('window.error', e.error || e.message));
window.addEventListener('unhandledrejection', e => report('promise', e.reason));

// Require login (will redirect if needed)
try { if (!requireRole()) throw new Error('Not logged in'); } catch { /* redirected */ }

// Elements
const token = localStorage.getItem('demoToken');
const H = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };
const sel = document.getElementById('doctor');
const tbody = document.querySelector('#list tbody');
const noMsg = document.getElementById('noDoctors');

console.log('[appointment.js] loaded', { hasToken: !!token, sel: !!sel, tbody: !!tbody });

async function loadDoctors() {
  try {
    const res = await fetch('/api/doctors', { headers: { Accept: 'application/json' } });
    if (!res.ok) throw new Error(`GET /api/doctors -> ${res.status} ${res.statusText}`);
    const ct = res.headers.get('content-type') || '';
    if (!ct.includes('application/json')) throw new Error(`Bad content-type: ${ct}`);

    const docs = await res.json();
    if (!Array.isArray(docs)) throw new Error('Response is not an array');

    sel.innerHTML = '<option value="">-- Select --</option>';
    if (!docs.length) { noMsg.style.display = ''; return; }

    docs.forEach(d => {
      const opt = document.createElement('option');
      opt.value = d._id;                           // doctor id
      opt.textContent = d.name + (d.specialty ? ` — ${d.specialty}` : '');
      opt.dataset.name = d.name;                   // display name
      sel.appendChild(opt);
    });
    noMsg.style.display = 'none';
  } catch (err) {
    noMsg.style.display = '';
    report('loadDoctors', err);
  }
}

async function loadAppointments() {
  try {
    const res = await fetch('/api/appointments', { headers: { Authorization: `Bearer ${token}` } });
    if (!res.ok) throw new Error(`GET /api/appointments -> ${res.status} ${res.statusText}`);
    const rows = await res.json();

    tbody.innerHTML = '';
    (rows || []).forEach(a => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${new Date(a.date).toLocaleDateString()}</td>
        <td>${a.time || ''}</td>
        <td>${a.dentist || ''}</td>
        <td>${a.reason || ''}</td>
        <td><button class="btn danger" data-id="${a._id}">Cancel</button></td>`;
      tbody.appendChild(tr);
    });
    if (!tbody.children.length) {
      tbody.innerHTML = '<tr><td colspan="5" class="muted">No appointments yet.</td></tr>';
    }
  } catch (err) { report('loadAppointments', err); }
}

document.getElementById('appointmentForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  try {
    const when = document.getElementById('when').value;
    const [date, timeFull] = (when || '').split('T');
    if (!date || !timeFull) throw new Error('Pick a valid date & time');

    const body = {
      doctorId: sel.value || null,
      dentist: sel.options[sel.selectedIndex]?.dataset?.name || '',
      date,
      time: timeFull.slice(0, 5),
      reason: (document.getElementById('reason').value || '').trim()
    };

    const res = await fetch('/api/appointments', { method: 'POST', headers: H, body: JSON.stringify(body) });
    if (!res.ok) {
      let msg = `POST /api/appointments -> ${res.status}`;
      try { const d = await res.json(); if (d?.message) msg = d.message; } catch {}
      throw new Error(msg);
    }
    alert('Booked');
    e.target.reset();
    loadAppointments();
  } catch (err) { report('book', err); }
});

document.querySelector('#list').addEventListener('click', async (e) => {
  const id = e.target.closest('button[data-id]')?.dataset.id;
  if (!id) return;
  try {
    const res = await fetch('/api/appointments/' + id, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
    if (!res.ok) throw new Error(`DELETE /api/appointments/${id} -> ${res.status}`);
    loadAppointments();
  } catch (err) { report('delete', err); }
});

loadDoctors().then(loadAppointments);
