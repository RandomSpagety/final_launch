// public/script/auth-ui.js
// Tiny auth UI helper for nav visibility + page guards.

(function () {
  function byAttr(attr, val) {
    return Array.from(document.querySelectorAll(`[${attr}="${val}"]`));
  }

  function toggle() {
    const token = localStorage.getItem('demoToken');
    const role = localStorage.getItem('role');

    // Show/hide elements based on auth
    byAttr('data-auth', 'logged-in').forEach(el => el.style.display = token ? '' : 'none');
    byAttr('data-auth', 'logged-out').forEach(el => el.style.display = token ? 'none' : '');

    // Role-specific nav
    document.querySelectorAll('[data-role="admin"]').forEach(el => {
      el.style.display = token && role === 'admin' ? '' : 'none';
    });
    document.querySelectorAll('[data-role="doctor"]').forEach(el => {
      el.style.display = token && role === 'doctor' ? '' : 'none';
    });
  }

  // Expose helpers
  window.logout = function () {
    localStorage.removeItem('demoToken');
    localStorage.removeItem('role');
    location.href = '/login.html';
  };

  // Guard a page. If expectedRole provided, enforce it.
  window.requireRole = function (expectedRole) {
    const token = localStorage.getItem('demoToken');
    const role = localStorage.getItem('role');
    if (!token) { alert('Please sign in'); location.href = '/login.html'; return false; }
    if (expectedRole && role !== expectedRole) { alert('Not authorized'); location.href = '/index.html'; return false; }
    return true;
  };

  // Run after DOM ready
  document.addEventListener('DOMContentLoaded', toggle);
})();
