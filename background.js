try {
  importScripts('firebase-app-lib.js', 'firebase-auth-lib.js', 'firebase-firestore-lib.js', 'firebase-auth.js');
} catch (e) {
  console.error(e);
}
// Keep track of active tabs with content scripts
let activeTabsWithContentScript = new Set();

// Open the side panel on action click
chrome.action.onClicked.addListener((tab) => {
  if (tab && tab.windowId) {
    chrome.sidePanel.open({ windowId: tab.windowId }).catch(err => {
      console.error('Failed to open side panel:', err);
    });
  }
});

// Track ongoing processes
let ongoingProcesses = {
    contacts: new Map(),  // tabId -> status
    conversations: new Map()  // tabId -> status
};

// Track pro status
let proStatus = {
  isPro: false,
  userEmail: null,
  activatedAt: null
};

// Initialize pro status on startup
chrome.runtime.onStartup.addListener(() => {
  loadProStatus();
});

chrome.runtime.onInstalled.addListener(() => {
  loadProStatus();
});

// Load pro status from storage
function loadProStatus() {
  chrome.storage.local.get(['isPro', 'userEmail', 'activatedAt', 'sessionId'], (result) => {
    proStatus = {
      isPro: result.isPro || false,
      userEmail: result.userEmail || null,
      activatedAt: result.activatedAt || null,
      sessionId: result.sessionId || null
    };
    console.log('Pro status loaded:', proStatus);
  });
}

// Listen for navigation to Fiverr pages
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab && tab.url && tab.url.includes('fiverr.com')) {
    // Inject content script
    chrome.scripting.executeScript({
      target: { tabId: tabId },
      files: ['content.js']
    }).then(() => {
      activeTabsWithContentScript.add(tabId);
    }).catch(err => {
      console.error('Failed to inject content script:', err);
    });
  }
});

// Remove tab from tracking when closed
chrome.tabs.onRemoved.addListener((tabId) => {
  if (tabId) {
    activeTabsWithContentScript.delete(tabId);
    ongoingProcesses.contacts.delete(tabId);
    ongoingProcesses.conversations.delete(tabId);
  }
});

// Listen for messages from popup or content script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (!request || !request.type) return;
  
  const tabId = sender && sender.tab ? sender.tab.id : (request.tabId || null);

  if (request.type === 'INIT_POPUP') {
    // Inject content script when popup is opened
    chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
      if (tabs && tabs.length > 0) {
        const tab = tabs[0];
        if (tab && tab.url && tab.url.includes('fiverr.com')) {
          try {
            await chrome.scripting.executeScript({
              target: { tabId: tab.id },
              files: ['content.js']
            });
            activeTabsWithContentScript.add(tab.id);
          } catch (error) {
            console.error('Failed to inject content script:', error);
          }
        }
      }
    });
    
    // Send pro status to popup
    sendResponse({ proStatus: proStatus });
    return true;
  }

  // Handle content script ready notification
  else if (request.type === 'CONTENT_SCRIPT_READY' || request.type === 'CONTENT_SCRIPT_LOADED') {
    if (tabId) {
      activeTabsWithContentScript.add(tabId);
      console.log('Content script ready for tab:', tabId);
    }
    sendResponse({ received: true });
    return true;
  }

  // Handle pro activation
  else if (request.type === 'PRO_ACTIVATED') {
    console.log('Pro features activated:', request.data);
    proStatus = {
      isPro: true,
      userEmail: request.data.userEmail || null,
      activatedAt: request.data.activatedAt,
      sessionId: request.data.sessionId
    };
    
    // Save to storage
    chrome.storage.local.set({
      isPro: true,
      userEmail: proStatus.userEmail,
      activatedAt: proStatus.activatedAt,
      sessionId: proStatus.sessionId
    });
    
    // Broadcast pro activation to all tabs
    chrome.tabs.query({}, (tabs) => {
      tabs.forEach(tab => {
        if (activeTabsWithContentScript.has(tab.id)) {
        chrome.tabs.sendMessage(tab.id, {
          type: 'PRO_STATUS_UPDATED',
          proStatus: proStatus
        }).catch(() => {
          // Ignore errors for tabs without content scripts
            console.log('Tab', tab.id, 'does not have content script');
        });
        }
      });
    });
  }

  // Handle pro status check
  else if (request.type === 'CHECK_PRO_STATUS') {
    sendResponse({ proStatus: proStatus });
    return true;
  }

  // Track process status updates and forward to popup
  else if (request.type === 'CONTACTS_PROGRESS' || request.type === 'EXTRACTION_PROGRESS') {
    if (tabId) {
      const processType = request.type === 'CONTACTS_PROGRESS' ? 'contacts' : 'conversations';
      ongoingProcesses[processType].set(tabId, {
        status: 'running',
        progress: request.message || 'Processing...',
        timestamp: Date.now()
      });
    }
    
    // Forward to popup
    forwardMessageToPopup(request);
  }
  // Handle process completion and forward to popup
  else if (request.type === 'CONTACTS_FETCHED' || request.type === 'CONVERSATION_EXTRACTED') {
    if (tabId) {
      const processType = request.type === 'CONTACTS_FETCHED' ? 'contacts' : 'conversations';
      ongoingProcesses[processType].set(tabId, {
        status: 'completed',
        message: request.message || 'Completed',
        timestamp: Date.now()
      });
    }
    
    // Forward to popup
    forwardMessageToPopup(request);
  }
  // Handle errors and forward to popup
  else if (request.type === 'EXTRACTION_ERROR') {
    if (tabId) {
      ongoingProcesses.conversations.set(tabId, {
        status: 'error',
        error: request.error || 'Unknown error',
        timestamp: Date.now()
      });
    }
    
    // Forward to popup
    forwardMessageToPopup(request);
  }
  // Handle popup requesting status
  else if (request.type === 'GET_PROCESS_STATUS') {
    let status = {};
    if (tabId) {
      status = {
        contacts: ongoingProcesses.contacts.get(tabId),
        conversations: ongoingProcesses.conversations.get(tabId)
      };
    }
    sendResponse(status);
    return true; // Keep message channel open for async response
  }
  // Forward process requests to content script
  else if (['EXTRACT_CONVERSATION', 'FETCH_ALL_CONTACTS'].includes(request.type)) {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs && tabs.length > 0) {
        const tab = tabs[0];
        if (tab && tab.url && tab.url.includes('fiverr.com')) {
          // Check if content script is ready
          if (!activeTabsWithContentScript.has(tab.id)) {
            console.log('Content script not ready, injecting...');
            chrome.scripting.executeScript({
              target: { tabId: tab.id },
              files: ['content.js']
            }).then(() => {
              activeTabsWithContentScript.add(tab.id);
              // Wait a moment for content script to initialize
              setTimeout(() => {
                sendMessageToContentScript(tab.id, request);
              }, 100);
            }).catch(err => {
              console.error('Failed to inject content script:', err);
              ongoingProcesses[request.type === 'FETCH_ALL_CONTACTS' ? 'contacts' : 'conversations'].set(tab.id, {
              status: 'error',
                error: 'Failed to inject content script',
              timestamp: Date.now()
            });
          });
          } else {
            sendMessageToContentScript(tab.id, request);
          }
        } else {
          console.error('Not on a Fiverr page');
        }
      }
    });
  }
});

chrome.runtime.onMessageExternal.addListener((request, sender, sendResponse) => {
  if (request.type === 'PAYMENT_SUCCESS') {
    console.log('External payment success message received:', request);
    const sessionId = request.sessionId;
    
    if (sessionId) {
      chrome.storage.local.get('userId', (result) => {
        const userId = result.userId;
        if (userId) {
          const subscriptionData = {
            isPro: true,
            status: 'active',
            stripeCustomerId: null,
            subscriptionId: sessionId,
          };
          UserSubscription.updateSubscriptionStatus(userId, subscriptionData)
            .then(() => {
              console.log('User subscription updated in Firestore');
              chrome.storage.local.set({ isPro: true, subscriptionStatus: 'active' });
              sendResponse({ success: true });
            })
            .catch((error) => {
              console.error('Error updating subscription in Firestore:', error);
              sendResponse({ success: false, error: error.message });
            });
        } else {
          console.error('User ID not found in storage');
          sendResponse({ success: false, error: 'User ID not found' });
        }
      });
    }
    return true; // Indicates that the response is sent asynchronously
  }
});

// Helper function to send message to content script with better error handling
function sendMessageToContentScript(tabId, request) {
  const processType = request.type === 'FETCH_ALL_CONTACTS' ? 'contacts' : 'conversations';
  
  // Initialize process tracking
  ongoingProcesses[processType].set(tabId, {
    status: 'starting',
    timestamp: Date.now()
  });
  
  chrome.tabs.sendMessage(tabId, { ...request, tabId: tabId }).then(response => {
    console.log('Message sent successfully to content script');
  }).catch(err => {
    console.error('Failed to send message to content script:', err);
    ongoingProcesses[processType].set(tabId, {
      status: 'error',
      error: 'Failed to communicate with content script: ' + err.message,
      timestamp: Date.now()
    });
  });
}

// Helper function to forward messages to popup
function forwardMessageToPopup(message) {
  // Get all extension views (popups, options pages, etc.)
  const views = chrome.extension.getViews({ type: 'popup' });
  
  if (views && views.length > 0) {
    // Send message to popup if it's open
    views.forEach(view => {
      if (view.chrome && view.chrome.runtime) {
        try {
          view.chrome.runtime.sendMessage(message);
        } catch (error) {
          console.log('Failed to send message to popup view:', error);
        }
      }
    });
  }
  
  // Also try runtime.sendMessage for sidepanel
  try {
    chrome.runtime.sendMessage(message).catch(() => {
      // Ignore errors if no popup is listening
    });
  } catch (error) {
    // Ignore connection errors
  }
}
