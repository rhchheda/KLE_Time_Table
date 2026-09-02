/**
 * ============================================
 * Authentication & Authorization Module
 * KLE Timetable Portal - Production
 * ============================================
 *
 * Connects to Google Apps Script backend
 * Verifies passwords from Google Sheets CREDENTIALS sheet
 */

const AUTH = {
  ADMIN: 'admin',
  FACULTY: 'faculty',
  STUDENT: 'student'
};

// CONFIGURATION - SET YOUR GAS URL HERE
const CONFIG = {
  // Deploy Main.gs as Web App
  // Then paste deployment URL here:
  GAS_URL: 'https://script.google.com/macros/s/AKfycbwGjJJyBwDNCfF_Mu06v1AZdvvFT82sFXT2_bHNXBmXKmQCxiWNZmaSSGXcp7Jyafoh/exec',

  // Session timeout: 1 hour (milliseconds)
  SESSION_TIMEOUT: 3600000
};

// Initialize authentication on page load
function initAuth(requiredRole) {
  const auth = getAuth();

  if (!auth || auth.role !== requiredRole) {
    redirectToLogin(requiredRole);
    return false;
  }

  // Check session timeout
  const now = Date.now();
  if (now - auth.timestamp > CONFIG.SESSION_TIMEOUT) {
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
  window.location.href = `index.html?role=${requiredRole}`;
}

/**
 * Login function - Verifies password via Google Apps Script
 * Reads from CREDENTIALS sheet in Google Sheets
 */
async function login(role, password) {
  // Check if GAS_URL is configured
  if (!CONFIG.GAS_URL || CONFIG.GAS_URL === 'https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec') {
    console.error('ERROR: CONFIG.GAS_URL not configured in auth.js');
    alert('System not configured. Please set GAS_URL in auth.js');
    return false;
  }

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

    if (!result.ok) {
      return false;
    }

    // Store authenticated user in session
    let userDetails = { name: result.name || role, id: result.id || 'USER001' };
    setAuth(role, userDetails);
    return true;
  } catch (error) {
    console.error('Auth error:', error);
    return false;
  }
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
