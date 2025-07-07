// Import Firebase functions
import { UserSubscription } from './firebase-auth.js';

document.addEventListener('DOMContentLoaded', () => {
    const statusMessage = document.getElementById('statusMessage');
    const status = document.getElementById('status');
    const googleAuth = document.getElementById('googleAuth');
    const googleSignIn = document.getElementById('googleSignIn');
    const closeButton = document.getElementById('closeButton');

    // Function to update the status message on the page
    function updateStatus(message, isError = false) {
        statusMessage.textContent = message;
        statusMessage.className = isError ? 'status-error' : 'status-success';
    }

    // Function to get the current user from storage
    async function getCurrentUser() {
        return new Promise((resolve) => {
            chrome.storage.local.get(['userId', 'userEmail', 'isAuthenticated'], (result) => {
                if (result.isAuthenticated && result.userId && result.userEmail) {
                    resolve({ uid: result.userId, email: result.userEmail });
                } else {
                    resolve(null);
                }
            });
        });
    }

    // Main function to process the payment and subscription
    async function processSubscription() {
        const urlParams = new URLSearchParams(window.location.search);
        const sessionId = urlParams.get('session_id');

        if (!sessionId) {
            updateStatus('Error: No session ID found. Cannot activate subscription.', true);
            return;
        }

        updateStatus('Verifying payment and activating subscription...');
        const currentUser = await getCurrentUser();

        if (!currentUser) {
            updateStatus('User not signed in. Please sign in to the extension to activate your subscription.', true);
            return;
        }

        try {
            const subscriptionData = {
                isPro: true,
                status: 'active',
                stripeCustomerId: null, // This can be updated later via webhooks if needed
                subscriptionId: sessionId,
            };

            // Update user's status in Firestore
            await UserSubscription.updateSubscriptionStatus(currentUser.uid, subscriptionData);
            
            // Also update local storage for immediate UI changes
            chrome.storage.local.set({ isPro: true, subscriptionStatus: 'active' });

            // Notify the extension that the subscription has been updated
            chrome.runtime.sendMessage({ type: 'SUBSCRIPTION_UPDATED', subscriptionData }, () => {
                if (chrome.runtime.lastError) {
                    console.error('Error sending update message:', chrome.runtime.lastError);
                    updateStatus('Subscription activated, but failed to refresh extension. Please reopen it.', true);
                } else {
                    updateStatus('Subscription activated! Opening extension in new tab...');
                    // Open the main extension interface in a new tab
                    setTimeout(() => {
                        chrome.tabs.create({ url: chrome.runtime.getURL('popup.html') });
                        // Keep the success tab open for reference
                    }, 2000); // 2-second delay for the user to see the message
                }
            });
        } catch (error) {
            console.error('Error activating subscription:', error);
            updateStatus(`An error occurred: ${error.message}`, true);
        }
    }

    // Google Authentication (keeping for backward compatibility but hiding)
    googleSignIn.addEventListener('click', () => {
        // This is now handled by Firebase authentication in the main extension
        statusMessage.innerHTML = 'Please use the main extension login instead.';
    });

    // Close button
    closeButton.addEventListener('click', () => {
        // Open extension in new tab instead of closing
        chrome.tabs.create({ url: chrome.runtime.getURL('popup.html') });
    });

    processSubscription();

    // Auto-open extension after 30 seconds if user doesn't interact
    setTimeout(() => {
        if (confirm('Open the extension in a new tab to start using your Pro features?')) {
            chrome.tabs.create({ url: chrome.runtime.getURL('popup.html') });
        }
    }, 30000);
}); 