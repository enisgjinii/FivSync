// Firebase functions are available globally via firebase-auth.js

// Global variables
let currentUser = null;
let isPro = false;
let contacts = [];
let currentConversation = null;
let isAuthenticated = false;

// UI Elements
const authContainer = document.getElementById('auth-container');
const mainApp = document.getElementById('main-app');
const loadingOverlay = document.getElementById('loading-overlay');

// Authentication forms
const loginForm = document.getElementById('login-form');
const signupForm = document.getElementById('signup-form');
const loginBtn = document.getElementById('login-btn');
const signupBtn = document.getElementById('signup-btn');
const showSignupBtn = document.getElementById('show-signup');
const showLoginBtn = document.getElementById('show-login');

// Form inputs
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const signupEmailInput = document.getElementById('signup-email');
const signupPasswordInput = document.getElementById('signup-password');
const confirmPasswordInput = document.getElementById('confirm-password');

// Error displays
const authError = document.getElementById('auth-error');
const signupError = document.getElementById('signup-error');

// Main app elements
const userEmailDisplay = document.getElementById('user-email-display');
const subscriptionBadge = document.getElementById('subscription-badge');
const dropdownUserEmail = document.getElementById('dropdown-user-email');
const statusBar = document.getElementById('status-bar');
const proUpgradeSection = document.getElementById('pro-upgrade-section');

// Controls
const fetchContactsBtn = document.getElementById('fetch-contacts-btn');
const extractConversationBtn = document.getElementById('extract-conversation-btn');
const contactsList = document.getElementById('contacts-list');
const contactSearch = document.getElementById('contact-search');

// Export elements
const exportActionsCard = document.getElementById('export-actions-card');
const currentConversationName = document.getElementById('current-conversation-name');
const downloadMdBtn = document.getElementById('download-md-btn');
const downloadJsonBtn = document.getElementById('download-json-btn');
const downloadTxtBtn = document.getElementById('download-txt-btn');
const downloadCsvBtn = document.getElementById('download-csv-btn');

// Header actions
const refreshStatusBtn = document.getElementById('refresh-status-btn');
const settingsBtn = document.getElementById('settings-btn');
const userMenuBtn = document.getElementById('user-menu-btn');
const userDropdown = document.getElementById('user-dropdown');
const logoutBtn = document.getElementById('logout-btn');

// Modal elements
const modalBackdrop = document.getElementById('modal-backdrop');
const settingsModal = document.getElementById('settings-modal');
const profileModal = document.getElementById('profile-modal');
const attachmentsModal = document.getElementById('attachments-modal');

// Password toggle functionality
function initializePasswordToggles() {
  const passwordToggles = document.querySelectorAll('.password-toggle');
  
  passwordToggles.forEach(toggle => {
    toggle.addEventListener('click', () => {
      const input = toggle.previousElementSibling;
      if (input.type === 'password') {
        input.type = 'text';
        toggle.innerHTML = `
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
            <line x1="1" y1="1" x2="23" y2="23"></line>
          </svg>
        `;
      } else {
        input.type = 'password';
        toggle.innerHTML = `
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
            <circle cx="12" cy="12" r="3"></circle>
          </svg>
        `;
      }
    });
  });
}

// Password strength checker
function checkPasswordStrength(password) {
  const strengthBar = document.querySelector('.strength-fill');
  const strengthText = document.querySelector('.strength-text');
  
  if (!strengthBar || !strengthText) return;
  
  let strength = 0;
  const checks = [
    password.length >= 8,
    /[a-z]/.test(password),
    /[A-Z]/.test(password),
    /[0-9]/.test(password),
    /[^A-Za-z0-9]/.test(password)
  ];
  
  strength = checks.filter(Boolean).length;
  
  strengthBar.className = 'strength-fill';
  if (strength === 0) {
    strengthBar.style.width = '0%';
    strengthText.textContent = 'Password strength';
  } else if (strength <= 2) {
    strengthBar.classList.add('weak');
    strengthText.textContent = 'Weak password';
  } else if (strength === 3) {
    strengthBar.classList.add('fair');
    strengthText.textContent = 'Fair password';
  } else if (strength === 4) {
    strengthBar.classList.add('good');
    strengthText.textContent = 'Good password';
  } else {
    strengthBar.classList.add('strong');
    strengthText.textContent = 'Strong password';
  }
}

// Enhanced authentication functions
async function loginUser(email, password) {
  try {
    showButtonLoading(loginBtn, true);
    hideError(authError);
    
    const result = await firebase.auth().signInWithEmailAndPassword(email, password);
    console.log('Login successful:', result.user.email);
    
    // Store user email in chrome storage
    await new Promise((resolve) => {
      chrome.storage.local.set({ userEmail: result.user.email }, resolve);
    });
    
    return result.user;
  } catch (error) {
    console.error('Login error:', error);
    showError(authError, getAuthErrorMessage(error));
    throw error;
  } finally {
    showButtonLoading(loginBtn, false);
  }
}

async function signupUser(email, password) {
  try {
    showButtonLoading(signupBtn, true);
    hideError(signupError);
    
    const result = await firebase.auth().createUserWithEmailAndPassword(email, password);
    console.log('Signup successful:', result.user.email);
    
    // Store user email in chrome storage
    await new Promise((resolve) => {
      chrome.storage.local.set({ userEmail: result.user.email }, resolve);
    });
    
    return result.user;
  } catch (error) {
    console.error('Signup error:', error);
    showError(signupError, getAuthErrorMessage(error));
    throw error;
  } finally {
    showButtonLoading(signupBtn, false);
  }
}

function getAuthErrorMessage(error) {
  switch (error.code) {
    case 'auth/user-not-found':
      return 'No account found with this email address.';
    case 'auth/wrong-password':
      return 'Incorrect password. Please try again.';
    case 'auth/email-already-in-use':
      return 'An account already exists with this email address.';
    case 'auth/weak-password':
      return 'Password should be at least 6 characters long.';
    case 'auth/invalid-email':
      return 'Please enter a valid email address.';
    case 'auth/too-many-requests':
      return 'Too many failed attempts. Please try again later.';
    default:
      return error.message || 'An error occurred during authentication.';
  }
}

// Button loading states
function showButtonLoading(button, isLoading) {
  if (!button) {
    console.warn('Button element not found for loading state');
    return;
  }
  
  const btnText = button.querySelector('.btn-text');
  const btnLoader = button.querySelector('.btn-loader');
  
  if (isLoading) {
    if (btnText) btnText.style.opacity = '0';
    if (btnLoader) btnLoader.style.display = 'flex';
    button.disabled = true;
  } else {
    if (btnText) btnText.style.opacity = '1';
    if (btnLoader) btnLoader.style.display = 'none';
    button.disabled = false;
  }
}

// Error handling
function showError(errorElement, message) {
  errorElement.textContent = message;
  errorElement.classList.add('show');
  
  // Auto-hide after 5 seconds
  setTimeout(() => {
    hideError(errorElement);
  }, 5000);
}

function hideError(errorElement) {
  errorElement.classList.remove('show');
}

// Status bar functions
function showStatus(message, type = 'info') {
  if (!statusBar) {
    console.warn('Status bar element not found');
    return;
  }
  
  const statusContent = statusBar.querySelector('.status-content');
  const statusText = statusBar.querySelector('.status-text');
  const statusIcon = statusBar.querySelector('.status-icon');
  
  if (statusText) statusText.textContent = message;
  statusBar.className = `status-bar ${type}`;
  statusBar.style.display = 'block';
  
  // Auto-hide after 5 seconds for non-error messages
  if (type !== 'error') {
    setTimeout(() => {
      if (statusBar) statusBar.style.display = 'none';
    }, 5000);
  }
}

function hideStatus() {
  statusBar.style.display = 'none';
}

// Enhanced user verification and payment checking
async function verifyUserPaymentStatus(userEmail) {
  try {
    console.log('Checking payment status for:', userEmail);
    
    if (!userEmail) {
      throw new Error('No user email provided');
    }
    
    // Check Firebase Firestore for subscription status
    const db = firebase.firestore();
    
    // Use the user's UID instead of email for document ID
    const user = firebase.auth().currentUser;
    if (!user) {
      throw new Error('User not authenticated');
    }
    
    const userDoc = await db.collection('users').doc(user.uid).get();
    
    if (userDoc.exists) {
      const userData = userDoc.data();
      console.log('User data from Firestore:', userData);
      
      // Check subscription status
      const subscriptionStatus = userData.subscriptionStatus || 'free';
      const subscriptionExpiry = userData.subscriptionExpiry;
      
      // Check if subscription is active and not expired
      if (subscriptionStatus === 'pro' || subscriptionStatus === 'active') {
        if (subscriptionExpiry) {
          const expiryDate = new Date(subscriptionExpiry.seconds * 1000);
          const now = new Date();
          
          if (expiryDate > now) {
            console.log('Pro subscription is active until:', expiryDate);
            return {
              isPro: true,
              subscriptionStatus: 'pro',
              expiryDate: expiryDate,
              planType: userData.planType || 'monthly'
            };
          } else {
            console.log('Pro subscription has expired');
            return {
              isPro: false,
              subscriptionStatus: 'expired',
              expiryDate: expiryDate
            };
          }
        } else {
          // No expiry date means lifetime or active
          return {
            isPro: true,
            subscriptionStatus: 'pro',
            planType: userData.planType || 'monthly'
          };
        }
      }
    } else {
      console.log('No user document found in Firestore, creating default entry');
      
      // Create default user document
      await db.collection('users').doc(user.uid).set({
        email: userEmail,
        uid: user.uid,
        subscriptionStatus: 'free',
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        totalExports: 0,
        thisMonthExports: 0
      });
    }
    
    return {
      isPro: false,
      subscriptionStatus: 'free'
    };
    
  } catch (error) {
    console.error('Error checking payment status:', error);
    
    // Fallback to free status if there's an error
    return {
      isPro: false,
      subscriptionStatus: 'free',
      error: error.message
    };
  }
}

// Update user interface based on authentication and subscription status
async function updateUserInterface() {
  console.log('Updating user interface...');
  console.log('Current user:', currentUser);
  console.log('Is Pro:', isPro);
  
  if (!currentUser || !currentUser.email) {
    console.log('No current user, showing auth container');
    authContainer.style.display = 'flex';
    mainApp.style.display = 'none';
    return;
  }
  
  // Show main app
  authContainer.style.display = 'none';
  mainApp.style.display = 'flex';
  
  // Update user email displays
  userEmailDisplay.textContent = currentUser.email;
  dropdownUserEmail.textContent = currentUser.email;
  
  // Update subscription badge
  updateSubscriptionBadge();
  
  // Show/hide pro upgrade section
  if (isPro) {
    proUpgradeSection.style.display = 'none';
  } else {
    proUpgradeSection.style.display = 'block';
  }
  
  // Update pro feature buttons
  updateProFeatureButtons();
  
  console.log('User interface updated successfully');
}

function updateSubscriptionBadge() {
  const badgeText = subscriptionBadge.querySelector('.badge-text');
  
  if (isPro) {
    badgeText.textContent = 'PRO';
    subscriptionBadge.className = 'subscription-badge pro';
  } else {
    badgeText.textContent = 'FREE';
    subscriptionBadge.className = 'subscription-badge free';
  }
}

function updateProFeatureButtons() {
  const proFeatures = document.querySelectorAll('.pro-feature');
  
  proFeatures.forEach(element => {
    if (isPro) {
      element.classList.remove('disabled');
      element.style.cursor = 'pointer';
    } else {
      element.classList.add('disabled');
      element.style.cursor = 'not-allowed';
    }
  });
}

// Enhanced user session management
async function ensureUserSession() {
  console.log('Ensuring user session...');
  
  try {
    showLoadingOverlay(true);
    
    // Check if user is authenticated with Firebase
    const firebaseUser = firebase.auth().currentUser;
    
    if (firebaseUser) {
      console.log('Firebase user found:', firebaseUser.email);
      currentUser = firebaseUser;
      
      // Verify payment status
      const paymentStatus = await verifyUserPaymentStatus(firebaseUser.email);
      isPro = paymentStatus.isPro;
      
      console.log('Payment status:', paymentStatus);
      
      // Store user info in chrome storage
      await new Promise((resolve) => {
        chrome.storage.local.set({ 
          userEmail: firebaseUser.email,
          subscriptionStatus: paymentStatus.subscriptionStatus,
          isPro: isPro
        }, resolve);
      });
      
      isAuthenticated = true;
      await updateUserInterface();
      
      showStatus(`Welcome back, ${firebaseUser.email}!`, 'success');
      
    } else {
      console.log('No Firebase user found');
      
      // Check chrome storage for cached user info
      const result = await new Promise((resolve) => {
        chrome.storage.local.get(['userEmail', 'subscriptionStatus', 'isPro'], resolve);
      });
      
      if (result.userEmail) {
        console.log('Found cached user info:', result);
        showStatus('Please sign in to continue', 'info');
      }
      
      isAuthenticated = false;
      await updateUserInterface();
    }
    
  } catch (error) {
    console.error('Error ensuring user session:', error);
    showStatus('Error loading user session', 'error');
    isAuthenticated = false;
    await updateUserInterface();
  } finally {
    showLoadingOverlay(false);
  }
}

function showLoadingOverlay(show) {
  loadingOverlay.style.display = show ? 'flex' : 'none';
}

// Enhanced upgrade button functionality
async function handleUpgradeClick() {
  console.log('Upgrade button clicked');
  
  if (!currentUser || !currentUser.email) {
    // Try to get user email from multiple sources
    let userEmail = null;
    
    // First try Firebase auth
    const firebaseUser = firebase.auth().currentUser;
    if (firebaseUser && firebaseUser.email) {
      userEmail = firebaseUser.email;
      console.log('Using Firebase user email:', userEmail);
    } else {
      // Try chrome storage as fallback
      const result = await new Promise((resolve) => {
        chrome.storage.local.get(['userEmail'], resolve);
      });
      
      if (result.userEmail) {
        userEmail = result.userEmail;
        console.log('Using cached user email:', userEmail);
      }
    }
    
    if (!userEmail) {
      showStatus('Please sign in first to upgrade your account', 'error');
      return;
    }
    
    // Store checkout email and open checkout page
    await new Promise((resolve) => {
      chrome.storage.local.set({ checkoutEmail: userEmail }, resolve);
    });
    
    console.log('Opening checkout page for:', userEmail);
    chrome.tabs.create({ url: chrome.runtime.getURL('checkout.html') });
    
  } else {
    // User is properly authenticated
    await new Promise((resolve) => {
      chrome.storage.local.set({ checkoutEmail: currentUser.email }, resolve);
    });
    
    console.log('Opening checkout page for authenticated user:', currentUser.email);
    chrome.tabs.create({ url: chrome.runtime.getURL('checkout.html') });
  }
}

// Refresh subscription status
async function refreshSubscriptionStatus() {
  console.log('Refreshing subscription status...');
  
  if (!currentUser || !currentUser.email) {
    console.log('No current user to refresh status for');
    return;
  }
  
  try {
    showButtonLoading(refreshStatusBtn, true);
    
    const paymentStatus = await verifyUserPaymentStatus(currentUser.email);
    isPro = paymentStatus.isPro;
    
    console.log('Refreshed payment status:', paymentStatus);
    
    // Update chrome storage
    await new Promise((resolve) => {
      chrome.storage.local.set({ 
        subscriptionStatus: paymentStatus.subscriptionStatus,
        isPro: isPro
      }, resolve);
    });
    
    await updateUserInterface();
    
    if (isPro) {
      showStatus('Pro subscription confirmed!', 'success');
    } else {
      showStatus('Subscription status updated', 'info');
    }
    
  } catch (error) {
    console.error('Error refreshing subscription status:', error);
    showStatus('Error refreshing subscription status', 'error');
  } finally {
    showButtonLoading(refreshStatusBtn, false);
  }
}

// Modal management
function showModal(modal) {
  modalBackdrop.style.display = 'block';
  modal.style.display = 'flex';
  document.body.style.overflow = 'hidden';
}

function hideModal(modal) {
  modalBackdrop.style.display = 'none';
  modal.style.display = 'none';
  document.body.style.overflow = 'auto';
}

function hideAllModals() {
  const modals = document.querySelectorAll('.modal');
  modals.forEach(modal => {
    modal.style.display = 'none';
  });
  modalBackdrop.style.display = 'none';
  document.body.style.overflow = 'auto';
}

// Dropdown management
function toggleDropdown(dropdown) {
  const isVisible = dropdown.classList.contains('show');
  
  // Hide all dropdowns first
  document.querySelectorAll('.dropdown-menu').forEach(menu => {
    menu.classList.remove('show');
  });
  
  if (!isVisible) {
    dropdown.classList.add('show');
  }
}

// Contact management
async function fetchContacts() {
  console.log('Fetching contacts...');
  
  try {
    showButtonLoading(fetchContactsBtn, true);
    document.getElementById('contacts-progress').textContent = 'Fetching contacts...';
    
    // Send message to content script
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    if (!tab.url.includes('fiverr.com')) {
      throw new Error('Please navigate to Fiverr.com first');
    }
    
    const response = await chrome.tabs.sendMessage(tab.id, { action: 'fetchContacts' });
    
    if (response && response.success) {
      contacts = response.contacts || [];
      console.log('Fetched contacts:', contacts);
      
      renderContactsList(contacts);
      document.getElementById('contacts-progress').textContent = `Found ${contacts.length} contacts`;
      
      showStatus(`Found ${contacts.length} contacts`, 'success');
    } else {
      throw new Error(response?.error || 'Failed to fetch contacts');
    }
    
  } catch (error) {
    console.error('Error fetching contacts:', error);
    document.getElementById('contacts-progress').textContent = 'Error fetching contacts';
    showStatus(error.message, 'error');
  } finally {
    showButtonLoading(fetchContactsBtn, false);
  }
}

function renderContactsList(contactsToRender) {
  const contactsList = document.getElementById('contacts-list');
  
  if (!contactsToRender || contactsToRender.length === 0) {
    contactsList.innerHTML = `
      <div class="empty-state">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1">
          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
          <circle cx="9" cy="7" r="4"></circle>
          <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
          <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
        </svg>
        <h4>No contacts found</h4>
        <p>Click "Fetch Contacts" to load your Fiverr conversations</p>
      </div>
    `;
    return;
  }
  
  contactsList.innerHTML = contactsToRender.map(contact => `
    <div class="contact-item" data-contact-id="${contact.id}">
      <div class="contact-name">${contact.name}</div>
      <div class="contact-last-message">${contact.lastMessage || 'No recent messages'}</div>
    </div>
  `).join('');
  
  // Add click listeners
  contactsList.querySelectorAll('.contact-item').forEach(item => {
    item.addEventListener('click', () => {
      const contactId = item.dataset.contactId;
      const contact = contacts.find(c => c.id === contactId);
      if (contact) {
        selectContact(contact);
      }
    });
  });
}

function selectContact(contact) {
  console.log('Selected contact:', contact);
  
  // Update UI to show selected contact
  document.querySelectorAll('.contact-item').forEach(item => {
    item.classList.remove('selected');
  });
  
  const selectedItem = document.querySelector(`[data-contact-id="${contact.id}"]`);
  if (selectedItem) {
    selectedItem.classList.add('selected');
  }
  
  // Enable extract button
  extractConversationBtn.disabled = false;
  extractConversationBtn.textContent = `Extract ${contact.name}'s Conversation`;
  
  // Store selected contact
  window.selectedContact = contact;
}

// Contact search functionality
function initializeContactSearch() {
  contactSearch.addEventListener('input', (e) => {
    const searchTerm = e.target.value.toLowerCase();
    
    if (!searchTerm) {
      renderContactsList(contacts);
      return;
    }
    
    const filteredContacts = contacts.filter(contact => 
      contact.name.toLowerCase().includes(searchTerm) ||
      (contact.lastMessage && contact.lastMessage.toLowerCase().includes(searchTerm))
    );
    
    renderContactsList(filteredContacts);
  });
}

// Form switching
function switchToSignup() {
  loginForm.style.display = 'none';
  signupForm.style.display = 'block';
  hideError(authError);
}

function switchToLogin() {
  signupForm.style.display = 'none';
  loginForm.style.display = 'block';
  hideError(signupError);
}

// Enhanced logout functionality
async function logoutUser() {
  try {
    console.log('Logging out user...');
    
    // Sign out from Firebase
    await firebase.auth().signOut();
    
    // Clear chrome storage
    await new Promise((resolve) => {
      chrome.storage.local.clear(resolve);
    });
    
    // Reset global variables
    currentUser = null;
    isPro = false;
    isAuthenticated = false;
    contacts = [];
    currentConversation = null;
    
    // Hide all modals and dropdowns
    hideAllModals();
    document.querySelectorAll('.dropdown-menu').forEach(menu => {
      menu.classList.remove('show');
    });
    
    // Update UI
    await updateUserInterface();
    
    showStatus('Logged out successfully', 'info');
    
  } catch (error) {
    console.error('Error during logout:', error);
    showStatus('Error during logout', 'error');
  }
}

// Initialize authentication forms and event listeners
function initializeAuthForms() {
  console.log('Initializing authentication forms...');
  
  // Initialize password toggles
  initializePasswordToggles();
  
  // Password strength checker
  if (signupPasswordInput) {
    signupPasswordInput.addEventListener('input', (e) => {
      checkPasswordStrength(e.target.value);
    });
  }
  
  // Form switching
  if (showSignupBtn) {
    showSignupBtn.addEventListener('click', (e) => {
      e.preventDefault();
      switchToSignup();
    });
  }
  
  if (showLoginBtn) {
    showLoginBtn.addEventListener('click', (e) => {
      e.preventDefault();
      switchToLogin();
    });
  }
  
  // Login form submission
  if (loginBtn) {
    loginBtn.addEventListener('click', async (e) => {
      e.preventDefault();
      
      const email = emailInput.value.trim();
      const password = passwordInput.value;
      
      if (!email || !password) {
        showError(authError, 'Please enter both email and password');
        return;
      }
      
      try {
        const user = await loginUser(email, password);
        console.log('Login successful, user:', user);
      } catch (error) {
        console.error('Login failed:', error);
      }
    });
  }
  
  // Signup form submission
  if (signupBtn) {
    signupBtn.addEventListener('click', async (e) => {
      e.preventDefault();
      
      const email = signupEmailInput.value.trim();
      const password = signupPasswordInput.value;
      const confirmPassword = confirmPasswordInput.value;
      
      if (!email || !password || !confirmPassword) {
        showError(signupError, 'Please fill in all fields');
        return;
      }
      
      if (password !== confirmPassword) {
        showError(signupError, 'Passwords do not match');
        return;
      }
      
      if (password.length < 6) {
        showError(signupError, 'Password must be at least 6 characters long');
        return;
      }
      
      try {
        const user = await signupUser(email, password);
        console.log('Signup successful, user:', user);
      } catch (error) {
        console.error('Signup failed:', error);
      }
    });
  }
}

// Initialize main app event listeners
function initializeMainAppListeners() {
  console.log('Initializing main app event listeners...');
  
  // Header actions
  if (refreshStatusBtn) {
    refreshStatusBtn.addEventListener('click', refreshSubscriptionStatus);
  }
  
  if (userMenuBtn) {
    userMenuBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleDropdown(userDropdown);
    });
  }
  
  if (logoutBtn) {
    logoutBtn.addEventListener('click', (e) => {
      e.preventDefault();
      logoutUser();
    });
  }
  
  // Controls
  if (fetchContactsBtn) {
    fetchContactsBtn.addEventListener('click', fetchContacts);
  }
  
  // Upgrade button
  const upgradeBtn = document.getElementById('upgrade-btn');
  if (upgradeBtn) {
    upgradeBtn.addEventListener('click', handleUpgradeClick);
  }
  
  // Modal triggers
  if (settingsBtn) {
    settingsBtn.addEventListener('click', () => {
      showModal(settingsModal);
    });
  }
  
  const viewProfileBtn = document.getElementById('view-profile');
  if (viewProfileBtn) {
    viewProfileBtn.addEventListener('click', (e) => {
      e.preventDefault();
      showModal(profileModal);
      loadProfileData();
    });
  }
  
  // Modal close buttons
  document.querySelectorAll('.modal-close, .modal-backdrop').forEach(element => {
    element.addEventListener('click', (e) => {
      if (e.target === element) {
        hideAllModals();
      }
    });
  });
  
  // Close dropdowns when clicking outside
  document.addEventListener('click', () => {
    document.querySelectorAll('.dropdown-menu').forEach(menu => {
      menu.classList.remove('show');
    });
  });
  
  // Initialize contact search
  if (contactSearch) {
    initializeContactSearch();
  }
}

// Load profile data into modal
async function loadProfileData() {
  try {
    const profileEmail = document.getElementById('profile-email');
    const profileSubscriptionStatus = document.getElementById('profile-subscription-status');
    const subscriptionInfo = document.getElementById('subscription-info');
    
    if (profileEmail && currentUser) {
      profileEmail.textContent = currentUser.email;
    }
    
    if (profileSubscriptionStatus) {
      profileSubscriptionStatus.innerHTML = isPro 
        ? '<span class="subscription-badge pro"><span class="badge-text">PRO</span></span>'
        : '<span class="subscription-badge free"><span class="badge-text">FREE</span></span>';
    }
    
    if (subscriptionInfo) {
      if (isPro) {
        subscriptionInfo.innerHTML = `
          <div class="subscription-item">
            <strong>Status:</strong> Active Pro Subscription
          </div>
          <div class="subscription-item">
            <strong>Plan:</strong> Monthly Pro Plan
          </div>
          <div class="subscription-item">
            <strong>Benefits:</strong> Unlimited exports, All formats, Priority support
          </div>
        `;
      } else {
        subscriptionInfo.innerHTML = `
          <div class="subscription-item">
            <strong>Status:</strong> Free Plan
          </div>
          <div class="subscription-item">
            <strong>Limitations:</strong> Limited exports per month
          </div>
          <div class="subscription-item">
            <strong>Upgrade:</strong> Get unlimited access with Pro
          </div>
        `;
      }
    }
    
    // Update usage stats (you can expand this with real data)
    const totalExports = document.getElementById('total-exports');
    const thisMonthExports = document.getElementById('this-month-exports');
    const totalConversations = document.getElementById('total-conversations');
    
    if (totalExports) totalExports.textContent = '0';
    if (thisMonthExports) thisMonthExports.textContent = '0';
    if (totalConversations) totalConversations.textContent = contacts.length.toString();
    
  } catch (error) {
    console.error('Error loading profile data:', error);
  }
}

// Firebase auth state observer
function initializeAuthStateObserver() {
  console.log('Setting up Firebase auth state observer...');
  
  firebase.auth().onAuthStateChanged(async (user) => {
    console.log('Auth state changed:', user ? user.email : 'No user');
    
    if (user) {
      currentUser = user;
      
      // Verify payment status
      try {
        const paymentStatus = await verifyUserPaymentStatus(user.email);
        isPro = paymentStatus.isPro;
        
        console.log('User authenticated, payment status:', paymentStatus);
        
        // Store in chrome storage
        await new Promise((resolve) => {
          chrome.storage.local.set({ 
            userEmail: user.email,
            subscriptionStatus: paymentStatus.subscriptionStatus,
            isPro: isPro
          }, resolve);
        });
        
        isAuthenticated = true;
        await updateUserInterface();
        
        // Small delay before refreshing subscription status
        setTimeout(() => {
          refreshSubscriptionStatus();
        }, 1000);
        
      } catch (error) {
        console.error('Error checking payment status:', error);
        isPro = false;
        isAuthenticated = true;
        await updateUserInterface();
      }
      
    } else {
      console.log('No user authenticated');
      currentUser = null;
      isPro = false;
      isAuthenticated = false;
      await updateUserInterface();
    }
  });
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', async () => {
  console.log('DOM loaded, initializing popup...');
  
  try {
    // Initialize authentication forms
    initializeAuthForms();
    
    // Initialize main app listeners
    initializeMainAppListeners();
    
    // Set up Firebase auth state observer
    initializeAuthStateObserver();
    
    // Ensure user session
    await ensureUserSession();
    
    console.log('Popup initialization complete');
    
  } catch (error) {
    console.error('Error initializing popup:', error);
    showStatus('Error initializing application', 'error');
  }
});

// Listen for messages from other parts of the extension
chrome.runtime.onMessage?.addListener((request, sender, sendResponse) => {
  console.log('Received message:', request);
  
  if (request.action === 'subscriptionUpdated') {
    console.log('Subscription updated, refreshing status...');
    refreshSubscriptionStatus();
  } else if (request.action === 'userLoggedIn') {
    console.log('User logged in from another part of extension');
    ensureUserSession();
  }
  
  sendResponse({ success: true });
});

// Export functions for testing or external access
window.fiverrExtractor = {
  loginUser,
  signupUser,
  logoutUser,
  refreshSubscriptionStatus,
  verifyUserPaymentStatus,
  fetchContacts,
  ensureUserSession
};
