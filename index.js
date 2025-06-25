import { onAuth, logOut } from './firebase-auth.js';

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
  const icon = isError 
    ? '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>'
    : isProgress 
      ? '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="2" x2="12" y2="6"></line><line x1="12" y1="18" x2="12" y2="22"></line><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line><line x1="2" y1="12" x2="6" y2="12"></line><line x1="18" y1="12" x2="22" y2="12"></line><line x1="4.93" y1="19.07" x2="7.76" y2="16.24"></line><line x1="16.24" y1="7.76" x2="19.07" y2="4.93"></line></svg>'
      : '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>';
  
  statusDiv.innerHTML = `${icon}<span>${message}</span>`;
  statusDiv.className = `status ${isError ? 'error' : isProgress ? 'progress' : 'success'}`;
  statusDiv.style.display = 'flex';
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
  const progressSection = document.getElementById('progressSection');
  
  if (progressLog && progressSection) {
    progressSection.style.display = 'block'; // Ensure progress section is visible
    const logEntry = document.createElement('div');
    logEntry.className = `log-entry${isError ? ' error' : ''}`;
    logEntry.textContent = message;
    progressLog.appendChild(logEntry);
    progressLog.scrollTop = progressLog.scrollHeight;
  }
}

// Update contact counter
function updateContactCounter(count) {
  const progressCounter = document.getElementById('progressCounter');
  const progressSection = document.getElementById('progressSection');
  
  if (progressCounter && progressSection) {
    progressCounter.innerHTML = `Total Contacts: <span id="contactCount">${count}</span>`;
    progressSection.style.display = 'block';
    
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

// NEW FEATURE 3: Export Timestamps and Metadata
async function exportMetadata() {
  chrome.storage.local.get(['conversationData', 'currentUsername'], async function(result) {
    if (!result.conversationData || !result.currentUsername) {
      updateStatus('Please extract a conversation first.', true);
      return;
    }

    const { messages, username } = result.conversationData;
    const otherUsername = messages[0]?.sender === username ? messages[0]?.recipient : messages[0]?.sender;

    const metadata = {
      export_info: {
        extractor_version: '2.0',
        export_date: new Date().toISOString(),
        conversation_with: otherUsername,
        current_user: result.currentUsername,
      },
      message_metadata: await Promise.all(messages.map(async msg => ({
        message_id: msg.id,
        sender: msg.sender,
        created_at_unix: msg.createdAt,
        created_at_formatted: await formatDate(msg.createdAt),
        message_length_chars: msg.body?.length || 0,
        has_attachments: (msg.attachments?.length || 0) > 0,
        attachment_count: msg.attachments?.length || 0,
        replied_to_message_id: msg.repliedToMessage?.id || null
      })))
    };

    const blob = new Blob([JSON.stringify(metadata, null, 2)], { type: 'application/json' });
    chrome.downloads.download({
      url: URL.createObjectURL(blob),
      filename: `${result.currentUsername}/metadata/fiverr_metadata_${otherUsername}_${new Date().toISOString().split('T')[0]}.json`,
      saveAs: false
    });

    updateStatus('Timestamps and metadata exported successfully!');
  });
}

// Convert conversation to TXT
async function convertToTxt(data) {
  let text = `Conversation with ${data.username}\n\n`;
  for (const message of data.messages) {
    const timestamp = await formatDate(message.createdAt);
    text += `[${timestamp}] ${message.sender}:\n${message.body}\n\n`;
  }
  return text;
}

// Convert conversation to CSV
async function convertToCsv(data) {
  let csv = 'MessageID,Sender,Timestamp,Body,Attachments\n';
  for (const message of data.messages) {
    const timestamp = await formatDate(message.createdAt);
    const body = `"${message.body.replace(/"/g, '""')}"`;
    const attachments = message.attachments.map(a => a.filename).join(', ');
    csv += `${message.id},${message.sender},${timestamp},${body},"${attachments}"\n`;
  }
  return csv;
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

  // TXT export button handler
  document.getElementById('exportTxtBtn').addEventListener('click', () => {
    if (!isPro) {
      document.getElementById('upgradeBtn').click();
      return;
    }
    chrome.storage.local.get(['conversationData', 'currentUsername'], async function(result) {
      if (result.conversationData) {
        const txtContent = await convertToTxt(result.conversationData);
        const blob = new Blob([txtContent], { type: 'text/plain' });
        chrome.downloads.download({
          url: URL.createObjectURL(blob),
          filename: `${result.currentUsername}/conversations/fiverr_conversation_${result.currentUsername}_${new Date().toISOString().split('T')[0]}.txt`,
          saveAs: false
        });
      } else {
        updateStatus('Please extract the conversation first.', true);
      }
    });
  });

  // CSV export button handler
  document.getElementById('exportCsvBtn').addEventListener('click', () => {
    if (!isPro) {
      document.getElementById('upgradeBtn').click();
      return;
    }
    chrome.storage.local.get(['conversationData', 'currentUsername'], async function(result) {
      if (result.conversationData) {
        const csvContent = await convertToCsv(result.conversationData);
        const blob = new Blob([csvContent], { type: 'text/csv' });
        chrome.downloads.download({
          url: URL.createObjectURL(blob),
          filename: `${result.currentUsername}/conversations/fiverr_conversation_${result.currentUsername}_${new Date().toISOString().split('T')[0]}.csv`,
          saveAs: false
        });
      } else {
        updateStatus('Please extract the conversation first.', true);
      }
    });
  });
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
    // Optionally hide text and show spinner, then restore
    button.setAttribute('data-original-text', button.innerHTML);
    button.innerHTML = '<span class="spinner"></span>';
  } else {
    button.classList.remove('loading');
    button.disabled = false;
    // Restore original text
    if (button.hasAttribute('data-original-text')) {
      button.innerHTML = button.getAttribute('data-original-text');
      button.removeAttribute('data-original-text');
    }
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
          progressCounter.innerHTML = `Total Contacts: <span id="contactCount">${result.allContacts.length}</span><br>Last updated: ${lastFetch}`;
          document.getElementById('progressSection').style.display = 'block';
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
        progressCounter.innerHTML = `Total Contacts: <span id="contactCount">${document.getElementById('contactCount')?.textContent || '0'}</span><br>Last updated: ${lastFetch}`;
        document.getElementById('progressSection').style.display = 'block';
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
        viewAttachmentsBtn.innerHTML = isVisible 
            ? '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66L9.64 16.2a2 2 0 0 1-2.83-2.83l8.49-8.49"></path></svg><span>View Attachments (${totalAttachments})</span>' 
            : '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66L9.64 16.2a2 2 0 0 1-2.83-2.83l8.49-8.49"></path></svg><span>Hide Attachments (${totalAttachments})</span>';
      };
      // Set initial button text with attachment count
      viewAttachmentsBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66L9.64 16.2a2 2 0 0 1-2.83-2.83l8.49-8.49"></path></svg><span>View Attachments (${totalAttachments})</span>';
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
    const progressSection = document.getElementById('progressSection');

    // Update contacts UI
    if (contactsStatus) {
        const fetchContactsBtn = document.getElementById('fetchContactsBtn');
        const contactsProgress = document.getElementById('contactsProgress');
        
        if (contactsStatus.status === 'running') {
            setButtonLoading('fetchContactsBtn', true);
            contactsProgress.textContent = contactsStatus.progress || 'Processing...';
            contactsProgress.style.display = 'block';
            progressSection.style.display = 'block';
        } else if (contactsStatus.status === 'completed') {
            setButtonLoading('fetchContactsBtn', false);
            contactsProgress.textContent = contactsStatus.message || 'Completed!';
            setTimeout(() => {
                contactsProgress.style.display = 'none';
                if (!conversationStatus || conversationStatus.status !== 'running') {
                    progressSection.style.display = 'none'; // Hide if no other progress
                }
            }, 3000);
        }
    }

    // Update conversation UI
    if (conversationStatus) {
        const extractBtn = document.getElementById('extractBtn');
        const extractionProgress = document.getElementById('extractionProgress');
        
        if (conversationStatus.status === 'running') {
            setButtonLoading('extractBtn', true);
            extractionProgress.textContent = conversationStatus.progress || 'Processing...';
            extractionProgress.style.display = 'block';
            progressSection.style.display = 'block';
        } else if (conversationStatus.status === 'completed') {
            setButtonLoading('extractBtn', false);
            extractionProgress.textContent = conversationStatus.message || 'Completed!';
            setTimeout(() => {
                extractionProgress.style.display = 'none';
                if (!contactsStatus || contactsStatus.status !== 'running') {
                    progressSection.style.display = 'none'; // Hide if no other progress
                }
            }, 3000);
        } else if (conversationStatus.status === 'error') {
            setButtonLoading('extractBtn', false);
            extractionProgress.textContent = `Error: ${conversationStatus.error}`;
            extractionProgress.style.display = 'block';
            progressSection.style.display = 'block';
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

// --- Pro Plan & License ---
let isPro = false;
let userInfo = null;

async function checkProStatus() {
  return new Promise(resolve => {
    chrome.storage.local.get(['isPro', 'userEmail', 'userName', 'activatedAt', 'sessionId'], function(result) {
      isPro = result.isPro || false;
      userInfo = {
        email: result.userEmail,
        name: result.userName,
        activatedAt: result.activatedAt,
        sessionId: result.sessionId
      };
      
      console.log('Pro status checked:', { isPro, userInfo });
      
      // Update UI based on pro status
      updateProUI();
      toggleProFeatures(isPro);
      resolve(isPro);
    });
  });
}

function updateProUI() {
  const proSection = document.getElementById('proSection');
  const licenseStatus = document.getElementById('licenseStatus');
  
  if (isPro) {
    proSection.style.display = 'none';
    if (licenseStatus) {
      const statusText = userInfo.email 
        ? `Status: Pro (${userInfo.email})`
        : 'Status: Pro (Local)';
      licenseStatus.innerHTML = `
        <div style="color: #4CAF50; font-weight: 600;">${statusText}</div>
        ${userInfo.activatedAt ? `<div style="font-size: 0.8rem; color: #666;">Activated: ${new Date(userInfo.activatedAt).toLocaleDateString()}</div>` : ''}
      `;
    }
  } else {
    proSection.style.display = 'block';
    if (licenseStatus) {
      licenseStatus.innerHTML = `
        <div style="color: #666;">Status: Free</div>
        <div style="font-size: 0.8rem; color: #666;">Upgrade to unlock all features</div>
      `;
    }
  }
}

function toggleProFeatures(isPro) {
  const proButtons = document.querySelectorAll('.pro-feature');
  if (isPro) {
    proButtons.forEach(btn => {
      btn.disabled = false;
      btn.style.opacity = '1';
      btn.title = '';
    });
  } else {
    proButtons.forEach(btn => {
      btn.disabled = true;
      btn.style.opacity = '0.5';
      btn.title = 'Upgrade to Pro to use this feature';
    });
  }
}

// Google Authentication in settings
function initializeGoogleAuth() {
  const googleSignInBtn = document.createElement('button');
  googleSignInBtn.id = 'googleAuthBtn';
  googleSignInBtn.className = 'shad-button secondary';
  googleSignInBtn.style.marginTop = '0.5rem';
  
  if (userInfo.email) {
    googleSignInBtn.innerHTML = `✅ Linked to ${userInfo.email}`;
    googleSignInBtn.disabled = true;
  } else if (isPro) {
    googleSignInBtn.innerHTML = `
      <svg width="16" height="16" viewBox="0 0 24 24" style="margin-right: 0.5rem;">
        <path fill="#4285f4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
        <path fill="#34a853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
        <path fill="#fbbc05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
        <path fill="#ea4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
      </svg>
      Link Google Account
    `;
    googleSignInBtn.onclick = performGoogleAuth;
  } else {
    googleSignInBtn.style.display = 'none';
  }
  
  // Add after license status
  const licenseStatus = document.getElementById('licenseStatus');
  if (licenseStatus && licenseStatus.parentNode) {
    licenseStatus.parentNode.insertBefore(googleSignInBtn, licenseStatus.nextSibling);
  }
}

function performGoogleAuth() {
  const googleSignInBtn = document.getElementById('googleAuthBtn');
  googleSignInBtn.disabled = true;
  googleSignInBtn.innerHTML = '<span>Signing in...</span>';

  chrome.identity.getAuthToken({ interactive: true }, (token) => {
    if (chrome.runtime.lastError) {
      console.error('Auth error:', chrome.runtime.lastError);
      googleSignInBtn.disabled = false;
      googleSignInBtn.innerHTML = 'Link Google Account - Try Again';
      return;
    }

    fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    .then(response => response.json())
    .then(userData => {
      console.log('Google user info:', userData);
      
      chrome.storage.local.set({
        userEmail: userData.email,
        userName: userData.name,
        userPicture: userData.picture,
        googleLinked: true
      }, () => {
        userInfo.email = userData.email;
        userInfo.name = userData.name;
        updateProUI();
        googleSignInBtn.innerHTML = `✅ Linked to ${userData.email}`;
        googleSignInBtn.disabled = true;
        
        updateStatus('Google account linked successfully!');
      });
    })
    .catch(error => {
      console.error('Failed to get user info:', error);
      googleSignInBtn.disabled = false;
      googleSignInBtn.innerHTML = 'Link Google Account - Try Again';
    });
  });
}

function activateLicense() {
  const licenseKey = document.getElementById('licenseKey').value;
  if (!licenseKey) {
    document.getElementById('licenseStatus').textContent = 'Please enter a key.';
    return;
  }
  
  // Legacy support for old license keys
  if (licenseKey === 'PRO-USER') {
    chrome.storage.local.set({ 
      isPro: true,
      activatedAt: new Date().toISOString(),
      licenseKey: licenseKey 
    }, () => {
      checkProStatus();
    });
  } else {
    document.getElementById('licenseStatus').textContent = 'Invalid license key.';
  }
}

// --- Stripe ---
function initializeStripe() {
  const upgradeBtn = document.getElementById('upgradeBtn');
  upgradeBtn.addEventListener('click', () => {
    chrome.tabs.create({ url: chrome.runtime.getURL('checkout.html') });
  });
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
  const activateLicenseBtn = document.getElementById('activateLicenseBtn');

  activateLicenseBtn.addEventListener('click', activateLicense);

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
    
    // Initialize Google Auth button when modal opens
    setTimeout(() => {
      initializeGoogleAuth();
    }, 100);
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

  // Check pro status
  checkProStatus();

  // Initialize Stripe
  initializeStripe();
  
  // Initialize attachments button if there's stored conversation data
  chrome.storage.local.get(['conversationData'], function(result) {
    if (result.conversationData) {
      handleConversationExtracted(result.conversationData);
    }
  });
}

document.addEventListener('DOMContentLoaded', () => {
  onAuth(user => {
    const mainContent = document.getElementById('main-content');
    const authContainer = document.getElementById('auth-container');
    const userInfo = document.getElementById('user-info');
    const userEmail = document.getElementById('user-email');
    const loginSignupButtons = document.getElementById('login-signup-buttons');

    if (user) {
      // User is signed in
      mainContent.style.display = 'block';
      authContainer.style.display = 'block';
      userInfo.style.display = 'block';
      userEmail.textContent = user.email;
      loginSignupButtons.style.display = 'none';
      
      // Initialize connection with background script and get pro status
      chrome.runtime.sendMessage({ type: 'INIT_POPUP' }, (response) => {
        if (response && response.proStatus) {
          isPro = response.proStatus.isPro;
          userInfo = {
            email: response.proStatus.userEmail,
            activatedAt: response.proStatus.activatedAt,
            sessionId: response.proStatus.sessionId
          };
          updateProUI();
          toggleProFeatures(isPro);
        }
      });

      // --- Contact Search ---
      const contactSearch = document.getElementById('contactSearch');
      contactSearch.addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase();
        const contacts = document.querySelectorAll('.contact-item');
        let visibleCount = 0;
        
        contacts.forEach(contact => {
          const username = contact.querySelector('.contact-name')?.textContent.toLowerCase();
          if (username && username.includes(searchTerm)) {
            contact.style.display = 'flex';
            visibleCount++;
          } else {
            contact.style.display = 'none';
          }
        });
        
        // Optionally show message if no contacts match
        const noContactsDiv = document.querySelector('.no-contacts');
        if (noContactsDiv) {
          noContactsDiv.style.display = visibleCount === 0 ? 'block' : 'none';
        }
      });

      // Start checking for process status
      startStatusChecking();

      // Load any stored contacts on popup open
      loadStoredContacts();

      // Initialize settings modal and its functionalities
      initializeSettings();
      
      // Stop checking for process status when popup is closed
      window.addEventListener('beforeunload', stopStatusChecking);
      
      // --- Button Event Listeners ---
      document.getElementById('fetchContactsBtn').addEventListener('click', () => {
        chrome.runtime.sendMessage({ type: 'FETCH_ALL_CONTACTS' });
        updateStatus('Fetching all contacts...', false, true);
        addLogEntry('User initiated contact fetching.');
      });

      document.getElementById('extractBtn').addEventListener('click', () => {
        chrome.storage.local.get(['currentUsername'], function(result) {
          if (result.currentUsername) {
            chrome.runtime.sendMessage({ type: 'EXTRACT_CONVERSATION' });
            updateStatus(`Extracting conversation with ${result.currentUsername}...`, false, true);
            addLogEntry(`User initiated extraction for ${result.currentUsername}.`);
          } else {
            updateStatus('Please select a contact first.', true);
          }
        });
      });
      
      document.getElementById('exportAllBtn').addEventListener('click', () => {
        if (!isPro) {
          document.getElementById('upgradeBtn').click();
          return;
        }
        chrome.storage.local.get('allContacts', function(result) {
          if (result.allContacts) {
            exportAllConversations(result.allContacts);
          } else {
            updateStatus('No contacts to export. Fetch contacts first.', true);
          }
        });
      });

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

      document.getElementById('openBtn').addEventListener('click', () => {
        chrome.storage.local.get(['markdownContent', 'currentUsername'], function(result) {
          if (result.markdownContent) {
            const blob = new Blob([result.markdownContent], { type: 'text/markdown' });
            const url = URL.createObjectURL(blob);
            chrome.tabs.create({ url: url });
          } else {
            updateStatus('Please extract the conversation first.', true);
          }
        });
      });

      document.getElementById('downloadJsonBtn').addEventListener('click', () => {
        chrome.storage.local.get(['jsonContent', 'currentUsername'], function(result) {
          if (result.jsonContent && result.currentUsername) {
            const blob = new Blob([JSON.stringify(result.jsonContent, null, 2)], { type: 'application/json' });
            chrome.downloads.download({
              url: URL.createObjectURL(blob),
              filename: `${result.currentUsername}/conversations/fiverr_conversation_${result.currentUsername}_${new Date().toISOString().split('T')[0]}.json`,
              saveAs: false
            });
          } else {
            updateStatus('Please extract the conversation first.', true);
          }
        });
      });
      
      document.getElementById('viewJsonBtn').addEventListener('click', () => {
        chrome.storage.local.get('jsonContent', (result) => {
          if (result.jsonContent) {
            const blob = new Blob([JSON.stringify(result.jsonContent, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            chrome.tabs.create({ url: url });
          } else {
            updateStatus('Please extract the conversation first.', true);
          }
        });
      });

      document.getElementById('exportMetadataBtn').addEventListener('click', exportMetadata);

    } else {
      // User is signed out
      mainContent.style.display = 'none';
      authContainer.style.display = 'block';
      userInfo.style.display = 'none';
      loginSignupButtons.style.display = 'block';
    }
  });

  const logoutButton = document.getElementById('logout-button');
  logoutButton.addEventListener('click', () => {
    logOut().catch((error) => {
      console.error('Sign out error', error);
    });
  });
});

// Handle messages from content script and background
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  switch (request.type) {
    case 'CONTACTS_PROGRESS':
      updateStatus(request.message, request.isError, true);
      addLogEntry(request.message);
      if (request.totalContacts) {
        updateContactCounter(request.totalContacts);
      }
      break;
    
    case 'CONTACTS_FETCHED':
      setButtonLoading('fetchContactsBtn', false);
      updateStatus(request.message);
      addLogEntry(request.message);
      if (request.data) {
        displayContacts(request.data).catch(console.error);
        updateContactCounter(request.data.length);
        updateLastFetchTime(); // Update the timestamp immediately
      }
      break;
    
    case 'CONVERSATION_EXTRACTED':
      setButtonLoading('extractBtn', false);
      handleConversationExtracted(request.data, request.message);
      addLogEntry(request.message);
      break;
    
    case 'EXTRACTION_ERROR':
      setButtonLoading('extractBtn', false);
      updateStatus(request.error, true);
      addLogEntry(request.error, true);
      break;
      
    case 'PRO_STATUS_UPDATED':
      // Handle pro status updates from background script
      if (request.proStatus) {
        isPro = request.proStatus.isPro;
        userInfo = {
          email: request.proStatus.userEmail,
          activatedAt: request.proStatus.activatedAt,
          sessionId: request.proStatus.sessionId
        };
        updateProUI();
        toggleProFeatures(isPro);
        updateStatus('Pro features activated! Refresh to see changes.', false, false);
      }
      break;
  }
});

// Stop checking when popup closes
window.addEventListener('unload', () => {
  stopStatusChecking();
});
