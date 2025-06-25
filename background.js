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
  }

  // Track process status updates
  else if (request.type === 'CONTACTS_PROGRESS' || request.type === 'EXTRACTION_PROGRESS') {
    if (tabId) {
      const processType = request.type === 'CONTACTS_PROGRESS' ? 'contacts' : 'conversations';
      ongoingProcesses[processType].set(tabId, {
        status: 'running',
        progress: request.message || 'Processing...',
        timestamp: Date.now()
      });
    }
  }
  // Handle process completion
  else if (request.type === 'CONTACTS_FETCHED' || request.type === 'CONVERSATION_EXTRACTED') {
    if (tabId) {
      const processType = request.type === 'CONTACTS_FETCHED' ? 'contacts' : 'conversations';
      ongoingProcesses[processType].set(tabId, {
        status: 'completed',
        message: request.message || 'Completed',
        timestamp: Date.now()
      });
    }
  }
  // Handle errors
  else if (request.type === 'EXTRACTION_ERROR') {
    if (tabId) {
      ongoingProcesses.conversations.set(tabId, {
        status: 'error',
        error: request.error || 'Unknown error',
        timestamp: Date.now()
      });
    }
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
          // Initialize process tracking
          const processType = request.type === 'FETCH_ALL_CONTACTS' ? 'contacts' : 'conversations';
          ongoingProcesses[processType].set(tab.id, {
            status: 'starting',
            timestamp: Date.now()
          });
          
          chrome.tabs.sendMessage(tab.id, { ...request, tabId: tab.id }).catch(err => {
            console.error('Failed to send message to content script:', err);
            ongoingProcesses[processType].set(tab.id, {
              status: 'error',
              error: 'Failed to communicate with content script',
              timestamp: Date.now()
            });
          });
        } else {
          console.error('Not on a Fiverr page');
        }
      }
    });
  }
});
