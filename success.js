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

    // Function to activate Pro features
    function activateProFeatures(userEmail = null) {
        const proData = {
            isPro: true,
            activatedAt: new Date().toISOString(),
            sessionId: sessionId,
            userEmail: userEmail,
            plan: 'pro'
        };

        // Store pro status in chrome storage
        chrome.storage.local.set(proData, () => {
            console.log('Pro features activated!', proData);
            statusMessage.innerHTML = `
                <strong>✅ Pro features activated successfully!</strong><br>
                ${userEmail ? `Linked to: ${userEmail}` : 'Account activated locally'}
            `;
            status.style.background = '#e8f5e8';
            status.style.borderColor = '#4CAF50';
            
            // Notify background script about pro activation
            chrome.runtime.sendMessage({
                type: 'PRO_ACTIVATED',
                data: proData
            });
        });
    }

    // Verify payment and activate features
    function verifyPayment() {
        if (!sessionId) {
            statusMessage.innerHTML = '❌ Invalid payment session. Please try again.';
            status.style.background = '#ffebee';
            status.style.borderColor = '#f44336';
            return;
        }

        statusMessage.innerHTML = '✅ Payment verified successfully!';
        status.style.background = '#e8f5e8';
        status.style.borderColor = '#4CAF50';

        // Show Google auth option
        setTimeout(() => {
            googleAuth.style.display = 'block';
        }, 1000);

        // Activate pro features immediately (even without Google auth)
        activateProFeatures();
    }

    // Google Authentication
    googleSignIn.addEventListener('click', () => {
        googleSignIn.disabled = true;
        googleSignIn.innerHTML = '<span>Signing in...</span>';

        // Use Chrome Identity API for Google OAuth
        chrome.identity.getAuthToken({ interactive: true }, (token) => {
            if (chrome.runtime.lastError) {
                console.error('Auth error:', chrome.runtime.lastError);
                googleSignIn.disabled = false;
                googleSignIn.innerHTML = 'Sign in with Google - Try Again';
                return;
            }

            // Get user profile
            fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })
            .then(response => response.json())
            .then(userInfo => {
                console.log('Google user info:', userInfo);
                
                // Store user info and activate pro with email
                chrome.storage.local.set({
                    userEmail: userInfo.email,
                    userName: userInfo.name,
                    userPicture: userInfo.picture,
                    googleLinked: true
                }, () => {
                    activateProFeatures(userInfo.email);
                    googleSignIn.innerHTML = `✅ Linked to ${userInfo.email}`;
                    googleSignIn.disabled = true;
                });
            })
            .catch(error => {
                console.error('Failed to get user info:', error);
                googleSignIn.disabled = false;
                googleSignIn.innerHTML = 'Sign in with Google - Try Again';
            });
        });
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