// Import Firebase functions
import { UserSubscription } from './firebase-auth.js';

document.addEventListener('DOMContentLoaded', () => {
    const statusMessage = document.getElementById('statusMessage');
    const status = document.getElementById('status');
    const googleAuth = document.getElementById('googleAuth');
    const googleSignIn = document.getElementById('googleSignIn');
    const closeButton = document.getElementById('closeButton');

    // Get session ID from URL
    const urlParams = new URLSearchParams(window.location.search);
    const sessionId = urlParams.get('session_id');

    console.log('Payment success page loaded, session ID:', sessionId);

    // Function to get current authenticated user from Chrome storage
    async function getCurrentUser() {
        return new Promise((resolve) => {
            chrome.storage.local.get(['userId', 'userEmail', 'isAuthenticated'], (result) => {
                if (result.isAuthenticated && result.userId && result.userEmail) {
                    resolve({
                        uid: result.userId,
                        email: result.userEmail
                    });
                } else {
                    resolve(null);
                }
            });
        });
    }

    // Function to activate Pro features
    async function activateProFeatures(userEmail = null, userId = null) {
        try {
            // Get current authenticated user
            const currentUser = await getCurrentUser();
            
            if (!currentUser) {
                statusMessage.innerHTML = '❌ No authenticated user found. Please sign in to the extension first.';
                status.style.background = '#ffebee';
                status.style.borderColor = '#f44336';
                return;
            }

            const subscriptionData = {
                isPro: true,
                status: 'active',
                stripeCustomerId: null, // Will be updated by webhook
                subscriptionId: sessionId
            };

            // Update subscription status in Firestore
            await UserSubscription.updateSubscriptionStatus(currentUser.uid, subscriptionData);

            // Store pro status in chrome storage for immediate use
            const proData = {
                isPro: true,
                activatedAt: new Date().toISOString(),
                sessionId: sessionId,
                userEmail: currentUser.email,
                userId: currentUser.uid,
                plan: 'pro',
                subscriptionStatus: 'active'
            };

            chrome.storage.local.set(proData, () => {
                console.log('Pro features activated!', proData);
                statusMessage.innerHTML = `
                    <strong>✅ Pro features activated successfully!</strong><br>
                    Account: ${currentUser.email}<br>
                    <small>Your subscription has been activated and synced to your account.</small>
                `;
                status.style.background = '#e8f5e8';
                status.style.borderColor = '#4CAF50';
                
                // Notify popup about subscription update
                chrome.runtime.sendMessage({
                    type: 'SUBSCRIPTION_UPDATED',
                    subscriptionData: subscriptionData
                });
                
                // Also notify background script
                chrome.runtime.sendMessage({
                    type: 'PRO_ACTIVATED',
                    data: proData
                });
            });

        } catch (error) {
            console.error('Error activating pro features:', error);
            statusMessage.innerHTML = `❌ Error activating pro features: ${error.message}`;
            status.style.background = '#ffebee';
            status.style.borderColor = '#f44336';
        }
    }

    // Verify payment and activate features
    async function verifyPayment() {
        if (!sessionId) {
            statusMessage.innerHTML = '❌ Invalid payment session. Please try again.';
            status.style.background = '#ffebee';
            status.style.borderColor = '#f44336';
            return;
        }

        // Check if user is authenticated
        const currentUser = await getCurrentUser();
        if (!currentUser) {
            statusMessage.innerHTML = `
                ❌ Please sign in to the extension first to activate your subscription.<br>
                <small>Open the extension popup and sign in, then return to this page.</small>
            `;
            status.style.background = '#fff3cd';
            status.style.borderColor = '#ffc107';
            
            // Check periodically if user has signed in
            const checkAuth = setInterval(async () => {
                const user = await getCurrentUser();
                if (user) {
                    clearInterval(checkAuth);
                    verifyPayment(); // Retry verification
                }
            }, 2000);
            
            return;
        }

        statusMessage.innerHTML = '✅ Payment verified successfully! Activating your Pro subscription...';
        status.style.background = '#e8f5e8';
        status.style.borderColor = '#4CAF50';

        // Hide Google auth section since we're using Firebase auth
        googleAuth.style.display = 'none';

        // Activate pro features for the authenticated user
        await activateProFeatures(currentUser.email, currentUser.uid);
    }

    // Google Authentication (keeping for backward compatibility but hiding)
    googleSignIn.addEventListener('click', () => {
        // This is now handled by Firebase authentication in the main extension
        statusMessage.innerHTML = 'Please use the main extension login instead.';
    });

    // Close button
    closeButton.addEventListener('click', () => {
        window.close();
    });

    // Start verification process
    verifyPayment();

    // Auto-close after 30 seconds if user doesn't interact
    setTimeout(() => {
        if (confirm('Close this window and start using your Pro features?')) {
            window.close();
        }
    }, 30000);
}); 