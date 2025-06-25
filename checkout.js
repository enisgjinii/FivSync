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
    // Use the direct API endpoint instead of root path
    const apiUrl = 'https://fiv-sync.vercel.app/api/create-checkout-session';
    console.log('Fetching from:', apiUrl);
    
    fetch(apiUrl, {
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
        // Try to get the error details from the response
        return response.text().then(errorText => {
          console.error('Server error response:', errorText);
          let errorData;
          try {
            errorData = JSON.parse(errorText);
          } catch (e) {
            errorData = { error: { message: errorText || 'Unknown server error' } };
          }
          
          const errorMsg = `Server error: ${response.status} - ${errorData.error?.message || 'Unknown error'}`;
          throw new Error(errorMsg);
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
      } else if (error.message.includes('500')) {
        errorMessage = 'Payment server error. This might be due to missing configuration (Stripe key). Please contact support.';
      }
      
      showError(`Error: ${errorMessage}`);
    });
  }

  // Start the checkout process
  redirectToStripe();
}); 