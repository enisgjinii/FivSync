document.addEventListener('DOMContentLoaded', () => {
  const errorContainer = document.getElementById('errorContainer');
  const statusContainer = document.getElementById('statusContainer');

  console.log('Starting checkout process...');
  statusContainer.textContent = 'Contacting payment server...';

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

  // Function to redirect to Stripe Checkout
  function redirectToStripe() {
    // Fetch the Checkout Session ID from your backend
    fetch('https://fiv-sync.vercel.app/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        source: 'chrome-extension',
        timestamp: new Date().toISOString()
      })
    })
    .then(response => {
      console.log('Received response from server:', response);
      statusContainer.textContent = 'Server response received. Processing...';
      
      if (!response.ok) {
        // If server returns an error, show it
        return response.json().then(err => {
          const errorMsg = `Server error: ${response.status} - ${err.error?.message || 'Unknown error'}`;
          throw new Error(errorMsg);
        }).catch(() => {
          // If JSON parsing fails, create a generic error
          throw new Error(`Server error: ${response.status} - ${response.statusText}`);
        });
      }
      return response.json();
    })
    .then(session => {
      console.log('Checkout session received:', session);
      statusContainer.textContent = 'Session created. Redirecting to Stripe...';
      
      if (!session || !session.sessionId) {
        throw new Error('Invalid session ID received from server.');
      }
      
      // Redirect directly to Stripe Checkout URL
      const checkoutUrl = `https://checkout.stripe.com/pay/${session.sessionId}`;
      console.log('Redirecting to:', checkoutUrl);
      window.location.href = checkoutUrl;
    })
    .catch(error => {
      console.error('Checkout error:', error);
      
      let errorMessage = error.message;
      if (error.message.includes('CORS')) {
        errorMessage = 'Payment server configuration issue. Please contact support.';
      } else if (error.message.includes('Failed to fetch')) {
        errorMessage = 'Unable to connect to payment server. Please check your internet connection.';
      }
      
      showError(`Error: ${errorMessage}`);
    });
  }

  // Start the checkout process
  redirectToStripe();
}); 