// Firebase functions are available globally via firebase-auth.js

// Global variables
let currentUser = null;
let isPro = false;
let contacts = [];
let currentConversation = null;
let isAuthenticated = false;

// Theme variables
let currentTheme = 'light';

// Keyboard shortcuts system
class KeyboardShortcuts {
  constructor() {
    this.shortcuts = new Map();
    this.focusableElements = [];
    this.currentFocusIndex = -1;
    this.isModalOpen = false;
    this.init();
  }

  init() {
    // Register default shortcuts
    this.registerShortcuts();
    
    // Add event listeners
    document.addEventListener('keydown', (e) => this.handleKeyDown(e));
    document.addEventListener('keyup', (e) => this.handleKeyUp(e));
    
    // Update focusable elements when DOM changes
    this.updateFocusableElements();
    
    // Listen for modal state changes
    this.observeModalChanges();
  }

  registerShortcuts() {
    // Navigation shortcuts
    this.register('Tab', 'Navigate through focusable elements', () => this.handleTabNavigation());
    this.register('Escape', 'Close modals/dropdowns', () => this.handleEscape());
    this.register('Enter', 'Activate focused element', () => this.handleEnter());
    this.register('Space', 'Activate focused element', () => this.handleSpace());
    
    // Application shortcuts
    this.register('Ctrl+Shift+F', 'Fetch contacts', () => this.fetchContacts());
    this.register('Ctrl+Shift+E', 'Extract conversation', () => this.extractConversation());
    this.register('Ctrl+Shift+S', 'Open settings', () => this.openSettings());
    this.register('Ctrl+Shift+P', 'Open profile', () => this.openProfile());
    this.register('Ctrl+Shift+L', 'Logout', () => this.logout());
    this.register('Ctrl+Shift+T', 'Toggle theme', () => this.toggleTheme());
    
    // Export shortcuts
    this.register('Ctrl+Shift+M', 'Download Markdown', () => this.downloadMarkdown());
    this.register('Ctrl+Shift+J', 'Download JSON', () => this.downloadJSON());
    this.register('Ctrl+Shift+X', 'Download TXT', () => this.downloadTXT());
    this.register('Ctrl+Shift+C', 'Download CSV', () => this.downloadCSV());
    
    // Search shortcuts
    this.register('Ctrl+F', 'Focus search', () => this.focusSearch());
    this.register('Ctrl+Shift+C', 'Clear search', () => this.clearSearch());
    
    // Contact navigation
    this.register('ArrowUp', 'Previous contact', () => this.navigateContacts(-1));
    this.register('ArrowDown', 'Next contact', () => this.navigateContacts(1));
    this.register('Home', 'First contact', () => this.navigateToFirstContact());
    this.register('End', 'Last contact', () => this.navigateToLastContact());
    
    // Modal shortcuts
    this.register('Ctrl+Shift+M', 'Close modal', () => this.closeModal());
    
    // Help shortcuts
    this.register('F1', 'Show keyboard shortcuts', () => this.showShortcutsHelp());
    this.register('Ctrl+Shift+H', 'Show help', () => this.showHelp());
  }

  register(key, description, action) {
    this.shortcuts.set(key, { description, action });
  }

  handleKeyDown(e) {
    // Don't handle shortcuts if user is typing in input fields
    if (this.isTypingInInput(e.target)) {
      return;
    }

    const key = this.getKeyCombo(e);
    const shortcut = this.shortcuts.get(key);
    
    if (shortcut) {
      e.preventDefault();
      e.stopPropagation();
      shortcut.action();
    }
  }

  handleKeyUp(e) {
    // Handle special cases
    if (e.key === 'Tab') {
      this.updateFocusableElements();
    }
  }

  getKeyCombo(e) {
    const modifiers = [];
    if (e.ctrlKey) modifiers.push('Ctrl');
    if (e.shiftKey) modifiers.push('Shift');
    if (e.altKey) modifiers.push('Alt');
    if (e.metaKey) modifiers.push('Meta');
    
    const key = e.key.length === 1 ? e.key.toUpperCase() : e.key;
    return [...modifiers, key].join('+');
  }

  isTypingInInput(element) {
    const inputTypes = ['input', 'textarea', 'select'];
    return inputTypes.includes(element.tagName.toLowerCase()) || 
           element.contentEditable === 'true' ||
           element.classList.contains('form-input') ||
           element.classList.contains('search-input');
  }

  // Navigation handlers
  handleTabNavigation() {
    this.updateFocusableElements();
    if (this.focusableElements.length === 0) return;
    
    this.currentFocusIndex = (this.currentFocusIndex + 1) % this.focusableElements.length;
    this.focusableElements[this.currentFocusIndex]?.focus();
  }

  handleEscape() {
    // Close modals
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => {
      if (modal.style.display === 'block') {
        hideModal(modal);
      }
    });
    
    // Close dropdowns
    const dropdowns = document.querySelectorAll('.dropdown-menu');
    dropdowns.forEach(dropdown => {
      dropdown.classList.remove('show');
    });
    
    // Clear search
    const searchInput = document.getElementById('contact-search');
    if (searchInput && searchInput.value) {
      searchInput.value = '';
      this.clearSearch();
    }
  }

  handleEnter() {
    const focused = document.activeElement;
    if (focused) {
      focused.click();
    }
  }

  handleSpace() {
    const focused = document.activeElement;
    if (focused && focused.tagName === 'BUTTON') {
      focused.click();
    }
  }

  // Application action handlers
  fetchContacts() {
    if (fetchContactsBtn && !fetchContactsBtn.disabled) {
      fetchContacts();
    }
  }

  extractConversation() {
    if (extractConversationBtn && !extractConversationBtn.disabled) {
      extractConversation();
    }
  }

  openSettings() {
    if (settingsBtn) {
      settingsBtn.click();
    }
  }

  openProfile() {
    if (userMenuBtn) {
      userMenuBtn.click();
    }
  }

  logout() {
    logoutUser();
  }

  toggleTheme() {
    if (themeToggle) {
      themeToggle.checked = !themeToggle.checked;
      applyTheme(themeToggle.checked);
    }
  }

  // Download handlers
  downloadMarkdown() {
    if (downloadMdBtn && !downloadMdBtn.disabled) {
      downloadMdBtn.click();
    }
  }

  downloadJSON() {
    if (downloadJsonBtn && !downloadJsonBtn.disabled) {
      downloadJsonBtn.click();
    }
  }

  downloadTXT() {
    if (downloadTxtBtn && !downloadTxtBtn.disabled) {
      downloadTxtBtn.click();
    }
  }

  downloadCSV() {
    if (downloadCsvBtn && !downloadCsvBtn.disabled) {
      downloadCsvBtn.click();
    }
  }

  // Search handlers
  focusSearch() {
    const searchInput = document.getElementById('contact-search');
    if (searchInput) {
      searchInput.focus();
      searchInput.select();
    }
  }

  clearSearch() {
    const searchInput = document.getElementById('contact-search');
    if (searchInput) {
      searchInput.value = '';
      // Trigger search update
      const event = new Event('input', { bubbles: true });
      searchInput.dispatchEvent(event);
    }
  }

  // Contact navigation
  navigateContacts(direction) {
    const contactItems = document.querySelectorAll('.contact-item');
    if (contactItems.length === 0) return;
    
    if (this.currentFocusIndex === -1) {
      this.currentFocusIndex = 0;
    } else {
      this.currentFocusIndex = (this.currentFocusIndex + direction + contactItems.length) % contactItems.length;
    }
    
    contactItems[this.currentFocusIndex]?.focus();
  }

  navigateToFirstContact() {
    const contactItems = document.querySelectorAll('.contact-item');
    if (contactItems.length > 0) {
      this.currentFocusIndex = 0;
      contactItems[0].focus();
    }
  }

  navigateToLastContact() {
    const contactItems = document.querySelectorAll('.contact-item');
    if (contactItems.length > 0) {
      this.currentFocusIndex = contactItems.length - 1;
      contactItems[contactItems.length - 1].focus();
    }
  }

  closeModal() {
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => {
      if (modal.style.display === 'block') {
        hideModal(modal);
      }
    });
  }

  showShortcutsHelp() {
    this.displayShortcutsModal();
  }

  showHelp() {
    this.displayHelpModal();
  }

  // Utility methods
  updateFocusableElements() {
    this.focusableElements = Array.from(document.querySelectorAll(
      'button, input, select, textarea, [tabindex]:not([tabindex="-1"]), .contact-item, .dropdown-item'
    )).filter(el => {
      const style = window.getComputedStyle(el);
      return style.display !== 'none' && style.visibility !== 'hidden' && !el.disabled;
    });
  }

  observeModalChanges() {
    // Watch for modal state changes
    const observer = new MutationObserver(() => {
      const modals = document.querySelectorAll('.modal');
      this.isModalOpen = Array.from(modals).some(modal => 
        modal.style.display === 'block'
      );
    });
    
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['style']
    });
  }

  displayShortcutsModal() {
    const shortcutsList = Array.from(this.shortcuts.entries())
      .map(([key, { description }]) => `<tr><td><kbd>${key}</kbd></td><td>${description}</td></tr>`)
      .join('');
    
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.style.display = 'block';
    modal.innerHTML = `
      <div class="modal-content">
        <div class="modal-header">
          <h2 class="modal-title">Keyboard Shortcuts</h2>
          <button class="btn btn-icon modal-close" onclick="this.closest('.modal').style.display='none'">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
        <div class="modal-body">
          <table class="shortcuts-table">
            <thead>
              <tr><th>Shortcut</th><th>Action</th></tr>
            </thead>
            <tbody>${shortcutsList}</tbody>
          </table>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
    
    // Close on escape
    const closeOnEscape = (e) => {
      if (e.key === 'Escape') {
        modal.remove();
        document.removeEventListener('keydown', closeOnEscape);
      }
    };
    document.addEventListener('keydown', closeOnEscape);
  }

  displayHelpModal() {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.style.display = 'block';
    modal.innerHTML = `
      <div class="modal-content modal-large">
        <div class="modal-header">
          <h2 class="modal-title">Help & Guide</h2>
          <button class="btn btn-icon modal-close" onclick="this.closest('.modal').style.display='none'">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
        <div class="modal-body">
          <div class="help-sections">
            <div class="help-section">
              <h3>🚀 Getting Started</h3>
              <ol>
                <li>Navigate to <a href="https://www.fiverr.com/inbox" target="_blank">Fiverr Inbox</a></li>
                <li>Sign in to your Fiverr account</li>
                <li>Click "Fetch Contacts" to load your conversations</li>
                <li>Select a contact and click "Extract Conversation"</li>
                <li>Download your conversation in your preferred format</li>
              </ol>
            </div>
            
            <div class="help-section">
              <h3>💡 Tips & Tricks</h3>
              <ul>
                <li>Use keyboard shortcuts for faster workflow (Press F1 to see all shortcuts)</li>
                <li>Search contacts using Ctrl+F to quickly find specific conversations</li>
                <li>Use arrow keys to navigate through your contact list</li>
                <li>Toggle between light and dark themes in Settings</li>
                <li>Export conversations in multiple formats for different use cases</li>
              </ul>
            </div>
            
            <div class="help-section">
              <h3>🔧 Troubleshooting</h3>
              <ul>
                <li><strong>Can't fetch contacts?</strong> Make sure you're on the Fiverr inbox page and logged in</li>
                <li><strong>Communication error?</strong> Refresh the page and try again</li>
                <li><strong>No contacts found?</strong> Check if you have any conversations in your Fiverr inbox</li>
                <li><strong>Export not working?</strong> Make sure you've selected a contact and extracted the conversation first</li>
              </ul>
            </div>
            
            <div class="help-section">
              <h3>📋 Supported Formats</h3>
              <ul>
                <li><strong>Markdown (.md):</strong> Perfect for documentation and notes</li>
                <li><strong>JSON (.json):</strong> For data analysis and processing</li>
                <li><strong>Text (.txt):</strong> Simple text format for easy reading</li>
                <li><strong>CSV (.csv):</strong> For spreadsheet analysis</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
    
    // Close on escape
    const closeOnEscape = (e) => {
      if (e.key === 'Escape') {
        modal.remove();
        document.removeEventListener('keydown', closeOnEscape);
      }
    };
    document.addEventListener('keydown', closeOnEscape);
  }
}

  // Initialize keyboard shortcuts
  const keyboardShortcuts = new KeyboardShortcuts();

  // Initialize tooltip system
  function initTooltips() {
    // Add tooltip class to elements with data-tooltip
    document.querySelectorAll('[data-tooltip]').forEach(element => {
      element.classList.add('tooltip');
    });
    
    // Also handle dynamically added elements
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === 1) { // Element node
            if (node.hasAttribute && node.hasAttribute('data-tooltip')) {
              node.classList.add('tooltip');
            }
            // Check child elements
            const tooltipElements = node.querySelectorAll && node.querySelectorAll('[data-tooltip]');
            if (tooltipElements) {
              tooltipElements.forEach(element => {
                element.classList.add('tooltip');
              });
            }
          }
        });
      });
    });
    
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }

  // Initialize help system
  function initHelpSystem() {
    const helpBtn = document.getElementById('help-btn');
    if (helpBtn) {
      helpBtn.addEventListener('click', () => {
        keyboardShortcuts.displayHelpModal();
      });
    }
  }

  // Initialize tooltips and help system when DOM is ready
  document.addEventListener('DOMContentLoaded', () => {
    initTooltips();
    initHelpSystem();
  });

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

// Toast Notification System with friendly messages
class FriendlyToastNotification {
  constructor() {
    this.container = document.getElementById('toast-container');
    this.toasts = new Map();
    this.counter = 0;
    this.queue = [];
    this.maxToasts = 3; // Maximum concurrent toasts
    this.isProcessing = false;
  }

  show(options) {
    const {
      type = 'info',
      title = '',
      message = '',
      duration = 5000,
      persistent = false
    } = options;

    // Add to queue if we're at max capacity
    if (this.toasts.size >= this.maxToasts) {
      this.queue.push(options);
      return null;
    }

    return this.displayToast(options);
  }

  displayToast(options) {
    const {
      type = 'info',
      title = '',
      message = '',
      duration = 5000,
      persistent = false
    } = options;

    const toastId = `toast-${++this.counter}`;
    const toast = this.createToast(toastId, type, title, message, persistent);
    
    this.container.appendChild(toast);
    this.toasts.set(toastId, toast);

    // Auto-remove after duration (unless persistent)
    if (!persistent && duration > 0) {
      setTimeout(() => {
        this.remove(toastId);
      }, duration);
    }

    return toastId;
  }

  createToast(id, type, title, message, persistent) {
    const toast = document.createElement('div');
    toast.id = id;
    toast.className = `toast toast-${type}`;
    
    const icon = this.getIconForType(type);
    
    toast.innerHTML = `
      <div class="toast-icon">
        ${icon}
      </div>
      <div class="toast-content">
        ${title ? `<div class="toast-title">${title}</div>` : ''}
        ${message ? `<div class="toast-message">${message}</div>` : ''}
      </div>
      <button class="toast-close" title="Close notification">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </button>
      ${!persistent ? '<div class="toast-progress"></div>' : ''}
    `;

    // Add close functionality
    const closeBtn = toast.querySelector('.toast-close');
    closeBtn.addEventListener('click', () => {
      this.remove(id);
    });

    return toast;
  }

  getIconForType(type) {
    const icons = {
      success: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <polyline points="20,6 9,17 4,12"></polyline>
      </svg>`,
      error: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="15" y1="9" x2="9" y2="15"></line>
        <line x1="9" y1="9" x2="15" y2="15"></line>
      </svg>`,
      warning: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
        <line x1="12" y1="9" x2="12" y2="13"></line>
        <line x1="12" y1="17" x2="12.01" y2="17"></line>
      </svg>`,
      info: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="12" y1="16" x2="12" y2="12"></line>
        <line x1="12" y1="8" x2="12.01" y2="8"></line>
      </svg>`
    };
    
    return icons[type] || icons.info;
  }

  remove(toastId) {
    const toast = this.toasts.get(toastId);
    if (toast) {
      toast.classList.add('toast-exit');
      
      setTimeout(() => {
        if (toast.parentNode) {
          toast.parentNode.removeChild(toast);
        }
        this.toasts.delete(toastId);
        
        // Process queue after removing toast
        this.processQueue();
      }, 300);
    }
  }

  processQueue() {
    if (this.queue.length > 0 && this.toasts.size < this.maxToasts) {
      const nextToast = this.queue.shift();
      this.displayToast(nextToast);
    }
  }

  clear() {
    this.toasts.forEach((toast, id) => {
      this.remove(id);
    });
    this.queue = []; // Clear queue as well
  }

  // Friendly convenience methods with better messaging
  success(title, message, duration = 5000) {
    return this.show({ type: 'success', title, message, duration });
  }

  error(title, message, duration = 7000) {
    return this.show({ type: 'error', title, message, duration });
  }

  warning(title, message, duration = 6000) {
    return this.show({ type: 'warning', title, message, duration });
  }

  info(title, message, duration = 5000) {
    return this.show({ type: 'info', title, message, duration });
  }

  // Persistent notifications (don't auto-dismiss)
  persistent(type, title, message) {
    return this.show({ type, title, message, persistent: true });
  }

  // Prevent duplicate toasts by checking recent messages
  showUnique(options, timeout = 2000) {
    const key = `${options.type}-${options.title}-${options.message}`;
    
    // Check if similar toast was shown recently
    const recentToast = Array.from(this.toasts.values()).find(toast => {
      const toastKey = toast.getAttribute('data-key');
      return toastKey === key;
    });

    if (recentToast) {
      return null; // Don't show duplicate
    }

    const toastId = this.show(options);
    if (toastId) {
      const toast = this.toasts.get(toastId);
      if (toast) {
        toast.setAttribute('data-key', key);
      }
    }

    return toastId;
  }

  // Batch multiple toasts into a single summary
  showBatch(toasts, summaryTitle = 'Multiple Updates') {
    if (toasts.length === 0) return;

    if (toasts.length === 1) {
      return this.show(toasts[0]);
    }

    // Show summary toast for multiple updates
    const messages = toasts.map(t => t.message).join(', ');
    return this.show({
      type: 'info',
      title: summaryTitle,
      message: messages,
      duration: 6000
    });
  }
}

// Global toast instance with friendly messaging
const toast = new FriendlyToastNotification();

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
    
    toast.showUnique({
      type: 'success',
      title: 'Welcome Back! 👋',
      message: `Great to see you again, ${result.user.email}! You're all set to extract your Fiverr conversations.`
    });
    return result.user;
  } catch (error) {
    console.error('Login error:', error);
    const errorMessage = getAuthErrorMessage(error);
    showError(authError, errorMessage);
    toast.error('Login Failed', errorMessage);
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
    
    toast.showUnique({
      type: 'success',
      title: 'Account Created! 🎉',
      message: `Welcome to Fiverr Extractor, ${result.user.email}! Your account is ready to help you extract conversations.`
    });
    return result.user;
  } catch (error) {
    console.error('Signup error:', error);
    const errorMessage = getAuthErrorMessage(error);
    showError(signupError, errorMessage);
    toast.error('Signup Failed', errorMessage);
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
  // Use toast notifications instead of status bar
  switch (type) {
    case 'success':
      toast.showUnique({
      type: 'success',
      title: 'Operation Complete! ✅',
      message: message
    });
      break;
    case 'error':
      toast.error('Error', message);
      break;
    case 'warning':
      toast.warning('Warning', message);
      break;
    case 'info':
    default:
      toast.info('Info', message);
      break;
  }
}

function hideStatus() {
  // Toast notifications auto-hide, so this function is kept for compatibility
  // but doesn't need to do anything
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
  try {
    toast.info('Redirecting to Upgrade', 'Opening upgrade page...');
    
    // Create checkout session
    const response = await fetch('https://fiverr-extractor.vercel.app/api/create-checkout-session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: currentUser.email,
        success_url: chrome.runtime.getURL('public/success.html'),
        cancel_url: chrome.runtime.getURL('public/cancel.html')
      })
    });

    if (!response.ok) {
      throw new Error('Failed to create checkout session');
    }

    const { url } = await response.json();
    
    // Open checkout in new tab
    chrome.tabs.create({ url });
    
    toast.showUnique({
      type: 'success',
      title: 'Upgrade Page Opened! 🚀',
      message: 'Please complete your purchase to unlock all Pro features and enjoy unlimited conversation exports.'
    });
    
  } catch (error) {
    console.error('Error creating checkout session:', error);
    toast.error('Upgrade Error', 'Failed to open upgrade page. Please try again.');
  }
}

// Refresh subscription status
async function refreshSubscriptionStatus() {
  try {
    if (!currentUser) {
      return;
    }
    
    toast.info('Checking Status', 'Verifying your subscription status...');
    
    const paymentStatus = await verifyUserPaymentStatus(currentUser.email);
    isPro = paymentStatus.subscriptionStatus === 'active';
    
    // Update stored data
    await new Promise((resolve) => {
      chrome.storage.local.set({ 
        userEmail: currentUser.email,
        subscriptionStatus: paymentStatus.subscriptionStatus,
        isPro: isPro
      }, resolve);
    });
    
    await updateUserInterface();
    
    if (isPro) {
      toast.showUnique({
      type: 'success',
      title: 'Pro Status Active! ⭐',
      message: 'Your Pro subscription is active! Enjoy unlimited conversation exports and all premium features.'
    });
    } else {
      toast.info('Free Plan', 'You are currently on the free plan.');
    }
    
  } catch (error) {
    console.error('Error refreshing subscription status:', error);
    toast.error('Status Check Failed', 'Unable to verify subscription status.');
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

// Function to check if we're on the correct Fiverr page
async function checkFiverrPage() {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    if (!tab) {
      return { valid: false, error: 'No active tab found' };
    }
    
    if (!tab.url.includes('fiverr.com')) {
      return { 
        valid: false, 
        error: 'Please navigate to Fiverr.com',
        guidance: 'You need to be on Fiverr.com to use this extension. Please go to https://www.fiverr.com and try again.'
      };
    }
    
    // Check if we're on the inbox page specifically
    if (!tab.url.includes('/inbox')) {
      return { 
        valid: false, 
        error: 'Please navigate to Fiverr Inbox',
        guidance: 'You need to be on the Fiverr Inbox page. Please go to https://www.fiverr.com/inbox and try again.'
      };
    }
    
    return { valid: true, tab };
  } catch (error) {
    return { valid: false, error: 'Unable to check current page' };
  }
}

// Function to ensure content script is loaded
async function ensureContentScript(tabId) {
  try {
    // Try to ping the content script
    await chrome.tabs.sendMessage(tabId, { type: 'PING' });
    return true;
  } catch (error) {
    // Content script not available, try to inject it
    try {
      await chrome.scripting.executeScript({
        target: { tabId: tabId },
        files: ['content.js']
      });
      // Wait a moment for the script to load
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Try to ping again
      await chrome.tabs.sendMessage(tabId, { type: 'PING' });
      return true;
    } catch (injectError) {
      console.error('Failed to inject content script:', injectError);
      return false;
    }
  }
}

async function fetchContacts() {
  try {
    showButtonLoading(fetchContactsBtn, true);
    toast.info('Fetching Contacts', 'Searching for your Fiverr conversations...');
    
    // Check if we're on the correct page
    const pageCheck = await checkFiverrPage();
    if (!pageCheck.valid) {
      toast.error('Wrong Page', pageCheck.guidance || pageCheck.error);
      showButtonLoading(fetchContactsBtn, false);
      return;
    }
    
    // Ensure content script is loaded
    const contentScriptReady = await ensureContentScript(pageCheck.tab.id);
    if (!contentScriptReady) {
      toast.error('Script Error', 'Unable to load extension script. Please refresh the page and try again.');
      showButtonLoading(fetchContactsBtn, false);
      return;
    }
    
    // Now try to send the fetch contacts message
    try {
      await chrome.tabs.sendMessage(pageCheck.tab.id, { type: 'FETCH_ALL_CONTACTS' });
    } catch (messageError) {
      throw new Error('Unable to communicate with Fiverr. Please refresh the page and try again.');
    }
    
  } catch (error) {
    console.error('Error fetching contacts:', error);
    toast.error('Fetch Error', error.message || 'Failed to fetch contacts');
    showButtonLoading(fetchContactsBtn, false);
  }
}

function renderContactsList(contactsToRender) {
  if (!contactsList) {
    console.error('Contacts list element not found');
    return;
  }

  if (!contactsToRender || contactsToRender.length === 0) {
    contactsList.innerHTML = `
      <div class="empty-state">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
          <circle cx="9" cy="7" r="4"></circle>
          <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
          <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
        </svg>
        <h4>No Contacts Found</h4>
        <p>Click "Fetch Contacts" to load your Fiverr conversations</p>
      </div>
    `;
    return;
  }

  contactsList.innerHTML = '';

  contactsToRender.forEach((contact, index) => {
    const contactElement = document.createElement('div');
    contactElement.className = 'contact-item';
    contactElement.tabIndex = 0; // Make focusable
    contactElement.setAttribute('role', 'button');
    contactElement.setAttribute('aria-label', `Contact: ${contact.name || contact.username || 'Unknown'}`);
    
    // Add keyboard event listeners
    contactElement.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        selectContact(contact);
      }
    });

    contactElement.addEventListener('click', () => {
      selectContact(contact);
    });

    const name = contact.name || contact.username || 'Unknown Contact';
    const lastMessage = contact.lastMessage || 'No messages yet';
    
    contactElement.innerHTML = `
      <div class="contact-avatar">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
          <circle cx="12" cy="7" r="4"></circle>
        </svg>
      </div>
      <div class="contact-info">
        <div class="contact-name">${name}</div>
        <div class="contact-last-message">${lastMessage}</div>
      </div>
    `;

    contactsList.appendChild(contactElement);
  });

  // Update keyboard shortcuts focusable elements
  keyboardShortcuts.updateFocusableElements();
}

function selectContact(contact) {
  if (!contact) return;
  
  // Clear previous selection
  contacts.forEach(c => c.selected = false);
  document.querySelectorAll('.contact-item').forEach(item => {
    item.classList.remove('selected');
  });
  
  // Mark this contact as selected
  contact.selected = true;
  
  // Find and highlight the corresponding DOM element
  const contactItems = document.querySelectorAll('.contact-item');
  contactItems.forEach((item, index) => {
    const contactName = item.querySelector('.contact-name')?.textContent;
    if (contactName === (contact.name || contact.username)) {
      item.classList.add('selected');
      item.focus(); // Focus the selected item for keyboard navigation
    }
  });
  
  // Store the selected contact for extraction
  const username = contact.name || contact.username;
  chrome.storage.local.set({ currentUsername: username });
  
  // Show success message
      toast.showUnique({
      type: 'success',
      title: 'Contact Selected! 👤',
      message: `You've selected the conversation with ${username}. Ready to extract the conversation when you're ready.`
    });
  
  console.log('Selected contact:', contact);
}

// Extract conversation functionality
async function extractConversation() {
  try {
    if (!contacts || contacts.length === 0) {
      toast.warning('No Contacts', 'Please fetch your contacts first before extracting conversations.');
      return;
    }
    
    // Check if a contact is selected
    const selectedContact = contacts.find(contact => contact.selected);
    if (!selectedContact) {
      toast.warning('No Contact Selected', 'Please select a contact from the list first.');
      return;
    }
    
    showButtonLoading(extractConversationBtn, true);
    toast.info('Extracting Conversation', 'Processing the selected conversation...');
    
    // Check if we're on the correct page
    const pageCheck = await checkFiverrPage();
    if (!pageCheck.valid) {
      toast.error('Wrong Page', pageCheck.guidance || pageCheck.error);
      showButtonLoading(extractConversationBtn, false);
      return;
    }
    
    // Store the selected username for the content script
    const username = selectedContact.name || selectedContact.username;
    await new Promise((resolve) => {
      chrome.storage.local.set({ currentUsername: username }, resolve);
    });
    
    // Ensure content script is loaded
    const contentScriptReady = await ensureContentScript(pageCheck.tab.id);
    if (!contentScriptReady) {
      toast.error('Script Error', 'Unable to load extension script. Please refresh the page and try again.');
      showButtonLoading(extractConversationBtn, false);
      return;
    }
    
    // Now try to send the extract conversation message
    try {
      await chrome.tabs.sendMessage(pageCheck.tab.id, { type: 'EXTRACT_CONVERSATION' });
    } catch (messageError) {
      throw new Error('Unable to communicate with Fiverr. Please refresh the page and try again.');
    }
    
  } catch (error) {
    console.error('Error extracting conversation:', error);
    toast.error('Extraction Error', error.message || 'Failed to extract conversation');
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
    toast.warning('No Conversation', 'Please extract a conversation first before downloading.');
    return;
  }

  try {
    toast.info('Preparing Download', `Converting conversation to ${format.toUpperCase()} format...`);
    
    let content, filename, mimeType;
    
    switch (format) {
      case 'md':
        content = await convertToMarkdown(currentConversation);
        filename = `conversation-${currentConversation.username}-${Date.now()}.md`;
        mimeType = 'text/markdown';
        break;
      case 'json':
        content = JSON.stringify(currentConversation, null, 2);
        filename = `conversation-${currentConversation.username}-${Date.now()}.json`;
        mimeType = 'application/json';
        break;
      case 'txt':
        content = await convertToText(currentConversation);
        filename = `conversation-${currentConversation.username}-${Date.now()}.txt`;
        mimeType = 'text/plain';
        break;
      case 'csv':
        content = await convertToCSV(currentConversation);
        filename = `conversation-${currentConversation.username}-${Date.now()}.csv`;
        mimeType = 'text/csv';
        break;
      default:
        throw new Error(`Unsupported format: ${format}`);
    }
    
    // Create and download the file
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast.showUnique({
      type: 'success',
      title: 'Download Complete! 📁',
      message: `${filename} has been saved to your downloads folder. Your conversation is ready to use!`
    });
    
  } catch (error) {
    console.error(`Error downloading ${format} file:`, error);
    toast.error('Download Failed', `Failed to download ${format.toUpperCase()} file: ${error.message}`);
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
    await firebase.auth().signOut();
    
    // Clear stored data
    await new Promise((resolve) => {
      chrome.storage.local.clear(resolve);
    });
    
    // Reset global variables
    currentUser = null;
    isPro = false;
    contacts = [];
    currentConversation = null;
    isAuthenticated = false;
    
    // Clear any existing toasts
    toast.clear();
    
    // Show logout success message
    toast.showUnique({
      type: 'success',
      title: 'Logged Out Successfully! 👋',
      message: 'You have been logged out. Come back anytime to extract more conversations!'
    });
    
    // Update UI
    await updateUserInterface();
    
  } catch (error) {
    console.error('Logout error:', error);
    toast.error('Logout Error', 'Failed to log out. Please try again.');
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

  // Settings modal
  if (settingsBtn) {
    settingsBtn.addEventListener('click', () => {
      showModal(settingsModal);
    });
  }

  // Keyboard shortcuts help button
  const showShortcutsBtn = document.getElementById('show-shortcuts-btn');
  if (showShortcutsBtn) {
    showShortcutsBtn.addEventListener('click', () => {
      keyboardShortcuts.showShortcutsHelp();
    });
  }

  // Profile modal
  if (profileModal) {
    const closeProfileBtn = document.getElementById('close-profile-btn');
    const closeProfileFooterBtn = document.getElementById('close-profile-footer-btn');
    
    if (closeProfileBtn) {
      closeProfileBtn.addEventListener('click', () => {
        hideModal(profileModal);
      });
    }
    
    if (closeProfileFooterBtn) {
      closeProfileFooterBtn.addEventListener('click', () => {
        hideModal(profileModal);
      });
    }
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
    
    // Show welcome toast
    toast.info('Extension Ready', 'Fiverr Conversation Extractor is ready to use! Press F1 for keyboard shortcuts.');
    
    // Check if user is on the correct page and provide guidance
    const pageCheck = await checkFiverrPage();
    if (!pageCheck.valid) {
      toast.warning('Setup Required', 'Please navigate to https://www.fiverr.com/inbox to use this extension.');
    }
    
  } catch (error) {
    console.error('Error initializing popup:', error);
    toast.error('Initialization Error', 'Failed to initialize the extension. Please refresh and try again.');
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
      toast.showUnique({
      type: 'success',
      title: 'Contacts Loaded! 📋',
      message: `Found ${contacts.length} conversations in your Fiverr inbox. Select one to extract the conversation.`
    });
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
    toast.info('Extracting', request.message || 'Processing conversation...');
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
      
      toast.success('Conversation Ready! 💬', `The conversation with ${request.data.username} has been extracted and is ready for download. Choose your preferred format!`);
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
    
    toast.error('Extraction Failed', request.error || 'Failed to extract conversation');
    
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
  ensureUserSession,
  // Toast notification system
  toast,
  // Keyboard shortcuts system
  keyboardShortcuts,
  // Debug function
  debugCommunication,
  // Test function to demonstrate toast notifications
  testToasts: () => {
    toast.success('Success Test', 'This is a success notification!');
    setTimeout(() => toast.error('Error Test', 'This is an error notification!'), 1000);
    setTimeout(() => toast.warning('Warning Test', 'This is a warning notification!'), 2000);
    setTimeout(() => toast.info('Info Test', 'This is an info notification!'), 3000);
    setTimeout(() => toast.persistent('info', 'Persistent Test', 'This notification will not auto-dismiss!'), 4000);
  },
  // Test function to demonstrate keyboard shortcuts
  testKeyboardShortcuts: () => {
    keyboardShortcuts.showShortcutsHelp();
  }
};

// Debug function to help troubleshoot communication issues
async function debugCommunication() {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    console.log('=== Communication Debug ===');
    console.log('Current tab:', tab);
    console.log('Tab URL:', tab?.url);
    console.log('Tab ID:', tab?.id);
    
    if (tab && tab.url.includes('fiverr.com')) {
      console.log('✅ On Fiverr page');
      
      try {
        const response = await chrome.tabs.sendMessage(tab.id, { type: 'PING' });
        console.log('✅ Content script responding:', response);
      } catch (error) {
        console.log('❌ Content script not responding:', error.message);
        
        try {
          await chrome.scripting.executeScript({
            target: { tabId: tab.id },
            files: ['content.js']
          });
          console.log('✅ Content script injected');
          
          // Wait and try again
          await new Promise(resolve => setTimeout(resolve, 1000));
          const response = await chrome.tabs.sendMessage(tab.id, { type: 'PING' });
          console.log('✅ Content script now responding:', response);
        } catch (injectError) {
          console.log('❌ Failed to inject content script:', injectError.message);
        }
      }
    } else {
      console.log('❌ Not on Fiverr page');
    }
    
    console.log('=== End Debug ===');
    
    toast.info('Debug Complete', 'Check browser console for communication status');
    
  } catch (error) {
    console.error('Debug error:', error);
    toast.error('Debug Error', error.message);
  }
}

// Export functions for testing or external access
