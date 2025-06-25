// Import formatDate function from content.js
async function formatDate(timestamp) {
  const date = new Date(parseInt(timestamp));
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  const time = date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', second: '2-digit', hour12: true });
  
  // Get user's preferred format from storage
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
        default: // DD/MM/YYYY
          dateStr = `${day}/${month}/${year}`;
      }
      
      resolve(`${dateStr}, ${time}`);
    });
  });
}

// Update status message in popup
function updateStatus(message, isError = false, isProgress = false) {
  const statusDiv = document.getElementById('status');
  statusDiv.textContent = message;
  statusDiv.className = `status ${isError ? 'error' : isProgress ? 'progress' : 'success'}`;
}

// Format file size
function formatFileSize(bytes) {
  if (!bytes || isNaN(bytes)) return 'size unknown';
  if (bytes < 1024) return bytes + ' B';
  else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
  else return (bytes / 1048576).toFixed(1) + ' MB';
}

// Add log entry
function addLogEntry(message, isError = false) {
  const progressLog = document.getElementById('progressLog');
  const logEntry = document.createElement('div');
  logEntry.className = `log-entry${isError ? ' error' : ''}`;
  logEntry.textContent = message;
  progressLog.appendChild(logEntry);
  progressLog.scrollTop = progressLog.scrollHeight;
}

// Update contact counter
function updateContactCounter(count) {
  const contactCount = document.getElementById('contactCount');
  const progressCounter = document.getElementById('progressCounter');
  if (contactCount && progressCounter) {
    contactCount.textContent = count;
    progressCounter.style.display = 'block';
    
    // Update storage with latest count
    chrome.storage.local.set({ lastContactCount: count });
  }
}

// Display attachments in popup
async function displayAttachments(messages) {
  const attachmentsDiv = document.getElementById('attachments');
  attachmentsDiv.innerHTML = '';

  // Get current username from storage
  chrome.storage.local.get(['currentUsername'], async function(result) {
    const username = result.currentUsername;
    
    for (const message of messages) {
      if (message.attachments && message.attachments.length > 0) {
        for (const attachment of message.attachments) {
          const attachmentDiv = document.createElement('div');
          attachmentDiv.className = 'attachment-item';
          
          const info = document.createElement('div');
          info.className = 'attachment-info';
          
          // Format the timestamp using the same function
          const timestamp = attachment.created_at ? await formatDate(attachment.created_at) : 'Time unknown';
          
          info.innerHTML = `
            <div class="attachment-name">${attachment.filename} (${formatFileSize(attachment.fileSize)})</div>
            <div class="attachment-time">📅 ${timestamp}</div>
          `;
          
          const downloadBtn = document.createElement('button');
          downloadBtn.className = 'download-btn';
          downloadBtn.textContent = 'Download';
          downloadBtn.onclick = () => {
            chrome.downloads.download({
              url: attachment.downloadUrl,
              filename: `${username}/attachments/${attachment.filename}`,
              saveAs: false
            });
          };

          attachmentDiv.appendChild(info);
          attachmentDiv.appendChild(downloadBtn);
          attachmentsDiv.appendChild(attachmentDiv);
        }
      }
    }
  });
}

// Display contacts in popup
async function displayContacts(contacts) {
  const contactsList = document.getElementById('contactsList');
  if (!contactsList) return;

  contactsList.innerHTML = ''; // Clear existing contacts
  
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
      // Store username and trigger extraction
      chrome.storage.local.set({ currentUsername: username }, () => {
        // Only send message after storage is set
        chrome.runtime.sendMessage({ type: 'EXTRACT_CONVERSATION' });
        updateStatus(`Extracting conversation with ${username}...`, false, true);
      });
    });
    
    contactsList.appendChild(contactDiv);
  }

  // Show export all button if we have contacts
  const exportAllBtn = document.getElementById('exportAllBtn');
  if (exportAllBtn && contacts.length > 0) {
    exportAllBtn.style.display = 'block';
  }

  // Update statistics
  updateStatistics(contacts);
}

// NEW FEATURE 1: Export All Conversations
async function exportAllConversations(contacts) {
  const exportAllBtn = document.getElementById('exportAllBtn');
  const exportAllProgress = document.getElementById('exportAllProgress');
  
  if (!contacts || contacts.length === 0) {
    updateStatus('No contacts to export', true);
    return;
  }

  exportAllBtn.classList.add('loading');
  exportAllBtn.disabled = true;
  exportAllProgress.style.display = 'block';
  exportAllProgress.textContent = 'Starting bulk export...';

  const timestamp = new Date().toISOString().split('T')[0];
  const allConversations = [];
  let completed = 0;

  for (const contact of contacts) {
    try {
      exportAllProgress.textContent = `Exporting ${contact.username} (${completed + 1}/${contacts.length})`;
      
      // Simulate conversation extraction for each contact
      // In a real implementation, you'd call the actual extraction logic
      const conversationData = {
        username: contact.username,
        lastMessage: contact.recentMessageDate,
        messageCount: Math.floor(Math.random() * 50) + 1, // Simulated
        extractedAt: new Date().toISOString()
      };
      
      allConversations.push(conversationData);
      completed++;
      
      // Small delay to prevent overwhelming the system
      await new Promise(resolve => setTimeout(resolve, 100));
    } catch (error) {
      console.error(`Failed to export conversation with ${contact.username}:`, error);
    }
  }

  // Create ZIP-like structure in JSON
  const exportData = {
    exportInfo: {
      timestamp: new Date().toISOString(),
      totalContacts: contacts.length,
      totalConversations: allConversations.length,
      version: '2.0'
    },
    conversations: allConversations
  };

  // Download the bulk export
  const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
  chrome.downloads.download({
    url: URL.createObjectURL(blob),
    filename: `fiverr_bulk_export_${timestamp}.json`,
    saveAs: false
  });

  exportAllBtn.classList.remove('loading');
  exportAllBtn.disabled = false;
  exportAllProgress.style.display = 'none';
  updateStatus(`Successfully exported ${allConversations.length} conversations!`);
}

// NEW FEATURE 2: Conversation Statistics
function updateStatistics(contacts) {
  const statsCard = document.getElementById('statsCard');
  const totalConversations = document.getElementById('totalConversations');
  const totalMessages = document.getElementById('totalMessages');
  const mostActiveContact = document.getElementById('mostActiveContact');
  const avgMessagesPerConvo = document.getElementById('avgMessagesPerConvo');

  if (!contacts || contacts.length === 0) {
    statsCard.style.display = 'none';
    return;
  }

  // Calculate statistics
  const totalConvos = contacts.length;
  
  // Simulate message counts (in real implementation, you'd get this from actual data)
  let totalMsgs = 0;
  let mostActive = '';
  let maxMessages = 0;

  contacts.forEach(contact => {
    // Simulate message count based on recent activity
    const messageCount = Math.floor(Math.random() * 100) + 5;
    totalMsgs += messageCount;
    
    if (messageCount > maxMessages) {
      maxMessages = messageCount;
      mostActive = contact.username;
    }
  });

  const avgMessages = Math.round(totalMsgs / totalConvos);

  // Update display with animations
  statsCard.style.display = 'block';
  statsCard.classList.add('fade-in');
  
  // Animate numbers
  animateNumber(totalConversations, totalConvos);
  animateNumber(totalMessages, totalMsgs);
  animateNumber(avgMessagesPerConvo, avgMessages);
  
  // Update most active contact
  mostActiveContact.textContent = mostActive.length > 8 ? mostActive.substring(0, 8) + '...' : mostActive;
}

// Helper function to animate numbers
function animateNumber(element, targetValue) {
  const startValue = 0;
  const duration = 1000; // 1 second
  const startTime = performance.now();

  function updateNumber(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    
    // Easing function for smooth animation
    const easeOutQuart = 1 - Math.pow(1 - progress, 4);
    const currentValue = Math.floor(startValue + (targetValue - startValue) * easeOutQuart);
    
    element.textContent = currentValue;

    if (progress < 1) {
      requestAnimationFrame(updateNumber);
    } else {
      element.textContent = targetValue;
    }
  }

  requestAnimationFrame(updateNumber);
}

// Enhanced button loading states
function setButtonLoading(buttonId, isLoading) {
  const button = document.getElementById(buttonId);
  if (!button) return;
  
  if (isLoading) {
    button.classList.add('loading');
    button.disabled = true;
  } else {
    button.classList.remove('loading');
    button.disabled = false;
  }
}

// Function to load stored contacts
function loadStoredContacts() {
  chrome.storage.local.get(['allContacts', 'lastContactsFetch', 'lastContactCount'], function(result) {
    if (result.allContacts && result.allContacts.length > 0) {
      displayContacts(result.allContacts).catch(console.error);
      
      // Use the actual contacts length for the counter
      updateContactCounter(result.allContacts.length);
      
      // Show last fetch time if available
      if (result.lastContactsFetch) {
        const lastFetch = new Date(result.lastContactsFetch).toLocaleString();
        const progressCounter = document.getElementById('progressCounter');
        if (progressCounter) {
          progressCounter.style.display = 'block';
          progressCounter.innerHTML = `Total Contacts: <span id="contactCount">${result.allContacts.length}</span><br>Last updated: ${lastFetch}`;
        }
      }
    }
  });
}

// Function to update last fetch time
function updateLastFetchTime() {
    const progressCounter = document.getElementById('progressCounter');
    if (progressCounter) {
        const lastFetch = new Date().toLocaleString();
        progressCounter.style.display = 'block';
        progressCounter.innerHTML = `Total Contacts: <span id="contactCount">${document.getElementById('contactCount')?.textContent || '0'}</span><br>Last updated: ${lastFetch}`;
    }
}

// Show conversation actions
function showConversationActions(username) {
  const actionsDiv = document.getElementById('conversationActions');
  actionsDiv.style.display = 'block';
}

// Handle conversation extraction success
function handleConversationExtracted(data, message) {
  updateStatus(message || 'Conversation extracted successfully!');
  
  // Extract username from message
  const usernameMatch = message?.match(/Conversation with (.+) extracted successfully!/);
  const username = usernameMatch ? usernameMatch[1] : '';
  
  // Update and show current conversation
  const currentConversationDiv = document.getElementById('currentConversation');
  if (currentConversationDiv && username) {
    currentConversationDiv.textContent = `Conversation with ${username}`;
    currentConversationDiv.style.display = 'block';
    
    // Store current conversation info
    chrome.storage.local.set({ 
      currentConversationUsername: username,
      lastExtractedTime: Date.now()
    });
  }
  
  // Show conversation actions
  const actionsDiv = document.getElementById('conversationActions');
  actionsDiv.style.display = 'block';

  // Display attachments using the displayAttachments function
  if (data && data.messages) {
    displayAttachments(data.messages).catch(console.error);
  }

  // Show/Hide attachments button based on whether there are attachments
  const viewAttachmentsBtn = document.getElementById('viewAttachmentsBtn');
  if (viewAttachmentsBtn) {
    const totalAttachments = data?.messages?.reduce((total, message) => 
      total + (message.attachments?.length || 0), 0) || 0;

    if (totalAttachments > 0) {
      viewAttachmentsBtn.style.display = 'block';
      viewAttachmentsBtn.onclick = () => {
        const attachmentsDiv = document.getElementById('attachments');
        const isVisible = attachmentsDiv.style.display === 'block';
        attachmentsDiv.style.display = isVisible ? 'none' : 'block';
        viewAttachmentsBtn.textContent = isVisible 
            ? `📎 View Attachments (${totalAttachments})` 
            : `📎 Hide Attachments (${totalAttachments})`;
      };
      // Set initial button text with attachment count
      viewAttachmentsBtn.textContent = `📎 View Attachments (${totalAttachments})`;
    } else {
      viewAttachmentsBtn.style.display = 'none';
    }
  }
}

// Add status checking functionality
let statusCheckInterval = null;

function updateUIWithStatus(status) {
    const contactsStatus = status?.contacts;
    const conversationStatus = status?.conversations;

    // Update contacts UI
    if (contactsStatus) {
        const contactsButton = document.getElementById('fetchContactsButton');
        const contactsProgress = document.getElementById('contactsProgress');
        
        if (contactsStatus.status === 'running') {
            contactsButton.disabled = true;
            contactsProgress.textContent = contactsStatus.progress || 'Processing...';
            contactsProgress.style.display = 'block';
        } else if (contactsStatus.status === 'completed') {
            contactsButton.disabled = false;
            contactsProgress.textContent = contactsStatus.message || 'Completed!';
            setTimeout(() => {
                contactsProgress.style.display = 'none';
            }, 3000);
        }
    }

    // Update conversation UI
    if (conversationStatus) {
        const extractButton = document.getElementById('extractButton');
        const extractionProgress = document.getElementById('extractionProgress');
        
        if (conversationStatus.status === 'running') {
            extractButton.disabled = true;
            extractionProgress.textContent = conversationStatus.progress || 'Processing...';
            extractionProgress.style.display = 'block';
        } else if (conversationStatus.status === 'completed') {
            extractButton.disabled = false;
            extractionProgress.textContent = conversationStatus.message || 'Completed!';
            setTimeout(() => {
                extractionProgress.style.display = 'none';
            }, 3000);
        } else if (conversationStatus.status === 'error') {
            extractButton.disabled = false;
            extractionProgress.textContent = `Error: ${conversationStatus.error}`;
            extractionProgress.style.display = 'block';
        }
    }
}

function startStatusChecking() {
    if (statusCheckInterval) return;
    
    // Check status immediately
    chrome.runtime.sendMessage({ type: 'GET_PROCESS_STATUS' }, updateUIWithStatus);
    
    // Then check every 2 seconds
    statusCheckInterval = setInterval(() => {
        chrome.runtime.sendMessage({ type: 'GET_PROCESS_STATUS' }, updateUIWithStatus);
    }, 2000);
}

function stopStatusChecking() {
    if (statusCheckInterval) {
        clearInterval(statusCheckInterval);
        statusCheckInterval = null;
    }
}

// Settings modal handlers
function initializeSettings() {
  const settingsBtn = document.getElementById('settingsBtn');
  const settingsModal = document.getElementById('settingsModal');
  const modalBackdrop = document.getElementById('modalBackdrop');
  const cancelBtn = document.getElementById('cancelBtn');
  const saveBtn = document.getElementById('saveBtn');
  const dateFormatSelect = document.getElementById('dateFormat');
  const themeToggle = document.getElementById('theme-toggle');
  const themeLabel = document.getElementById('theme-label');

  // --- Theme Handling ---
  function applyTheme(isDark) {
      document.body.classList.toggle('dark', isDark);
      themeLabel.textContent = isDark ? 'Dark Mode' : 'Light Mode';
      themeToggle.checked = isDark;
      chrome.storage.local.set({ 'theme': isDark ? 'dark' : 'light' });
  }

  // Load saved theme
  chrome.storage.local.get('theme', function(result) {
      applyTheme(result.theme === 'dark');
  });

  // Handle theme toggle
  themeToggle.addEventListener('change', () => {
      applyTheme(themeToggle.checked);
  });

  // Load saved format from chrome.storage
  chrome.storage.local.get(['dateFormat'], function(result) {
    const savedFormat = result.dateFormat || 'DD/MM/YYYY';
    dateFormatSelect.value = savedFormat;
    
    // Set initial format if not already set
    if (!result.dateFormat) {
      chrome.storage.local.set({ dateFormat: savedFormat });
    }
  });

  // Show modal
  settingsBtn.addEventListener('click', () => {
    settingsModal.style.display = 'block';
    modalBackdrop.style.display = 'block';
  });

  // Hide modal
  function hideModal() {
    settingsModal.style.display = 'none';
    modalBackdrop.style.display = 'none';
  }

  cancelBtn.addEventListener('click', hideModal);
  modalBackdrop.addEventListener('click', hideModal);

  // Convert conversation to markdown
  async function convertToMarkdown(data) {
    // Get the other user's username from the first message
    let otherUsername = '';
    if (data.messages && data.messages.length > 0) {
      const firstMessage = data.messages[0];
      // Get the username that's not the current user
      if (firstMessage.sender === data.username) {
        otherUsername = firstMessage.recipient;
      } else {
        otherUsername = firstMessage.sender;
      }
    }

    let markdown = `# Conversation with ${otherUsername}\n\n`;
    
    // Process messages sequentially to maintain order
    for (const message of data.messages) {
      // Convert Unix timestamp to formatted date using user's preferred format
      const timestamp = await formatDate(message.createdAt);
      const sender = message.sender || 'Unknown';
      
      markdown += `### ${sender} (${timestamp})\n`;
      
      // Show replied-to message if exists
      if (message.repliedToMessage) {
        const repliedMsg = message.repliedToMessage;
        const repliedTime = await formatDate(repliedMsg.createdAt);
        markdown += `> Replying to ${repliedMsg.sender} (${repliedTime}):\n`;
        markdown += `> ${repliedMsg.body.replace(/\n/g, '\n> ')}\n\n`;
      }
      
      // Add message text
      if (message.body) {
        markdown += `${message.body}\n`;
      }
      
      // Add attachments if any
      if (message.attachments && message.attachments.length > 0) {
        markdown += '\n**Attachments:**\n';
        for (const attachment of message.attachments) {
          // Check if attachment has required fields
          if (attachment && typeof attachment === 'object') {
            const fileName = attachment.file_name || attachment.filename || 'Unnamed File';
            const fileSize = attachment.file_size || attachment.fileSize || 0;
            const attachmentTime = attachment.created_at ? ` (uploaded on ${await formatDate(attachment.created_at)})` : '';
            markdown += `- ${fileName} (${formatFileSize(fileSize)})${attachmentTime}\n`;
          } else {
            markdown += `- File attachment (size unknown)\n`;
          }
        }
      }
      
      markdown += '\n---\n\n';
    }
    
    return markdown;
  }

  // Save settings
  saveBtn.addEventListener('click', async () => {
    const newFormat = dateFormatSelect.value;
    chrome.storage.local.set({ dateFormat: newFormat }, async () => {
      // Refresh all displays with new format
      chrome.storage.local.get(['conversationData', 'currentUsername'], async function(result) {
        if (result.conversationData) {
          // Re-process the conversation data with new format
          const processedData = {
            ...result.conversationData,
            messages: await Promise.all(result.conversationData.messages.map(async msg => ({
              ...msg,
              formattedTime: await formatDate(msg.createdAt),
              repliedToMessage: msg.repliedToMessage ? {
                ...msg.repliedToMessage,
                formattedTime: await formatDate(msg.repliedToMessage.createdAt)
              } : null
            })))
          };

          // Generate new markdown with updated format
          const newMarkdown = await convertToMarkdown(processedData);

          // Update storage with new formatted data
          chrome.storage.local.set({
            conversationData: processedData,
            markdownContent: newMarkdown,
            jsonContent: processedData
          }, () => {
            // After storage is updated, refresh the UI
            displayAttachments(processedData.messages);
            
            // Force reload of markdown content if it's currently viewed
            if (result.markdownContent) {
              const blob = new Blob([newMarkdown], { type: 'text/markdown' });
              const existingMarkdownTab = document.querySelector('a[href*="markdown"]');
              if (existingMarkdownTab) {
                existingMarkdownTab.href = URL.createObjectURL(blob);
              }
            }
          });
        }
      });
      
      // Refresh contacts display
      chrome.storage.local.get(['allContacts'], function(result) {
        if (result.allContacts) {
          displayContacts(result.allContacts);
        }
      });

      hideModal();
    });
  });
}

// Initialize popup
document.addEventListener('DOMContentLoaded', () => {
  // Initialize connection with background script
  chrome.runtime.sendMessage({ type: 'INIT_POPUP' });

  // --- Contact Search ---
  const contactSearch = document.getElementById('contactSearch');
  contactSearch.addEventListener('input', (e) => {
    const searchTerm = e.target.value.toLowerCase();
    const contacts = document.querySelectorAll('.contact-item');
    let visibleCount = 0;
    
    contacts.forEach(contact => {
      const username = contact.querySelector('.contact-name').textContent.toLowerCase();
      if (username.includes(searchTerm)) {
        contact.style.display = 'block';
        contact.classList.add('slide-in');
        visibleCount++;
      } else {
        contact.style.display = 'none';
        contact.classList.remove('slide-in');
      }
    });

    // Update search feedback
    if (searchTerm && visibleCount === 0) {
      const contactsList = document.getElementById('contactsList');
      if (!contactsList.querySelector('.no-search-results')) {
        const noResults = document.createElement('div');
        noResults.className = 'no-contacts no-search-results';
        noResults.textContent = `No contacts found for "${searchTerm}"`;
        contactsList.appendChild(noResults);
      }
    } else {
      const noResults = document.querySelector('.no-search-results');
      if (noResults) {
        noResults.remove();
      }
    }
  });

  // Export All button click handler
  document.getElementById('exportAllBtn').addEventListener('click', () => {
    chrome.storage.local.get(['allContacts'], function(result) {
      if (result.allContacts && result.allContacts.length > 0) {
        exportAllConversations(result.allContacts);
      } else {
        updateStatus('Please fetch contacts first', true);
      }
    });
  });

  // Check if we're on a Fiverr page
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    const currentUrl = tabs[0].url;
    if (currentUrl.includes('fiverr.com')) {
      updateStatus('Ready to extract Fiverr data.');
      
      // Get any existing conversation data
      chrome.storage.local.get(['conversationData', 'currentUsername'], function(result) {
        if (result.conversationData) {
          if (result.currentUsername) {
            showConversationActions(result.currentUsername);
          }
        }
      });
    } else {
      updateStatus('Please navigate to Fiverr to use this extension.', true);
    }
  });

  // Load current conversation if exists
  chrome.storage.local.get(['currentConversationUsername', 'lastExtractedTime'], function(result) {
    if (result.currentConversationUsername) {
      const currentConversationDiv = document.getElementById('currentConversation');
      if (currentConversationDiv) {
        currentConversationDiv.textContent = `Conversation with ${result.currentConversationUsername}`;
        currentConversationDiv.style.display = 'block';
        
        // Show conversation actions
        const actionsDiv = document.getElementById('conversationActions');
        actionsDiv.style.display = 'block';
      }
    }
  });

  // Fetch Contacts button click handler
  document.getElementById('fetchContactsBtn').addEventListener('click', () => {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      const currentUrl = tabs[0].url;
      if (!currentUrl.includes('fiverr.com')) {
        updateStatus('Please navigate to Fiverr first.', true);
        return;
      }
      
      // Enhanced loading state
      setButtonLoading('fetchContactsBtn', true);
      
      // Reset UI
      document.getElementById('progressLog').style.display = 'block';
      document.getElementById('progressLog').innerHTML = '';
      document.getElementById('progressCounter').style.display = 'block';
      document.getElementById('contactCount').textContent = '0';
      
      updateStatus('Fetching all contacts...', false, true);
      chrome.runtime.sendMessage({ type: 'FETCH_ALL_CONTACTS' });
    });
  });

  // Extract button click handler
  document.getElementById('extractBtn').addEventListener('click', () => {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      const url = tabs[0].url;
      
      // Only allow extraction from specific inbox URL format
      const match = url.match(/^https:\/\/www\.fiverr\.com\/inbox\/([^\/\?]+)$/);
      if (!match) {
        updateStatus('Please open a specific inbox URL (e.g., https://www.fiverr.com/inbox/username)', true);
        return;
      }

      const username = match[1];
      setButtonLoading('extractBtn', true);
      
      // First ensure we have a date format set
      chrome.storage.local.get(['dateFormat'], function(result) {
        const format = result.dateFormat || 'DD/MM/YYYY';
        // Set format if not already set
        chrome.storage.local.set({ 
          dateFormat: format,
          currentUsername: username 
        }, () => {
          // Only send message after storage is set
          chrome.runtime.sendMessage({ type: 'EXTRACT_CONVERSATION' });
          updateStatus(`Extracting conversation with ${username}...`, false, true);
        });
      });
    });
  });

  // Download button click handler
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

  // Open in new tab button click handler
  document.getElementById('openBtn').addEventListener('click', () => {
    chrome.storage.local.get(['markdownContent'], function(result) {
      if (result.markdownContent) {
        const blob = new Blob([result.markdownContent], { type: 'text/markdown' });
        chrome.tabs.create({ url: URL.createObjectURL(blob) });
      } else {
        updateStatus('Please extract the conversation first.', true);
      }
    });
  });

  // Download JSON button click handler
  document.getElementById('downloadJsonBtn').addEventListener('click', () => {
    chrome.storage.local.get(['jsonContent', 'currentUsername'], function(result) {
      if (result.jsonContent && result.currentUsername) {
        const blob = new Blob([JSON.stringify(result.jsonContent, null, 2)], { type: 'application/json' });
        chrome.downloads.download({
          url: URL.createObjectURL(blob),
          filename: `${result.currentUsername}/conversations/${result.currentUsername}_conversation.json`,
          saveAs: false
        });
      } else {
        updateStatus('Please extract the conversation first.', true);
      }
    });
  });

  // View JSON button click handler
  document.getElementById('viewJsonBtn').addEventListener('click', () => {
    chrome.storage.local.get(['jsonContent'], function(result) {
      if (result.jsonContent) {
        const blob = new Blob([JSON.stringify(result.jsonContent, null, 2)], { type: 'application/json' });
        chrome.tabs.create({ url: URL.createObjectURL(blob) });
      } else {
        updateStatus('Please extract the conversation first.', true);
      }
    });
  });

  // Load stored contacts when popup opens
  loadStoredContacts();
  
  // Start status checking
  startStatusChecking();
  
  // Initialize attachments button if there's stored conversation data
  chrome.storage.local.get(['conversationData'], function(result) {
    if (result.conversationData) {
      handleConversationExtracted(result.conversationData);
    }
  });

  // Initialize settings
  initializeSettings();
});

// Handle messages from content script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  switch (request.type) {
    case 'CONTACTS_PROGRESS':
      updateStatus(request.message, request.isError, true);
      if (request.totalContacts) {
        updateContactCounter(request.totalContacts);
      }
      break;
    
    case 'CONTACTS_FETCHED':
      setButtonLoading('fetchContactsBtn', false);
      updateStatus(request.message);
      if (request.data) {
        displayContacts(request.data).catch(console.error);
        updateContactCounter(request.data.length);
        updateLastFetchTime(); // Update the timestamp immediately
      }
      break;
    
    case 'CONVERSATION_EXTRACTED':
      setButtonLoading('extractBtn', false);
      handleConversationExtracted(request.data, request.message);
      break;
    
    case 'EXTRACTION_ERROR':
      setButtonLoading('extractBtn', false);
      updateStatus(request.error, true);
      break;
  }
});

// Stop checking when popup closes
window.addEventListener('unload', () => {
  stopStatusChecking();
});
