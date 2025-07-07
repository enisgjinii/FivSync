document.addEventListener('DOMContentLoaded', () => {
  const errorContainer = document.getElementById('errorContainer');
  const statusContainer = document.getElementById('statusContainer');

  console.log('Starting checkout process...');
  statusContainer.textContent = 'Getting user information...';

  // Function to show error with retry button
  function showError(message) {
    errorContainer.style.display = 'block';
    errorContainer.innerHTML = `
      <div>${message}</div>
      <button class="retry-button" id="retryButton">Retry Payment</button>
    `;
    statusContainer.style.display = 'none';
    
    // Add event listener to retry button (CSP compliant)
    const retryButton = document.getElementById('retryButton');
    if (retryButton) {
      retryButton.addEventListener('click', () => {
        location.reload();
      });
    }
  }

  // Function to get authenticated user's email
  function getUserEmail() {
    return new Promise((resolve) => {
      chrome.storage.local.get(['userEmail', 'checkoutEmail'], (result) => {
        // Use checkoutEmail if available, otherwise use userEmail from authentication
        const email = result.checkoutEmail || result.userEmail;
        console.log('Retrieved user email for checkout:', email);
        resolve(email);
      });
    });
  }

  // Function to redirect to Stripe Checkout
  async function redirectToStripe() {
    try {
      // Get user email first
      const userEmail = await getUserEmail();
      
      if (!userEmail) {
        showError('User email not found. Please sign in again.');
        return;
      }

      statusContainer.textContent = 'Contacting payment server...';
      
      // Use the direct API endpoint instead of root path
      const apiUrl = 'https://fiv-sync.vercel.app/api/create-checkout-session';
      console.log('Fetching from:', apiUrl);
      
      // Get the extension ID from the runtime URL
      const extensionId = chrome.runtime.id;
      // Use a web-based success URL that can communicate with the extension
      const success_url = `https://fiv-sync.vercel.app/success?session_id={CHECKOUT_SESSION_ID}&extension_id=${extensionId}`;
      const cancel_url = `https://fiv-sync.vercel.app/cancel?extension_id=${extensionId}`;

      // Ensure the success URL is properly formatted
      console.log('Original success URL:', success_url);
      
      // Validate URL format before sending to API
      if (!success_url.startsWith('https://')) {
        console.error('Invalid success URL format:', success_url);
        showError('Invalid URL configuration. Please contact support.');
        return;
      }

      const requestBody = {
        source: 'chrome-extension',
        timestamp: new Date().toISOString(),
        customerEmail: userEmail,
        success_url: success_url,
        cancel_url: cancel_url
      };
      
      console.log('Sending request with user email:', userEmail);
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });
      
      console.log('Received response from server:', response);
      statusContainer.textContent = 'Server response received. Processing...';
      
      if (!response.ok) {
        // Try to get the error details from the response
        const errorText = await response.text();
        console.error('Server error response:', errorText);
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch (e) {
          errorData = { error: { message: errorText || 'Unknown server error' } };
        }
        
        const errorMsg = `Server error: ${response.status} - ${errorData.error?.message || 'Unknown error'}`;
        throw new Error(errorMsg);
      }
      
      const session = await response.json();
      console.log('Checkout session received:', session);
      statusContainer.textContent = 'Session created. Redirecting to Stripe...';
      
      // Check for the checkout URL first, fallback to sessionId if needed
      if (session.checkoutUrl) {
        console.log('Redirecting to Stripe checkout URL:', session.checkoutUrl);
        window.location.href = session.checkoutUrl;
      } else if (session.sessionId) {
        // Fallback: construct URL if checkoutUrl is not provided
        const checkoutUrl = `https://checkout.stripe.com/c/pay/${session.sessionId}`;
        console.log('Redirecting to fallback URL:', checkoutUrl);
        window.location.href = checkoutUrl;
      } else {
        throw new Error('No valid checkout URL or session ID received from server.');
      }
    } catch (error) {
      console.error('Checkout error:', error);
      
      let errorMessage = error.message;
      if (error.message.includes('CORS')) {
        errorMessage = 'Payment server configuration issue. Please contact support.';
      } else if (error.message.includes('Failed to fetch')) {
        errorMessage = 'Unable to connect to payment server. Please check your internet connection.';
      } else if (error.message.includes('StripeInvalidRequestError')) {
        errorMessage = 'Payment configuration error. Please contact support.';
      }
      
      showError(`Error: ${errorMessage}`);
    }
  }

  // Start the checkout process
  redirectToStripe();
}); 