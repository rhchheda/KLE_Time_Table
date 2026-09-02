/**
 * ============================================
 * Authentication & Authorization Module
 * KLE Timetable Portal
 * ============================================
 *
 * Role-based access control system
 * Prevents direct URL access without proper auth
 */

const AUTH = {
  ADMIN: 'admin',
  FACULTY: 'faculty',
  STUDENT: 'student'
};

const CREDENTIALS = {
  admin: {
    password: 'admin@kletech2026',
    faculty_id: 'ADMIN001',
    name: 'Administrator'
  },
  faculty: {
    password: 'faculty@kletech2026',
    faculty_id: 'F001',
    name: 'Deepa B'
  },
  student: {
    password: 'student@kletech2026',
    student_id: '1KL21CS001',
    name: '1st Year CSE-A'
  }
};

// Initialize authentication on page load
function initAuth(requiredRole) {
  const auth = getAuth();

  if (!auth || auth.role !== requiredRole) {
    redirectToLogin(requiredRole);
    return false;
  }

  // Check session timeout (1 hour)
  const now = Date.now();
  if (now - auth.timestamp > 3600000) {
    logout();
    redirectToLogin(requiredRole);
    return false;
  }

  // Refresh timestamp
  setAuth(auth.role, auth.user);
  return true;
}

function setAuth(role, user) {
  const auth = {
    role: role,
    user: user,
    timestamp: Date.now()
  };
  sessionStorage.setItem('kle_auth', JSON.stringify(auth));
}

function getAuth() {
  const auth = sessionStorage.getItem('kle_auth');
  return auth ? JSON.parse(auth) : null;
}

function logout() {
  sessionStorage.removeItem('kle_auth');
  window.location.href = 'index.html';
}

function redirectToLogin(requiredRole) {
  sessionStorage.removeItem('kle_auth');
  window.location.href = `index.html?role=${requiredRole}&redirect=${window.location.pathname}`;
}

function login(role, password) {
  if (!CREDENTIALS[role]) return false;
  if (CREDENTIALS[role].password !== password) return false;

  setAuth(role, CREDENTIALS[role]);
  return true;
}

function getCurrentUser() {
  const auth = getAuth();
  return auth ? auth.user : null;
}

function getCurrentRole() {
  const auth = getAuth();
  return auth ? auth.role : null;
}

function isAuthenticated() {
  return getAuth() !== null;
}

function formatDateTime(date) {
  const d = new Date(date);
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const day = String(d.getDate()).padStart(2, '0');
  const month = months[d.getMonth()];
  const year = d.getFullYear();
  const hours = String(d.getHours() % 12 || 12).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  const ampm = d.getHours() >= 12 ? 'PM' : 'AM';

  return `${day}-${month}-${year} ${hours}:${minutes} ${ampm}`;
}
