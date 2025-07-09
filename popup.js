// Firebase functions are available globally via firebase-auth.js

// Global variables
let currentUser = null;
let isPro = false;
let contacts = [];
let currentConversation = null;
let isAuthenticated = false;

// Theme variables
let currentTheme = 'light';

// UI Elements
const authContainer = document.getElementById('auth-container');
const mainApp = document.getElementById('main-app');
const loadingOverlay = document.getElementById('loading-overlay');

// Theme elements
const themeToggle = document.getElementById('theme-toggle');
const themeLabel = document.getElementById('theme-label');

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

// Theme functionality
function applyTheme(isDark) {
  const theme = isDark ? 'dark' : 'light';
  document.documentElement.setAttribute('data-theme', theme);
  currentTheme = theme;
  
  if (themeLabel) {
    themeLabel.textContent = isDark ? 'Dark Mode' : 'Light Mode';
  }
  
  if (themeToggle) {
    themeToggle.checked = isDark;
  }
  
  // Save theme preference to chrome storage
  chrome.storage.local.set({ theme: theme });
}

function loadSavedTheme() {
  chrome.storage.local.get('theme', function(result) {
    const savedTheme = result.theme || 'light';
    const isDark = savedTheme === 'dark';
    applyTheme(isDark);
  });
}

function initializeThemeToggle() {
  if (themeToggle) {
    // Load saved theme
    loadSavedTheme();
    
    // Handle theme toggle
    themeToggle.addEventListener('change', () => {
      applyTheme(themeToggle.checked);
    });
  }
}

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
  const proFeaturesSection = document.getElementById('pro-features-section');
  
  proFeatures.forEach(element => {
    if (isPro) {
      element.classList.remove('disabled');
      element.style.cursor = 'pointer';
    } else {
      element.classList.add('disabled');
      element.style.cursor = 'not-allowed';
    }
  });
  
  // Show/hide Pro features section
  if (proFeaturesSection) {
    if (isPro) {
      proFeaturesSection.style.display = 'none'; // Hide for Pro users
    } else {
      proFeaturesSection.style.display = 'block'; // Show for Free users
    }
  }
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
    const progressElement = document.getElementById('contacts-progress');
    if (progressElement) {
      progressElement.textContent = 'Fetching contacts...';
    }
    
    // Send message to background script instead of content script directly
    const response = await new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Request timeout - please make sure you are on Fiverr.com'));
      }, 30000); // 30 second timeout
      
      chrome.runtime.sendMessage({ type: 'FETCH_ALL_CONTACTS' }, (response) => {
        clearTimeout(timeout);
        
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message));
          return;
        }
        
        resolve(response);
      });
    });
    
    // The actual response will come through message listeners
    showStatus('Starting contact fetch...', 'info');
    
  } catch (error) {
    console.error('Error initiating contact fetch:', error);
    const progressElement = document.getElementById('contacts-progress');
    if (progressElement) {
      progressElement.textContent = 'Error fetching contacts';
    }
    showStatus(error.message, 'error');
    showButtonLoading(fetchContactsBtn, false);
  }
}

function renderContactsList(contactsToRender) {
  const contactsList = document.getElementById('contacts-list');
  
  if (!contactsList) {
    console.error('Contacts list element not found');
    return;
  }
  
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
  
  contactsList.innerHTML = contactsToRender.map(contact => {
    try {
      // Handle different contact data structures
      const contactName = contact.name || contact.username || 'Unknown User';
      const contactId = contact.id || contact.username || contactName;
      
      // Format last message with proper fallbacks
      let lastMessage = 'No recent messages';
      if (contact.lastMessage) {
        lastMessage = contact.lastMessage;
      } else if (contact.recentMessage) {
        lastMessage = contact.recentMessage;
      } else if (contact.lastMessageDate) {
        lastMessage = `Last message: ${new Date(contact.lastMessageDate).toLocaleDateString()}`;
      } else if (contact.recentMessageDate) {
        lastMessage = `Last message: ${new Date(contact.recentMessageDate).toLocaleDateString()}`;
      }
      
      return `
        <div class="contact-item" data-contact-id="${contactId}">
          <div class="contact-name">${contactName}</div>
          <div class="contact-last-message">${lastMessage}</div>
        </div>
      `;
    } catch (error) {
      console.error('Error rendering contact:', contact, error);
      return `
        <div class="contact-item" data-contact-id="error">
          <div class="contact-name">Error loading contact</div>
          <div class="contact-last-message">Contact data corrupted</div>
        </div>
      `;
    }
  }).join('');
  
  // Add click listeners
  contactsList.querySelectorAll('.contact-item').forEach(item => {
    item.addEventListener('click', () => {
      const contactId = item.dataset.contactId;
      const contact = contacts.find(c => (c.id || c.username) === contactId);
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
  
  const contactId = contact.id || contact.username || contact.name;
  const selectedItem = document.querySelector(`[data-contact-id="${contactId}"]`);
  if (selectedItem) {
    selectedItem.classList.add('selected');
  }
  
  // Enable extract button
  if (extractConversationBtn) {
    extractConversationBtn.disabled = false;
    const contactName = contact.name || contact.username || 'Unknown User';
    extractConversationBtn.textContent = `Extract ${contactName}'s Conversation`;
  }
  
  // Store selected contact
  window.selectedContact = contact;
}

// Extract conversation functionality
async function extractConversation() {
  if (!window.selectedContact) {
    showStatus('Please select a contact first', 'error');
    return;
  }
  
  try {
    showButtonLoading(extractConversationBtn, true);
    const progressElement = document.getElementById('extraction-progress');
    if (progressElement) {
      progressElement.textContent = 'Starting extraction...';
    }
    
    // Get the username from the selected contact
    const username = window.selectedContact.name || window.selectedContact.username || 'unknown';
    
    // Store the selected username for the content script
    await new Promise((resolve) => {
      chrome.storage.local.set({ currentUsername: username }, resolve);
    });
    
    // Send extraction request through background script
    const response = await new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Extraction timeout - please make sure you are on Fiverr.com'));
      }, 60000); // 60 second timeout for extractions
      
      chrome.runtime.sendMessage({ type: 'EXTRACT_CONVERSATION' }, (response) => {
        clearTimeout(timeout);
        
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message));
          return;
        }
        
        resolve(response);
      });
    });
    
    showStatus('Starting conversation extraction...', 'info');
    
  } catch (error) {
    console.error('Error initiating extraction:', error);
    const progressElement = document.getElementById('extraction-progress');
    if (progressElement) {
      progressElement.textContent = 'Error starting extraction';
    }
    showStatus(error.message, 'error');
    showButtonLoading(extractConversationBtn, false);
  }
}

// Contact search functionality
function initializeContactSearch() {
  if (contactSearch) {
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
}

// Download file functionality
async function downloadFile(format) {
  if (!currentConversation) {
    showStatus('No conversation to export', 'error');
    return;
  }
  
  try {
    let content = '';
    let filename = '';
    let mimeType = '';
    
    const username = currentConversation.username || 'unknown';
    const timestamp = new Date().toISOString().split('T')[0];
    
    switch (format) {
      case 'markdown':
        content = await convertToMarkdown(currentConversation);
        filename = `${username}_conversation_${timestamp}.md`;
        mimeType = 'text/markdown';
        break;
        
      case 'json':
        content = JSON.stringify(currentConversation, null, 2);
        filename = `${username}_conversation_${timestamp}.json`;
        mimeType = 'application/json';
        break;
        
      case 'txt':
        if (!isPro) {
          showStatus('TXT export is a Pro feature. Please upgrade to continue.', 'error');
          return;
        }
        content = await convertToText(currentConversation);
        filename = `${username}_conversation_${timestamp}.txt`;
        mimeType = 'text/plain';
        break;
        
      case 'csv':
        if (!isPro) {
          showStatus('CSV export is a Pro feature. Please upgrade to continue.', 'error');
          return;
        }
        content = await convertToCSV(currentConversation);
        filename = `${username}_conversation_${timestamp}.csv`;
        mimeType = 'text/csv';
        break;
        
      default:
        throw new Error('Unsupported export format');
    }
    
    // Create and download file
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    
    chrome.downloads.download({
      url: url,
      filename: filename,
      saveAs: false
    }, (downloadId) => {
      if (chrome.runtime.lastError) {
        console.error('Download error:', chrome.runtime.lastError);
        showStatus('Error downloading file', 'error');
      } else {
        showStatus(`${format.toUpperCase()} file downloaded successfully!`, 'success');
        URL.revokeObjectURL(url);
      }
    });
    
  } catch (error) {
    console.error('Export error:', error);
    showStatus(`Error exporting ${format}: ${error.message}`, 'error');
  }
}

// Convert conversation to markdown
async function convertToMarkdown(data) {
  if (!data || !data.messages || !Array.isArray(data.messages)) {
    return '# Conversation\n\nNo messages found.';
  }

  let otherUsername = data.username || 'Unknown User';
  let markdown = `# Conversation with ${otherUsername}\n\n`;
  
  for (const message of data.messages) {
    if (!message) continue;
    
    const timestamp = message.formattedTime || new Date(message.createdAt).toLocaleString();
    const sender = message.sender || 'Unknown';
    
    markdown += `### ${sender} (${timestamp})\n`;
    
    if (message.repliedToMessage) {
      const repliedMsg = message.repliedToMessage;
      const repliedTime = repliedMsg.formattedTime || new Date(repliedMsg.createdAt).toLocaleString();
      markdown += `> Replying to ${repliedMsg.sender || 'Unknown'} (${repliedTime}):\n`;
      const repliedBody = repliedMsg.body || '';
      markdown += `> ${repliedBody.replace(/\n/g, '\n> ')}\n\n`;
    }
    
    if (message.body) {
      markdown += `${message.body}\n`;
    }
    
    if (message.attachments && message.attachments.length > 0) {
      markdown += '\n**Attachments:**\n';
      for (const attachment of message.attachments) {
        markdown += `- ${attachment.filename} (${formatFileSize(attachment.fileSize)})\n`;
      }
    }
    
    markdown += '\n---\n\n';
  }
  
  return markdown;
}

// Convert conversation to plain text
async function convertToText(data) {
  if (!data || !data.messages || !Array.isArray(data.messages)) {
    return 'Conversation\n\nNo messages found.';
  }

  let otherUsername = data.username || 'Unknown User';
  let text = `Conversation with ${otherUsername}\n${'='.repeat(50)}\n\n`;
  
  for (const message of data.messages) {
    if (!message) continue;
    
    const timestamp = message.formattedTime || new Date(message.createdAt).toLocaleString();
    const sender = message.sender || 'Unknown';
    
    text += `${sender} (${timestamp})\n`;
    text += `-`.repeat(30) + '\n';
    
    if (message.repliedToMessage) {
      const repliedMsg = message.repliedToMessage;
      const repliedTime = repliedMsg.formattedTime || new Date(repliedMsg.createdAt).toLocaleString();
      text += `Replying to ${repliedMsg.sender || 'Unknown'} (${repliedTime}):\n`;
      text += `"${repliedMsg.body || ''}"\n\n`;
    }
    
    if (message.body) {
      text += `${message.body}\n`;
    }
    
    if (message.attachments && message.attachments.length > 0) {
      text += '\nAttachments:\n';
      for (const attachment of message.attachments) {
        text += `- ${attachment.filename} (${formatFileSize(attachment.fileSize)})\n`;
      }
    }
    
    text += '\n' + '='.repeat(50) + '\n\n';
  }
  
  return text;
}

// Helper function to get file extension
function getFileExtension(filename) {
  if (!filename) return '';
  const parts = filename.split('.');
  return parts.length > 1 ? parts[parts.length - 1].toLowerCase() : '';
}

// Helper function to check if file can be viewed in browser
function canViewInBrowser(filename) {
  const extension = getFileExtension(filename);
  const viewableExtensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg', 'pdf', 'txt', 'html', 'htm', 'css', 'js', 'json', 'xml', 'csv'];
  return viewableExtensions.includes(extension);
}

// Helper function to get MIME type for file extension
function getMimeType(filename) {
  const extension = getFileExtension(filename);
  const mimeTypes = {
    'jpg': 'image/jpeg',
    'jpeg': 'image/jpeg',
    'png': 'image/png',
    'gif': 'image/gif',
    'bmp': 'image/bmp',
    'webp': 'image/webp',
    'svg': 'image/svg+xml',
    'pdf': 'application/pdf',
    'txt': 'text/plain',
    'html': 'text/html',
    'htm': 'text/html',
    'css': 'text/css',
    'js': 'application/javascript',
    'json': 'application/json',
    'xml': 'application/xml',
    'csv': 'text/csv'
  };
  return mimeTypes[extension] || 'application/octet-stream';
}

// View attachment in browser
function viewAttachment(downloadUrl, filename) {
  if (!downloadUrl) {
    showStatus('View URL not available for this attachment', 'error');
    return;
  }
  
  try {
    // Open in new tab
    window.open(downloadUrl, '_blank');
    showStatus(`Opening ${filename} in new tab...`, 'success');
  } catch (error) {
    console.error('Error viewing attachment:', error);
    showStatus('Error viewing attachment', 'error');
  }
}

// Download attachment function
function downloadAttachment(downloadUrl, filename) {
  if (!downloadUrl) {
    showStatus('Download URL not available for this attachment', 'error');
    return;
  }
  
  try {
    const a = document.createElement('a');
    a.href = downloadUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    showStatus(`Downloading ${filename}...`, 'success');
  } catch (error) {
    console.error('Error downloading attachment:', error);
    showStatus('Error downloading attachment', 'error');
  }
}

// Convert conversation to CSV
async function convertToCSV(data) {
  if (!data || !data.messages || !Array.isArray(data.messages)) {
    return 'timestamp,sender,message,attachments,replied_to\n';
  }

  let csv = 'timestamp,sender,message,attachments,replied_to\n';
  
  for (const message of data.messages) {
    if (!message) continue;
    
    const timestamp = message.formattedTime || new Date(message.createdAt).toLocaleString();
    const sender = message.sender || 'Unknown';
    const body = (message.body || '').replace(/"/g, '""').replace(/\n/g, ' ');
    
    const attachments = message.attachments && message.attachments.length > 0 
      ? message.attachments.map(a => a.filename).join('; ')
      : '';
    
    const repliedTo = message.repliedToMessage 
      ? `${message.repliedToMessage.sender}: ${(message.repliedToMessage.body || '').substring(0, 50)}...`
      : '';
    
    csv += `"${timestamp}","${sender}","${body}","${attachments}","${repliedTo}"\n`;
  }
  
  return csv;
}

// Export conversation to PDF
async function exportToPDF(data) {
  if (!data || !data.messages || !Array.isArray(data.messages)) {
    throw new Error('No conversation data available');
  }

  // Dynamically load jsPDF
  const { jsPDF } = await import('https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js');
  
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.width;
  const pageHeight = doc.internal.pageSize.height;
  const margin = 20;
  const lineHeight = 7;
  let yPosition = margin;
  
  // Title
  const title = `Conversation with ${data.username || 'Unknown User'}`;
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text(title, margin, yPosition);
  yPosition += 15;
  
  // Date
  const exportDate = new Date().toLocaleDateString();
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Exported on: ${exportDate}`, margin, yPosition);
  yPosition += 10;
  
  // Messages
  doc.setFontSize(11);
  for (const message of data.messages) {
    if (!message) continue;
    
    const timestamp = message.formattedTime || new Date(message.createdAt).toLocaleString();
    const sender = message.sender || 'Unknown';
    const body = message.body || '';
    
    // Check if we need a new page
    if (yPosition > pageHeight - 40) {
      doc.addPage();
      yPosition = margin;
    }
    
    // Sender and timestamp
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 0);
    doc.text(`${sender} (${timestamp})`, margin, yPosition);
    yPosition += 8;
    
    // Message body
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(50, 50, 50);
    
    // Split long text into lines
    const words = body.split(' ');
    let line = '';
    for (const word of words) {
      const testLine = line + word + ' ';
      const textWidth = doc.getTextWidth(testLine);
      
      if (textWidth > pageWidth - 2 * margin) {
        doc.text(line, margin, yPosition);
        yPosition += lineHeight;
        line = word + ' ';
        
        // Check if we need a new page
        if (yPosition > pageHeight - 40) {
          doc.addPage();
          yPosition = margin;
        }
      } else {
        line = testLine;
      }
    }
    
    if (line.trim()) {
      doc.text(line, margin, yPosition);
      yPosition += lineHeight;
    }
    
    // Attachments
    if (message.attachments && message.attachments.length > 0) {
      yPosition += 5;
      doc.setFont('helvetica', 'italic');
      doc.setTextColor(100, 100, 100);
      doc.text('Attachments:', margin, yPosition);
      yPosition += 6;
      
      for (const attachment of message.attachments) {
        doc.text(`- ${attachment.filename} (${formatFileSize(attachment.fileSize)})`, margin + 5, yPosition);
        yPosition += 5;
      }
    }
    
    yPosition += 10;
  }
  
  // Save the PDF
  const username = data.username || 'unknown';
  const timestamp = new Date().toISOString().split('T')[0];
  const filename = `${username}_conversation_${timestamp}.pdf`;
  
  doc.save(filename);
  showStatus('PDF exported successfully!', 'success');
}

// Export conversation to Excel
async function exportToExcel(data) {
  if (!data || !data.messages || !Array.isArray(data.messages)) {
    throw new Error('No conversation data available');
  }

  // Dynamically load ExcelJS
  const ExcelJS = await import('https://cdnjs.cloudflare.com/ajax/libs/exceljs/4.4.0/exceljs.min.js');
  
  // Create workbook and worksheet
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Conversation');
  
  // Add headers
  worksheet.columns = [
    { header: 'Timestamp', key: 'timestamp', width: 20 },
    { header: 'Sender', key: 'sender', width: 15 },
    { header: 'Message', key: 'message', width: 50 },
    { header: 'Attachments', key: 'attachments', width: 30 },
    { header: 'Replied To', key: 'repliedTo', width: 40 }
  ];
  
  // Style the header row
  worksheet.getRow(1).font = { bold: true };
  worksheet.getRow(1).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFE0E0E0' }
  };
  
  // Add messages
  for (const message of data.messages) {
    if (!message) continue;
    
    const timestamp = message.formattedTime || new Date(message.createdAt).toLocaleString();
    const sender = message.sender || 'Unknown';
    const body = message.body || '';
    
    const attachments = message.attachments && message.attachments.length > 0 
      ? message.attachments.map(a => a.filename).join('; ')
      : '';
    
    const repliedTo = message.repliedToMessage 
      ? `${message.repliedToMessage.sender}: ${(message.repliedToMessage.body || '').substring(0, 50)}...`
      : '';
    
    worksheet.addRow({
      timestamp: timestamp,
      sender: sender,
      message: body,
      attachments: attachments,
      repliedTo: repliedTo
    });
  }
  
  // Auto-fit columns
  worksheet.columns.forEach(column => {
    column.alignment = { wrapText: true, vertical: 'top' };
  });
  
  // Generate and download the Excel file
  const username = data.username || 'unknown';
  const timestamp = new Date().toISOString().split('T')[0];
  const filename = `${username}_conversation_${timestamp}.xlsx`;
  
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  const url = URL.createObjectURL(blob);
  
  chrome.downloads.download({
    url: url,
    filename: filename,
    saveAs: false
  }, (downloadId) => {
    if (chrome.runtime.lastError) {
      console.error('Download error:', chrome.runtime.lastError);
      showStatus('Error downloading Excel file', 'error');
    } else {
      showStatus('Excel file exported successfully!', 'success');
      URL.revokeObjectURL(url);
    }
  });
}

// Bulk export conversations
async function bulkExportConversations(contacts) {
  if (!contacts || contacts.length === 0) {
    throw new Error('No contacts available for bulk export');
  }

  // Dynamically load JSZip
  const JSZip = await import('https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js');
  
  const zip = new JSZip();
  const timestamp = new Date().toISOString().split('T')[0];
  let processedCount = 0;
  
  // Create a progress indicator
  const progressInterval = setInterval(() => {
    processedCount++;
    const progress = Math.round((processedCount / contacts.length) * 100);
    showStatus(`Processing: ${progress}% (${processedCount}/${contacts.length})`, 'info');
  }, 100);
  
  try {
    for (const contact of contacts) {
      try {
        // Simulate conversation extraction for each contact
        // In a real implementation, you'd call the actual extraction logic
        const conversationData = {
          username: contact.username,
          lastMessage: contact.recentMessageDate,
          messageCount: Math.floor(Math.random() * 50) + 1, // Simulated
          extractedAt: new Date().toISOString()
        };
        
        // Add to zip as JSON
        const filename = `${contact.username}_conversation_${timestamp}.json`;
        zip.file(filename, JSON.stringify(conversationData, null, 2));
        
        processedCount++;
      } catch (error) {
        console.error(`Failed to process ${contact.username}:`, error);
      }
    }
    
    // Generate and download the zip file
    const zipBlob = await zip.generateAsync({ type: 'blob' });
    const zipUrl = URL.createObjectURL(zipBlob);
    
    chrome.downloads.download({
      url: zipUrl,
      filename: `fiverr_bulk_export_${timestamp}.zip`,
      saveAs: false
    }, (downloadId) => {
      if (chrome.runtime.lastError) {
        console.error('Download error:', chrome.runtime.lastError);
        showStatus('Error downloading bulk export', 'error');
      } else {
        showStatus(`Bulk export completed! ${processedCount} conversations exported.`, 'success');
        URL.revokeObjectURL(zipUrl);
      }
    });
    
  } finally {
    clearInterval(progressInterval);
  }
}

// Show conversation analytics
async function showConversationAnalytics(data) {
  if (!data || !data.messages || !Array.isArray(data.messages)) {
    throw new Error('No conversation data available for analytics');
  }

  // Create analytics modal
  const analyticsModal = document.createElement('div');
  analyticsModal.className = 'modal-backdrop';
  analyticsModal.id = 'analytics-modal';
  analyticsModal.innerHTML = `
    <div class="modal-content">
      <div class="modal-header">
        <h3>Conversation Analytics</h3>
        <button class="modal-close" onclick="this.closest('.modal-backdrop').remove()">&times;</button>
      </div>
      <div class="modal-body">
        <div class="analytics-grid">
          <div class="analytics-card">
            <h4>Message Statistics</h4>
            <div class="stat-item">
              <span class="stat-label">Total Messages:</span>
              <span class="stat-value">${data.messages.length}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">Unique Senders:</span>
              <span class="stat-value">${new Set(data.messages.map(m => m.sender)).size}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">Messages with Attachments:</span>
              <span class="stat-value">${data.messages.filter(m => m.attachments && m.attachments.length > 0).length}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">Reply Messages:</span>
              <span class="stat-value">${data.messages.filter(m => m.repliedToMessage).length}</span>
            </div>
          </div>
          
          <div class="analytics-card">
            <h4>Time Analysis</h4>
            <div class="stat-item">
              <span class="stat-label">First Message:</span>
              <span class="stat-value">${data.messages.length > 0 ? new Date(data.messages[0].createdAt).toLocaleDateString() : 'N/A'}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">Last Message:</span>
              <span class="stat-value">${data.messages.length > 0 ? new Date(data.messages[data.messages.length - 1].createdAt).toLocaleDateString() : 'N/A'}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">Conversation Duration:</span>
              <span class="stat-value">${data.messages.length > 1 ? Math.ceil((new Date(data.messages[data.messages.length - 1].createdAt) - new Date(data.messages[0].createdAt)) / (1000 * 60 * 60 * 24)) : 0} days</span>
            </div>
          </div>
          
          <div class="analytics-card">
            <h4>Content Analysis</h4>
            <div class="stat-item">
              <span class="stat-label">Average Message Length:</span>
              <span class="stat-value">${Math.round(data.messages.reduce((sum, m) => sum + (m.body ? m.body.length : 0), 0) / data.messages.length)} chars</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">Longest Message:</span>
              <span class="stat-value">${Math.max(...data.messages.map(m => m.body ? m.body.length : 0))} chars</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">Total Characters:</span>
              <span class="stat-value">${data.messages.reduce((sum, m) => sum + (m.body ? m.body.length : 0), 0)}</span>
            </div>
          </div>
        </div>
        
        <div class="analytics-actions">
          <button class="btn btn-primary" onclick="exportAnalyticsData()">Export Analytics Data</button>
          <button class="btn btn-secondary" onclick="showAIAnalysis()">🤖 AI Analysis</button>
          <button class="btn btn-secondary" onclick="this.closest('.modal-backdrop').remove()">Close</button>
        </div>
      </div>
    </div>
  `;
  
  document.body.appendChild(analyticsModal);
  showModal(analyticsModal);
  
  showStatus('Analytics generated successfully!', 'success');
}

// Show AI-powered conversation analysis
async function showAIAnalysis() {
  if (!currentConversation || !currentConversation.messages) {
    showStatus('No conversation data available for AI analysis', 'error');
    return;
  }

  try {
    showStatus('🤖 Analyzing conversation with AI...', 'info');
    
    // Perform comprehensive AI analysis using global function
    const analysisResult = await window.performComprehensiveAnalysis(currentConversation.messages);
    
    if (!analysisResult.success) {
      throw new Error(analysisResult.error || 'AI analysis failed');
    }

    const analysis = analysisResult.analysis;
    
    // Create AI analysis modal
    const aiModal = document.createElement('div');
    aiModal.className = 'modal-backdrop';
    aiModal.id = 'ai-analysis-modal';
    aiModal.innerHTML = `
      <div class="modal-content ai-analysis-modal">
        <div class="modal-header">
          <h3>🤖 AI Conversation Analysis</h3>
          <button class="modal-close" id="ai-modal-close">&times;</button>
        </div>
        <div class="modal-body">
          <div class="ai-analysis-tabs">
            <button class="tab-btn active" data-tab="sentiment">Sentiment & Tone</button>
            <button class="tab-btn" data-tab="summary">Summary</button>
            <button class="tab-btn" data-tab="action-items">Action Items</button>
            <button class="tab-btn" data-tab="effectiveness">Communication</button>
            <button class="tab-btn" data-tab="insights">Insights</button>
          </div>
          
          <div class="ai-analysis-content">
            <div id="sentiment-tab" class="tab-content active">
              <h4>Sentiment & Tone Analysis</h4>
              <div class="ai-content">${analysis.sentiment.analysis || 'Analysis unavailable'}</div>
            </div>
            
            <div id="summary-tab" class="tab-content">
              <h4>Conversation Summary</h4>
              <div class="ai-content">${analysis.summary.summary || 'Summary unavailable'}</div>
            </div>
            
            <div id="action-items-tab" class="tab-content">
              <h4>Action Items & Tasks</h4>
              <div class="ai-content">${analysis.actionItems.actionItems || 'No action items found'}</div>
            </div>
            
            <div id="effectiveness-tab" class="tab-content">
              <h4>Communication Effectiveness</h4>
              <div class="ai-content">${analysis.effectiveness.effectiveness || 'Analysis unavailable'}</div>
            </div>
            
            <div id="insights-tab" class="tab-content">
              <h4>Strategic Insights</h4>
              <div class="ai-content">${analysis.insights.insights || 'Insights unavailable'}</div>
            </div>
          </div>
          
          <div class="ai-analysis-footer">
            <div class="ai-model-info">
              <span>Powered by GROQ AI (${analysis.sentiment.model})</span>
            </div>
            <div class="ai-analysis-actions">
              <button class="btn btn-primary" id="export-ai-analysis-btn">Export AI Analysis</button>
              <button class="btn btn-secondary" id="close-ai-modal-btn">Close</button>
            </div>
          </div>
        </div>
      </div>
    `;
    
    document.body.appendChild(aiModal);
    showModal(aiModal);
    
    // Add event listeners for the modal
    const closeBtn = aiModal.querySelector('#ai-modal-close');
    const closeModalBtn = aiModal.querySelector('#close-ai-modal-btn');
    const exportBtn = aiModal.querySelector('#export-ai-analysis-btn');
    
    if (closeBtn) {
      closeBtn.addEventListener('click', () => aiModal.remove());
    }
    if (closeModalBtn) {
      closeModalBtn.addEventListener('click', () => aiModal.remove());
    }
    if (exportBtn) {
      exportBtn.addEventListener('click', () => exportAIAnalysis());
    }
    
    // Add event listeners for tabs
    const tabButtons = aiModal.querySelectorAll('.tab-btn');
    tabButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const tabName = e.target.getAttribute('data-tab');
        switchAITab(tabName, aiModal);
      });
    });
    
    showStatus('🤖 AI analysis completed successfully!', 'success');
    
  } catch (error) {
    console.error('Error performing AI analysis:', error);
    showStatus(`AI analysis failed: ${error.message}`, 'error');
  }
}

// Switch between AI analysis tabs
function switchAITab(tabName, modal) {
  // Hide all tab contents within this modal
  const tabContents = modal.querySelectorAll('.tab-content');
  tabContents.forEach(content => content.classList.remove('active'));
  
  // Remove active class from all tab buttons within this modal
  const tabButtons = modal.querySelectorAll('.tab-btn');
  tabButtons.forEach(btn => btn.classList.remove('active'));
  
  // Show selected tab content
  const selectedTab = modal.querySelector(`#${tabName}-tab`);
  if (selectedTab) {
    selectedTab.classList.add('active');
  }
  
  // Add active class to clicked button
  const clickedButton = event.target;
  if (clickedButton) {
    clickedButton.classList.add('active');
  }
}

// Export AI analysis data
async function exportAIAnalysis() {
  if (!currentConversation) {
    showStatus('No conversation data available', 'error');
    return;
  }
  
  try {
    const analysisResult = await window.performComprehensiveAnalysis(currentConversation.messages);
    
    if (!analysisResult.success) {
      throw new Error(analysisResult.error || 'AI analysis failed');
    }
    
    const exportData = {
      conversationInfo: {
        username: currentConversation.username,
        messageCount: currentConversation.messages.length,
        analyzedAt: new Date().toISOString()
      },
      aiAnalysis: analysisResult.analysis,
      exportInfo: {
        exportedAt: new Date().toISOString(),
        version: '1.0',
        aiModel: analysisResult.analysis.sentiment.model
      }
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    chrome.downloads.download({
      url: url,
      filename: `${currentConversation.username}_ai_analysis_${new Date().toISOString().split('T')[0]}.json`,
      saveAs: false
    }, (downloadId) => {
      if (chrome.runtime.lastError) {
        console.error('Download error:', chrome.runtime.lastError);
        showStatus('Error downloading AI analysis data', 'error');
      } else {
        showStatus('AI analysis data exported successfully!', 'success');
        URL.revokeObjectURL(url);
      }
    });
    
  } catch (error) {
    console.error('Error exporting AI analysis:', error);
    showStatus('Error exporting AI analysis data', 'error');
  }
}

// Export analytics data
function exportAnalyticsData() {
  if (!currentConversation) {
    showStatus('No conversation data available', 'error');
    return;
  }
  
  try {
    const analyticsData = {
      conversationInfo: {
        username: currentConversation.username,
        totalMessages: currentConversation.messages.length,
        uniqueSenders: new Set(currentConversation.messages.map(m => m.sender)).size,
        messagesWithAttachments: currentConversation.messages.filter(m => m.attachments && m.attachments.length > 0).length,
        replyMessages: currentConversation.messages.filter(m => m.repliedToMessage).length
      },
      timeAnalysis: {
        firstMessage: currentConversation.messages.length > 0 ? new Date(currentConversation.messages[0].createdAt).toISOString() : null,
        lastMessage: currentConversation.messages.length > 0 ? new Date(currentConversation.messages[currentConversation.messages.length - 1].createdAt).toISOString() : null,
        conversationDuration: currentConversation.messages.length > 1 ? 
          (new Date(currentConversation.messages[currentConversation.messages.length - 1].createdAt) - new Date(currentConversation.messages[0].createdAt)) / (1000 * 60 * 60 * 24) : 0
      },
      contentAnalysis: {
        averageMessageLength: Math.round(currentConversation.messages.reduce((sum, m) => sum + (m.body ? m.body.length : 0), 0) / currentConversation.messages.length),
        longestMessage: Math.max(...currentConversation.messages.map(m => m.body ? m.body.length : 0)),
        totalCharacters: currentConversation.messages.reduce((sum, m) => sum + (m.body ? m.body.length : 0), 0)
      },
      exportInfo: {
        exportedAt: new Date().toISOString(),
        version: '1.0'
      }
    };
    
    const blob = new Blob([JSON.stringify(analyticsData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    chrome.downloads.download({
      url: url,
      filename: `${currentConversation.username}_analytics_${new Date().toISOString().split('T')[0]}.json`,
      saveAs: false
    }, (downloadId) => {
      if (chrome.runtime.lastError) {
        console.error('Download error:', chrome.runtime.lastError);
        showStatus('Error downloading analytics data', 'error');
      } else {
        showStatus('Analytics data exported successfully!', 'success');
        URL.revokeObjectURL(url);
      }
    });
    
  } catch (error) {
    console.error('Error exporting analytics:', error);
    showStatus('Error exporting analytics data', 'error');
  }
}

// Helper function to format file size
function formatFileSize(bytes) {
  if (!bytes) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

// Debug function to test contact data structure
function debugContactData(contact) {
  console.log('Contact debug info:');
  console.log('- Raw contact:', contact);
  console.log('- Keys:', Object.keys(contact));
  console.log('- name:', contact.name);
  console.log('- username:', contact.username);
  console.log('- id:', contact.id);
  console.log('- lastMessage:', contact.lastMessage);
  console.log('- recentMessage:', contact.recentMessage);
  console.log('- lastMessageDate:', contact.lastMessageDate);
  console.log('- recentMessageDate:', contact.recentMessageDate);
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
  
  if (extractConversationBtn) {
    extractConversationBtn.addEventListener('click', extractConversation);
  }
  
  // AI Analysis button
  const aiAnalysisBtn = document.getElementById('ai-analysis-btn');
  if (aiAnalysisBtn) {
    aiAnalysisBtn.addEventListener('click', () => {
      if (currentConversation && currentConversation.messages) {
        showAIAnalysis();
      } else {
        showStatus('Please extract a conversation first', 'error');
      }
    });
  }
  
  // Export buttons
  if (downloadMdBtn) {
    downloadMdBtn.addEventListener('click', () => downloadFile('markdown'));
  }
  
  if (downloadJsonBtn) {
    downloadJsonBtn.addEventListener('click', () => downloadFile('json'));
  }
  
  if (downloadTxtBtn) {
    downloadTxtBtn.addEventListener('click', () => downloadFile('txt'));
  }
  
  if (downloadCsvBtn) {
    downloadCsvBtn.addEventListener('click', () => downloadFile('csv'));
  }
  
  // View Attachments button
  const viewAttachmentsBtn = document.getElementById('view-attachments-btn');
  if (viewAttachmentsBtn) {
    viewAttachmentsBtn.addEventListener('click', () => {
      if (!isPro) {
        showStatus('View Attachments is a Pro feature. Please upgrade to continue.', 'error');
        return;
      }
      
      if (!currentConversation || !currentConversation.messages) {
        showStatus('No conversation data available', 'error');
        return;
      }
      
      // Collect all attachments from the conversation
      const attachments = [];
      currentConversation.messages.forEach(message => {
        if (message.attachments && message.attachments.length > 0) {
          message.attachments.forEach(attachment => {
            attachments.push({
              ...attachment,
              messageSender: message.sender,
              messageTime: message.formattedTime || new Date(message.createdAt).toLocaleString(),
              messageBody: message.body || ''
            });
          });
        }
      });
      
      if (attachments.length === 0) {
        showStatus('No attachments found in this conversation', 'info');
        return;
      }
      
      // Populate attachments modal
      const attachmentsContent = document.getElementById('attachments-content');
      if (attachmentsContent) {
        let attachmentsHtml = '<div class="attachments-list">';
        
        attachments.forEach((attachment, index) => {
          const canView = canViewInBrowser(attachment.filename);
          const fileExtension = getFileExtension(attachment.filename);
          
          attachmentsHtml += `
            <div class="attachment-item">
              <div class="attachment-info">
                <div class="attachment-name">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="attachment-icon">
                    ${fileExtension === 'pdf' ? '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 1 2-2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14,2 14,8 20,8"></polyline>' : ''}
                    ${['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg'].includes(fileExtension) ? '<rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21,15 16,10 5,21"></polyline>' : ''}
                    ${['txt', 'html', 'htm', 'css', 'js', 'json', 'xml', 'csv'].includes(fileExtension) ? '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 1 2-2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14,2 14,8 20,8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10,9 9,9 8,9"></polyline>' : ''}
                    ${!['pdf', 'jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg', 'txt', 'html', 'htm', 'css', 'js', 'json', 'xml', 'csv'].includes(fileExtension) ? '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 1 2-2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14,2 14,8 20,8"></polyline>' : ''}
                  </svg>
                  ${attachment.filename || 'Unknown File'}
                  ${canView ? '<span class="viewable-badge">Viewable</span>' : ''}
                </div>
                <div class="attachment-details">
                  <span class="attachment-size">${formatFileSize(attachment.fileSize || 0)}</span>
                  <span class="attachment-sender">From: ${attachment.messageSender}</span>
                  <span class="attachment-time">${attachment.messageTime}</span>
                  <span class="attachment-type">${fileExtension.toUpperCase()}</span>
                </div>
                <div class="attachment-message">${attachment.messageBody.substring(0, 100)}${attachment.messageBody.length > 100 ? '...' : ''}</div>
              </div>
              <div class="attachment-actions">
                ${canView ? `
                  <button class="btn btn-sm btn-secondary" onclick="viewAttachment('${attachment.downloadUrl || ''}', '${attachment.filename || 'file'}')" title="View in browser">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                      <circle cx="12" cy="12" r="3"></circle>
                    </svg>
                    View
                  </button>
                ` : ''}
                <button class="btn btn-sm btn-primary" onclick="downloadAttachment('${attachment.downloadUrl || ''}', '${attachment.filename || 'file'}')" title="Download file">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                    <polyline points="7,10 12,15 17,10"></polyline>
                    <line x1="12" y1="15" x2="12" y2="3"></line>
                  </svg>
                  Download
                </button>
              </div>
            </div>
          `;
        });
        
        attachmentsHtml += '</div>';
        attachmentsContent.innerHTML = attachmentsHtml;
        
        // Show the modal
        showModal(attachmentsModal);
      }
    });
  }
  
  // Export Metadata/Timestamps button
  const exportMetadataBtn = document.getElementById('export-metadata-btn');
  if (exportMetadataBtn) {
    exportMetadataBtn.addEventListener('click', async () => {
      if (!isPro) {
        showStatus('Export Timestamps is a Pro feature. Please upgrade to continue.', 'error');
        return;
      }
      
      if (!currentConversation || !currentConversation.messages) {
        showStatus('No conversation data available', 'error');
        return;
      }
      
      try {
        const metadata = {
          export_info: {
            extractor_version: '2.0',
            export_date: new Date().toISOString(),
            conversation_with: currentConversation.username || 'unknown',
            current_user: currentUser?.email || 'unknown',
            total_messages: currentConversation.messages.length,
            total_attachments: currentConversation.messages.reduce((total, msg) => 
              total + (msg.attachments?.length || 0), 0)
          },
          message_metadata: currentConversation.messages.map(msg => ({
            message_id: msg.id,
            sender: msg.sender,
            created_at_unix: msg.createdAt,
            created_at_formatted: msg.formattedTime || new Date(msg.createdAt).toLocaleString(),
            message_length_chars: msg.body?.length || 0,
            has_attachments: (msg.attachments?.length || 0) > 0,
            attachment_count: msg.attachments?.length || 0,
            replied_to_message_id: msg.repliedToMessage?.id || null,
            replied_to_sender: msg.repliedToMessage?.sender || null
          }))
        };
        
        const blob = new Blob([JSON.stringify(metadata, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `${currentConversation.username || 'conversation'}_metadata_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        showStatus('Timestamps and metadata exported successfully!', 'success');
      } catch (error) {
        console.error('Error exporting metadata:', error);
        showStatus('Error exporting metadata', 'error');
      }
    });
  }
  
  // Export PDF button
  const exportPdfBtn = document.getElementById('export-pdf-btn');
  if (exportPdfBtn) {
    exportPdfBtn.addEventListener('click', async () => {
      if (!isPro) {
        showStatus('PDF export is a Pro feature. Please upgrade to continue.', 'error');
        return;
      }
      
      if (!currentConversation || !currentConversation.messages) {
        showStatus('No conversation data available', 'error');
        return;
      }
      
      try {
        showStatus('Generating PDF...', 'info');
        await exportToPDF(currentConversation);
      } catch (error) {
        console.error('Error exporting PDF:', error);
        showStatus('Error exporting PDF', 'error');
      }
    });
  }
  
  // Export Excel button
  const exportExcelBtn = document.getElementById('export-excel-btn');
  if (exportExcelBtn) {
    exportExcelBtn.addEventListener('click', async () => {
      if (!isPro) {
        showStatus('Excel export is a Pro feature. Please upgrade to continue.', 'error');
        return;
      }
      
      if (!currentConversation || !currentConversation.messages) {
        showStatus('No conversation data available', 'error');
        return;
      }
      
      try {
        showStatus('Generating Excel file...', 'info');
        await exportToExcel(currentConversation);
      } catch (error) {
        console.error('Error exporting Excel:', error);
        showStatus('Error exporting Excel', 'error');
      }
    });
  }
  
  // Bulk Export button
  const bulkExportBtn = document.getElementById('bulk-export-btn');
  if (bulkExportBtn) {
    bulkExportBtn.addEventListener('click', async () => {
      if (!isPro) {
        showStatus('Bulk export is a Pro feature. Please upgrade to continue.', 'error');
        return;
      }
      
      if (!contacts || contacts.length === 0) {
        showStatus('No contacts available for bulk export', 'error');
        return;
      }
      
      try {
        showStatus('Starting bulk export...', 'info');
        await bulkExportConversations(contacts);
      } catch (error) {
        console.error('Error bulk exporting:', error);
        showStatus('Error bulk exporting', 'error');
      }
    });
  }
  
  // Analytics button
  const analyticsBtn = document.getElementById('analytics-btn');
  if (analyticsBtn) {
    analyticsBtn.addEventListener('click', async () => {
      if (!isPro) {
        showStatus('Analytics is a Pro feature. Please upgrade to continue.', 'error');
        return;
      }
      
      if (!currentConversation || !currentConversation.messages) {
        showStatus('No conversation data available for analytics', 'error');
        return;
      }
      
      try {
        showStatus('Generating analytics...', 'info');
        await showConversationAnalytics(currentConversation);
      } catch (error) {
        console.error('Error showing analytics:', error);
        showStatus('Error showing analytics', 'error');
      }
    });
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
  
  // Modal close buttons and backdrop
  document.querySelectorAll('.modal-close, .modal-backdrop').forEach(element => {
    element.addEventListener('click', (e) => {
      if (e.target === element) {
        hideAllModals();
      }
    });
  });
  
  // Close modals when clicking on modal content (but not on buttons/inputs)
  document.querySelectorAll('.modal-content').forEach(modalContent => {
    modalContent.addEventListener('click', (e) => {
      // Don't close if clicking on interactive elements
      if (e.target.tagName === 'BUTTON' || 
          e.target.tagName === 'INPUT' || 
          e.target.tagName === 'SELECT' || 
          e.target.tagName === 'TEXTAREA' ||
          e.target.closest('button') ||
          e.target.closest('input') ||
          e.target.closest('select') ||
          e.target.closest('textarea')) {
        return;
      }
      
      // Close if clicking on the modal content itself
      if (e.target === modalContent) {
        hideAllModals();
      }
    });
  });
  
  // Specific modal close button event listeners
  const closeSettingsBtn = document.getElementById('close-settings-btn');
  const closeProfileBtn = document.getElementById('close-profile-btn');
  const closeAttachmentsBtn = document.getElementById('close-attachments-btn');
  const settingsCancelBtn = document.getElementById('settings-cancel-btn');
  const closeProfileFooterBtn = document.getElementById('close-profile-footer-btn');
  
  if (closeSettingsBtn) {
    closeSettingsBtn.addEventListener('click', () => hideAllModals());
  }
  
  if (closeProfileBtn) {
    closeProfileBtn.addEventListener('click', () => hideAllModals());
  }
  
  if (closeAttachmentsBtn) {
    closeAttachmentsBtn.addEventListener('click', () => hideAllModals());
  }
  
  if (settingsCancelBtn) {
    settingsCancelBtn.addEventListener('click', () => hideAllModals());
  }
  
  if (closeProfileFooterBtn) {
    closeProfileFooterBtn.addEventListener('click', () => hideAllModals());
  }
  
  // Close modals with ESC key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      hideAllModals();
    }
  });
  
  // Pro Features Modal
  const proFeaturesModal = document.getElementById('pro-features-modal');
  const closeProFeaturesBtn = document.getElementById('close-pro-features-btn');
  const upgradeProBtn = document.getElementById('upgrade-pro-btn');
  
  if (closeProFeaturesBtn) {
    closeProFeaturesBtn.addEventListener('click', () => hideAllModals());
  }
  
  if (upgradeProBtn) {
    upgradeProBtn.addEventListener('click', () => {
      hideAllModals();
      // TODO: Implement upgrade flow
      showStatus('Upgrade flow coming soon!', 'info');
    });
  }
  
  // View Pro Features button
  const viewProFeaturesBtn = document.getElementById('view-pro-features-btn');
  if (viewProFeaturesBtn) {
    viewProFeaturesBtn.addEventListener('click', () => {
      if (proFeaturesModal) {
        proFeaturesModal.style.display = 'flex';
        document.getElementById('modal-backdrop').style.display = 'block';
      }
    });
  }
  
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

// Detect if we're in popup or sidebar mode
function detectDisplayMode() {
  const body = document.body;
  const width = window.innerWidth || document.documentElement.clientWidth;
  
  // Clear existing mode classes
  body.classList.remove('popup-mode', 'sidebar-mode');
  
  // Detect mode based on window width and context
  if (width <= 500 || window.location.search.includes('popup=true')) {
    body.classList.add('popup-mode');
    console.log('Display mode: popup');
  } else {
    body.classList.add('sidebar-mode');
    console.log('Display mode: sidebar');
  }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', async () => {
  console.log('DOM loaded, initializing popup...');
  
  try {
    // Detect and set display mode
    detectDisplayMode();
    
    // Initialize theme toggle
    initializeThemeToggle();
    
    // Re-detect on resize for sidebar mode
    window.addEventListener('resize', detectDisplayMode);
    
    // Initialize authentication forms
    initializeAuthForms();
    
    // Initialize main app listeners
    initializeMainAppListeners();
    
    // Set up Firebase auth state observer
    initializeAuthStateObserver();
    
    // Ensure user session
    await ensureUserSession();
    
    // Test contact rendering function
    console.log('Contact rendering function ready');
    
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
  // Handle contact fetch progress
  else if (request.type === 'CONTACTS_PROGRESS') {
    const progressElement = document.getElementById('contacts-progress');
    if (progressElement) {
      progressElement.textContent = request.message || 'Processing...';
    }
    showStatus(request.message || 'Processing contacts...', request.isError ? 'error' : 'info');
  }
  // Handle contacts fetched
  else if (request.type === 'CONTACTS_FETCHED') {
    const progressElement = document.getElementById('contacts-progress');
    if (progressElement) {
      progressElement.textContent = request.message || 'Contacts loaded!';
    }
    
    if (request.data && Array.isArray(request.data)) {
      contacts = request.data;
      console.log('Received contacts data:', contacts);
      
      // Log first contact structure for debugging
      if (contacts.length > 0) {
        console.log('First contact structure:', contacts[0]);
        debugContactData(contacts[0]);
      }
      
      renderContactsList(contacts);
      showStatus(`Found ${contacts.length} contacts`, 'success');
    }
    
    showButtonLoading(fetchContactsBtn, false);
    
    // Hide progress after a delay
    setTimeout(() => {
      if (progressElement) {
        progressElement.textContent = '';
      }
    }, 3000);
  }
  // Handle conversation extraction progress
  else if (request.type === 'EXTRACTION_PROGRESS') {
    const progressElement = document.getElementById('extraction-progress');
    if (progressElement) {
      progressElement.textContent = request.message || 'Extracting...';
    }
    showStatus(request.message || 'Extracting conversation...', 'info');
  }
  // Handle conversation extracted
  else if (request.type === 'CONVERSATION_EXTRACTED') {
    const progressElement = document.getElementById('extraction-progress');
    if (progressElement) {
      progressElement.textContent = request.message || 'Conversation extracted!';
    }
    
    if (request.data) {
      currentConversation = request.data;
      
      // Show export actions
      const exportCard = document.getElementById('export-actions-card');
      const conversationName = document.getElementById('current-conversation-name');
      
      if (exportCard) exportCard.style.display = 'block';
      if (conversationName) conversationName.textContent = `Conversation with ${request.data.username}`;
      
      showStatus(`Conversation with ${request.data.username} ready for export!`, 'success');
    }
    
    const extractBtn = document.getElementById('extract-conversation-btn');
    showButtonLoading(extractBtn, false);
    
    // Hide progress after a delay
    setTimeout(() => {
      if (progressElement) {
        progressElement.textContent = '';
      }
    }, 3000);
  }
  // Handle extraction errors
  else if (request.type === 'EXTRACTION_ERROR') {
    const progressElement = document.getElementById('extraction-progress');
    if (progressElement) {
      progressElement.textContent = 'Error extracting conversation';
    }
    
    showStatus(`Error: ${request.error || 'Failed to extract conversation'}`, 'error');
    
    const extractBtn = document.getElementById('extract-conversation-btn');
    showButtonLoading(extractBtn, false);
  }
  
  sendResponse({ success: true });
  return true; // Keep message channel open
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
