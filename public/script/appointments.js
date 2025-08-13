// Require login for this page
if (!requireRole()) { /* requireRole will redirect if needed */ }

const token = localStorage.getItem('demoToken');
const authHeaders = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };

const doctorSelect = document.getElementById('doctor');
const noDoctorsMsg  = document.getElementById('noDoctors');
const listBody = document.querySelector('#list tbody');

// Load doctors from API (users with role=doctor)
async function loadDoctors() {
  try {
    const res = await fetch('/api/doctors');
    const docs = await res.json();
    doctorSelect.innerHTML = '<option value="">-- Select --</option>';

    if (Array.isArray(docs) && docs.length) {
      docs.forEach(d => {
        const opt = document.createElement('option');
        opt.value = d._id; // store doctor id
        opt.textContent = d.name + (d.specialty ? ` — ${d.specialty}` : '');
        opt.dataset.name = d.name; // also keep display name
        doctorSelect.appendChild(opt);
      });
      noDoctorsMsg.style.display = 'none';
    } else {
      noDoctorsMsg.style.display = '';
    }
  } catch (e) {
    // If fetch fails, show fallback message
    doctorSelect.innerHTML = '<option value="">-- Select --</option>';
    noDoctorsMsg.style.display = '';
  }
}

// Convert datetime-local into date + HH:mm string
function splitWhen(value) {
  const [d, t] = (value || '').split('T');
  return { date: d, time: (t || '').slice(0, 5) };
}

// Load the current user's appointments
async function loadAppointments() {
  listBody.innerHTML = '<tr><td colspan="5" class="muted">Loading…</td></tr>';
  const res = await fetch('/api/appointments', { headers: { Authorization: `Bearer ${token}` } });
  const rows = await res.json();
  listBody.innerHTML = '';

  if (!Array.isArray(rows) || !rows.length) {
    listBody.innerHTML = '<tr><td colspan="5" class="muted">No appointments yet.</td></tr>';
    return;
  }

  rows.forEach(a => {
    const tr = document.createElement('tr');
    const dateStr = new Date(a.date).toLocaleDateString();
    tr.innerHTML = `
      <td>${dateStr}</td>
      <td>${a.time || ''}</td>
      <td>${a.dentist || ''}</td>
      <td>${a.reason || ''}</td>
      <td><button class="btn danger" data-id="${a._id}">Cancel</button></td>
    `;
    listBody.appendChild(tr);
  });
}

// Handle cancel
document.querySelector('#list').addEventListener('click', async (e) => {
  const btn = e.target.closest('button[data-id]');
  if (!btn) return;
  if (!confirm('Cancel this appointment?')) return;

  const res = await fetch('/api/appointments/' + btn.dataset.id, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` }
  });
  if (res.ok) loadAppointments();
  else alert('Delete failed');
});

// Handle booking
document.getElementById('appointmentForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const sel = doctorSelect;
  const when = document.getElementById('when').value;
  const reason = (document.getElementById('reason').value || '').trim();

  if (!sel.value && !sel.options[sel.selectedIndex]?.dataset?.name) {
    alert('Please choose a doctor');
    return;
  }

  const { date, time } = splitWhen(when);

  const body = {
    doctorId: sel.value || null,                                    // id of doctor user (preferred)
    dentist: sel.options[sel.selectedIndex]?.dataset?.name || '',   // doctor name for display/legacy
    date,
    time,
    reason
  };

  const res = await fetch('/api/appointments', {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify(body)
  });

  if (res.ok) {
    e.target.reset();
    loadAppointments();
    alert('Appointment booked');
  } else {
    const d = await res.json().catch(() => ({}));
    alert(d.message || 'Booking failed');
  }
});

// Init



// after the fetch...
if (res.ok) {
  e.target.reset();
  loadAppointments();
  alert('Appointment booked');
} else {
  let msg = `Booking failed (HTTP ${res.status})`;
  try {
    const d = await res.json();
    if (d?.message) msg = d.message;
  } catch (_) {}
  alert(msg);
}
loadDoctors().then(loadAppointments);
