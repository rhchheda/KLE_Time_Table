/**
 * ============================================
 * Authentication & Authorization Module - PRODUCTION
 * KLE Timetable Portal
 * ============================================
 *
 * DO NOT commit demo credentials to GitHub
 * Fetch passwords from Google Apps Script backend
 */

const AUTH = {
  ADMIN: 'admin',
  FACULTY: 'faculty',
  STUDENT: 'student'
};

// Configuration - UPDATE THIS WITH YOUR GAS URL
const CONFIG = {
  // Deploy Main.gs as Web App and paste URL here
  GAS_URL: 'https://script.google.com/macros/s/AKfycbwGjJJyBwDNCfF_Mu06v1AZdvvFT82sFXT2_bHNXBmXKmQCxiWNZmaSSGXcp7Jyafoh/exec',

  // Session timeout in milliseconds (1 hour)
  SESSION_TIMEOUT: 3600000,

  // For DEMO ONLY - Set to false in production
  DEMO_MODE: true,
  DEMO_CREDENTIALS: {
    admin: 'admin@kletech2026',
    faculty: 'faculty@kletech2026',
    student: 'student@kletech2026'
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

/**
 * Production: Verify password via Google Apps Script
 * Demo: Check against hardcoded credentials
 */
async function login(role, password) {
  if (CONFIG.DEMO_MODE) {
    // DEMO MODE ONLY - Remove before production
    if (!CONFIG.DEMO_CREDENTIALS[role]) return false;
    if (CONFIG.DEMO_CREDENTIALS[role] !== password) return false;
  } else {
    // PRODUCTION MODE - Verify via GAS
    try {
      const response = await fetch(CONFIG.GAS_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'verifyPassword',
          role: role,
          password: password
        })
      });

      const result = await response.json();
      if (!result.ok) return false;
    } catch (error) {
      console.error('Auth error:', error);
      return false;
    }
  }

  // Get user details
  let userDetails = {};
  if (role === 'admin') {
    userDetails = { name: 'Administrator', id: 'ADMIN001' };
  } else if (role === 'faculty') {
    userDetails = { name: 'Deepa B', id: 'F001' };
  } else if (role === 'student') {
    userDetails = { name: '1st Year CSE-A', id: '1KL21CS001' };
  }

  setAuth(role, userDetails);
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
