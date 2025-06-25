// Import Firebase functions
import { onAuth, logOut, signUp, logIn, UserSubscription } from './firebase-auth.js';

// Global variables
let isPro = false;
let userInfo = null;
let currentUser = null;

// UI Management
function showAuthScreen() {
  document.getElementById('auth-container').style.display = 'block';
  document.getElementById('user-info').style.display = 'none';
  document.getElementById('main-content').style.display = 'none';
}

function showMainApp(user) {
  document.getElementById('auth-container').style.display = 'none';
  document.getElementById('user-info').style.display = 'block';
  document.getElementById('main-content').style.display = 'block';
  
  document.getElementById('user-email').textContent = user.email;
  currentUser = user;
  
  // Update pro status from user object
  isPro = user.isPro || false;
  updateProUI();
  
  // Store user info in Chrome storage for checkout
  chrome.storage.local.set({
    userEmail: user.email,
    userId: user.uid,
    isPro: isPro,
    isAuthenticated: true
  });
  
  // Initialize app functionality
  initializeApp();
}

function showError(elementId, message) {
  const errorElement = document.getElementById(elementId);
  errorElement.textContent = message;
  errorElement.style.display = 'block';
  setTimeout(() => {
    errorElement.style.display = 'none';
  }, 5000);
}

function setButtonLoading(buttonId, isLoading) {
  const button = document.getElementById(buttonId);
  if (!button) return;
  
  if (isLoading) {
    button.disabled = true;
    button.setAttribute('data-original-text', button.textContent);
    button.textContent = 'Loading...';
  } else {
    button.disabled = false;
    if (button.hasAttribute('data-original-text')) {
      button.textContent = button.getAttribute('data-original-text');
      button.removeAttribute('data-original-text');
    }
  }
}

// Authentication form handlers
function initializeAuthForms() {
  // Toggle between login and signup forms
  document.getElementById('show-signup').addEventListener('click', (e) => {
    e.preventDefault();
    document.getElementById('login-form').style.display = 'none';
    document.getElementById('signup-form').style.display = 'block';
  });

  document.getElementById('show-login').addEventListener('click', (e) => {
    e.preventDefault();
    document.getElementById('signup-form').style.display = 'none';
    document.getElementById('login-form').style.display = 'block';
  });

  // Login form
  document.getElementById('login-btn').addEventListener('click', async (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    if (!email || !password) {
      showError('auth-error', 'Please fill in all fields');
      return;
    }

    setButtonLoading('login-btn', true);
    try {
      await logIn(email, password);
      // User will be handled by onAuth listener
    } catch (error) {
      console.error('Login error:', error);
      let errorMessage = error.message;
      if (errorMessage.includes('user-not-found')) {
        errorMessage = 'No account found with this email address.';
      } else if (errorMessage.includes('wrong-password')) {
        errorMessage = 'Incorrect password.';
      } else if (errorMessage.includes('invalid-email')) {
        errorMessage = 'Please enter a valid email address.';
      }
      showError('auth-error', errorMessage);
    }
    setButtonLoading('login-btn', false);
  });

  // Signup form
  document.getElementById('signup-btn').addEventListener('click', async (e) => {
    e.preventDefault();
    const email = document.getElementById('signup-email').value;
    const password = document.getElementById('signup-password').value;
    const confirmPassword = document.getElementById('confirm-password').value;

    if (!email || !password || !confirmPassword) {
      showError('signup-error', 'Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      showError('signup-error', 'Passwords do not match');
      return;
    }

    if (password.length < 6) {
      showError('signup-error', 'Password must be at least 6 characters');
      return;
    }

    setButtonLoading('signup-btn', true);
    try {
      await signUp(email, password);
      // User will be handled by onAuth listener
    } catch (error) {
      console.error('Signup error:', error);
      let errorMessage = error.message;
      if (errorMessage.includes('email-already-in-use')) {
        errorMessage = 'An account with this email already exists.';
      } else if (errorMessage.includes('weak-password')) {
        errorMessage = 'Password is too weak. Please choose a stronger password.';
      } else if (errorMessage.includes('invalid-email')) {
        errorMessage = 'Please enter a valid email address.';
      }
      showError('signup-error', errorMessage);
    }
    setButtonLoading('signup-btn', false);
  });

  // Logout button
  document.getElementById('logout-button').addEventListener('click', async () => {
    try {
      await logOut();
      // Clear Chrome storage
      chrome.storage.local.clear();
      showAuthScreen();
    } catch (error) {
      console.error('Logout error:', error);
    }
  });
}

// Function to refresh user subscription status
async function refreshUserSubscriptionStatus() {
  if (!currentUser || !currentUser.uid) return;
  
  try {
    const userStatus = await UserSubscription.getUserStatus(currentUser.uid);
    if (userStatus) {
      isPro = userStatus.isPro;
      currentUser.isPro = isPro;
      currentUser.subscriptionStatus = userStatus.subscriptionStatus;
      
      // Update Chrome storage
      chrome.storage.local.set({
        isPro: isPro,
        subscriptionStatus: userStatus.subscriptionStatus
      });
      
      updateProUI();
      console.log('Subscription status refreshed:', userStatus);
    }
  } catch (error) {
    console.error('Error refreshing subscription status:', error);
  }
}

// App functionality (same as before)
async function formatDate(timestamp) {
  const date = new Date(parseInt(timestamp));
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  const time = date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', second: '2-digit', hour12: true });
  
  return new Promise((resolve) => {
    chrome.storage.local.get(['dateFormat'], function(result) {
      const format = result.dateFormat || 'DD/MM/YYYY';
      
      let dateStr;
      switch(format) {
        case 'MM/DD/YYYY':
          dateStr = `${month}/${day}/${year}`;
          break;
        case 'YYYY/MM/DD':
          dateStr = `${year}/${month}/${day}`;
          break;
        case 'DD-MM-YYYY':
          dateStr = `${day}-${month}-${year}`;
          break;
        default:
          dateStr = `${day}/${month}/${year}`;
      }
      
      resolve(`${dateStr}, ${time}`);
    });
  });
}

function updateStatus(message, isError = false, isProgress = false) {
  const statusDiv = document.getElementById('status');
  const icon = isError 
    ? '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>'
    : isProgress 
      ? '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="2" x2="12" y2="6"></line><line x1="12" y1="18" x2="12" y2="22"></line><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line><line x1="2" y1="12" x2="6" y2="12"></line><line x1="18" y1="12" x2="22" y2="12"></line><line x1="4.93" y1="19.07" x2="7.76" y2="16.24"></line><line x1="16.24" y1="7.76" x2="19.07" y2="4.93"></line></svg>'
      : '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>';
  
  statusDiv.innerHTML = `${icon}<span>${message}</span>`;
  statusDiv.className = `status ${isError ? 'error' : isProgress ? 'progress' : 'success'}`;
  statusDiv.style.display = 'flex';
}

async function displayContacts(contacts) {
  const contactsList = document.getElementById('contactsList');
  if (!contactsList) return;

  contactsList.innerHTML = '';
  
  if (!contacts || contacts.length === 0) {
    contactsList.innerHTML = '<div class="no-contacts">No contacts found</div>';
    return;
  }

  for (const contact of contacts) {
    const contactDiv = document.createElement('div');
    contactDiv.className = 'contact-item fade-in';
    
    const username = contact.username || 'Unknown User';
    const lastMessage = await formatDate(contact.recentMessageDate);
    
    contactDiv.innerHTML = `
      <div class="contact-name">${username}</div>
      <div class="contact-last-message">Last message: ${lastMessage}</div>
    `;
    
    contactDiv.addEventListener('click', () => {
      chrome.storage.local.set({ currentUsername: username }, () => {
        chrome.runtime.sendMessage({ type: 'EXTRACT_CONVERSATION' });
        updateStatus(`Extracting conversation with ${username}...`, false, true);
      });
    });
    
    contactsList.appendChild(contactDiv);
  }
}

function initializeApp() {
  // Initialize event listeners
  initializeEventListeners();
  
  // Initialize settings
  initializeSettings();
  
  // Refresh subscription status
  refreshUserSubscriptionStatus();
  
  // Check if we're on a Fiverr page
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    const currentUrl = tabs[0].url;
    if (currentUrl.includes('fiverr.com')) {
      updateStatus('Ready to extract Fiverr data.');
    } else {
      updateStatus('Please navigate to Fiverr to use this extension.', true);
    }
  });
}

function initializeEventListeners() {
  // Fetch contacts button
  document.getElementById('fetchContactsBtn').addEventListener('click', () => {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      const currentUrl = tabs[0].url;
      if (!currentUrl.includes('fiverr.com')) {
        updateStatus('Please navigate to Fiverr first.', true);
        return;
      }
      
      setButtonLoading('fetchContactsBtn', true);
      updateStatus('Fetching all contacts...', false, true);
      chrome.runtime.sendMessage({ type: 'FETCH_ALL_CONTACTS' });
    });
  });

  // Extract conversation button
  document.getElementById('extractBtn').addEventListener('click', () => {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      const url = tabs[0].url;
      
      const match = url.match(/^https:\/\/www\.fiverr\.com\/inbox\/([^\/\?]+)$/);
      if (!match) {
        updateStatus('Please open a specific inbox URL (e.g., https://www.fiverr.com/inbox/username)', true);
        return;
      }

      const username = match[1];
      setButtonLoading('extractBtn', true);
      
      chrome.storage.local.set({ currentUsername: username }, () => {
        chrome.runtime.sendMessage({ type: 'EXTRACT_CONVERSATION' });
        updateStatus(`Extracting conversation with ${username}...`, false, true);
      });
    });
  });

  // Download buttons
  document.getElementById('downloadBtn').addEventListener('click', () => {
    chrome.storage.local.get(['markdownContent', 'currentUsername'], function(result) {
      if (result.markdownContent && result.currentUsername) {
        const blob = new Blob([result.markdownContent], { type: 'text/markdown' });
        chrome.downloads.download({
          url: URL.createObjectURL(blob),
          filename: `${result.currentUsername}/conversations/fiverr_conversation_${result.currentUsername}_${new Date().toISOString().split('T')[0]}.md`,
          saveAs: false
        });
      } else {
        updateStatus('Please extract the conversation first.', true);
      }
    });
  });

  document.getElementById('upgradeBtn').addEventListener('click', () => {
    if (currentUser && currentUser.email) {
      chrome.storage.local.set({ checkoutEmail: currentUser.email }, () => {
        chrome.tabs.create({ url: chrome.runtime.getURL('checkout.html') });
      });
    } else {
      chrome.tabs.create({ url: chrome.runtime.getURL('checkout.html') });
    }
  });

  // Add refresh subscription status button (for testing)
  const refreshBtn = document.createElement('button');
  refreshBtn.textContent = 'Refresh Status';
  refreshBtn.className = 'shad-button secondary';
  refreshBtn.style.fontSize = '0.8rem';
  refreshBtn.style.padding = '5px 10px';
  refreshBtn.addEventListener('click', refreshUserSubscriptionStatus);
  
  const userInfo = document.getElementById('user-info');
  if (userInfo) {
    userInfo.appendChild(refreshBtn);
  }
}

function initializeSettings() {
  const settingsBtn = document.getElementById('settingsBtn');
  const settingsModal = document.getElementById('settingsModal');
  const modalBackdrop = document.getElementById('modalBackdrop');
  const cancelBtn = document.getElementById('cancelBtn');
  const saveBtn = document.getElementById('saveBtn');

  settingsBtn.addEventListener('click', () => {
    settingsModal.style.display = 'block';
    modalBackdrop.style.display = 'block';
  });

  function hideModal() {
    settingsModal.style.display = 'none';
    modalBackdrop.style.display = 'none';
  }

  cancelBtn.addEventListener('click', hideModal);
  modalBackdrop.addEventListener('click', hideModal);

  saveBtn.addEventListener('click', () => {
    const dateFormat = document.getElementById('dateFormat').value;
    chrome.storage.local.set({ dateFormat: dateFormat }, () => {
      hideModal();
      updateStatus('Settings saved successfully!');
    });
  });
}

function updateProUI() {
  const proSection = document.getElementById('proSection');
  
  if (isPro) {
    proSection.style.display = 'none';
    updateStatus(`Pro features activated! Status: ${currentUser?.subscriptionStatus || 'active'}`);
  } else {
    proSection.style.display = 'block';
  }
}

// Handle messages from content script and background
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  switch (request.type) {
    case 'CONTACTS_FETCHED':
      setButtonLoading('fetchContactsBtn', false);
      updateStatus(request.message);
      if (request.data) {
        displayContacts(request.data).catch(console.error);
      }
      break;
    
    case 'CONVERSATION_EXTRACTED':
      setButtonLoading('extractBtn', false);
      updateStatus(request.message || 'Conversation extracted successfully!');
      
      const actionsDiv = document.getElementById('conversationActions');
      actionsDiv.style.display = 'block';
      break;
    
    case 'EXTRACTION_ERROR':
      setButtonLoading('extractBtn', false);
      updateStatus(request.error, true);
      break;
      
    case 'PRO_STATUS_UPDATED':
      // Refresh subscription status from Firestore
      refreshUserSubscriptionStatus();
      break;
      
    case 'SUBSCRIPTION_UPDATED':
      // Handle subscription updates from success page
      if (request.subscriptionData && currentUser) {
        UserSubscription.updateSubscriptionStatus(currentUser.uid, request.subscriptionData)
          .then(() => {
            refreshUserSubscriptionStatus();
          })
          .catch(error => {
            console.error('Error updating subscription in Firestore:', error);
          });
      }
      break;
  }
});

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', async () => {
  // Initialize authentication forms
  initializeAuthForms();
  
  // Set up authentication state listener
  onAuth((user) => {
    if (user) {
      showMainApp(user);
    } else {
      showAuthScreen();
    }
  });
});
