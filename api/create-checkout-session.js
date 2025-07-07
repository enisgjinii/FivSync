const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

module.exports = async (req, res) => {
  // Set CORS headers to allow requests from Chrome extensions
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS, GET');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  console.log(`Received ${req.method} request to create-checkout-session`);

  // Handle preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    console.log('Handling OPTIONS preflight request');
    res.status(200).end();
    return;
  }

  // Handle GET requests for testing/status
  if (req.method === 'GET') {
    console.log('Handling GET request - returning API status');
    res.status(200).json({ 
      message: 'Fiverr Extractor Payment API',
      status: 'online',
      timestamp: new Date().toISOString(),
      endpoints: {
        checkout: 'POST /api/create-checkout-session',
        test: 'GET /api/create-checkout-session'
      },
      environment: {
        hasStripeKey: !!process.env.STRIPE_SECRET_KEY,
        nodeVersion: process.version
      }
    });
    return;
  }

  // Handle POST requests for creating checkout sessions
  if (req.method === 'POST') {
    console.log('Handling POST request - creating checkout session');
    
    // Validate environment variables
    if (!process.env.STRIPE_SECRET_KEY) {
      console.error('Missing STRIPE_SECRET_KEY environment variable');
      return res.status(500).json({ 
        error: { message: 'Server configuration error - missing Stripe key' } 
      });
    }

    try {
      // Extract customer email from request body
      const { customerEmail, success_url, cancel_url } = req.body || {};
      console.log('Customer email from request:', customerEmail);
      console.log('Success URL from request:', success_url);
      console.log('Cancel URL from request:', cancel_url);
      
      // Log the exact URL format being processed
      if (success_url) {
        console.log('Success URL breakdown:');
        console.log('- Full URL:', success_url);
        console.log('- Protocol:', success_url.split('://')[0]);
        console.log('- Extension ID:', success_url.match(/extension:\/\/([^\/]+)/)?.[1]);
        console.log('- Path:', success_url.split('extension://')[1]?.split('?')[0]);
      }
      
      // Extract extension ID from origin header (as a fallback)
      const origin = req.headers.origin || req.headers.referer;
      console.log('Request from origin:', origin);
      
      let extensionId = 'glhngllgakepoelafphbpjgdnknloikj'; // Default to your extension ID
      if (origin && origin.includes('extension://')) {
        const match = origin.match(/extension:\/\/([^\/]+)/);
        if (match) {
          extensionId = match[1];
        }
      }
      
      // Prepare checkout session configuration
      const sessionConfig = {
        payment_method_types: ['card'],
        line_items: [
          {
            price: 'price_1RdoyZ2cWT3pj6Lz3uDiiKaP', // Your recurring price ID
            quantity: 1,
          },
        ],
        mode: 'subscription',
        success_url: success_url || `extension://${extensionId}/success.html?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: cancel_url || `extension://${extensionId}/cancel.html`,
        metadata: {
          source: 'fiverr-extractor-extension',
          timestamp: new Date().toISOString(),
          origin: origin || 'unknown',
          extensionId: extensionId,
          customerEmail: customerEmail || 'not-provided'
        },
        // Add subscription-specific settings
        subscription_data: {
          metadata: {
            source: 'fiverr-extractor-extension',
            plan: 'pro',
            extensionId: extensionId,
            customerEmail: customerEmail || 'not-provided'
          }
        }
      };

      // Ensure proper extension:// URL format
      if (sessionConfig.success_url) {
        // Clean and validate the success URL
        let cleanSuccessUrl = sessionConfig.success_url
          .replace(/chrome-extension\/\//g, 'chrome-extension://') // Fix double slash issues
          .replace(/extension\/\//g, 'extension://') // Fix double slash issues
          .replace(/chrome-extension:\/\/\//g, 'chrome-extension://') // Fix triple slash issues
          .replace(/extension:\/\/\//g, 'extension://') // Fix triple slash issues
          .replace(/chrome-extension:\/\/([^\/]+)\/\//g, 'chrome-extension://$1/') // Fix extension ID followed by double slash
          .replace(/extension:\/\/([^\/]+)\/\//g, 'extension://$1/'); // Fix extension ID followed by double slash
        
        // Convert chrome-extension:// to extension:// for unpublished extensions
        if (cleanSuccessUrl.startsWith('chrome-extension://')) {
          cleanSuccessUrl = cleanSuccessUrl.replace('chrome-extension://', 'extension://');
        }
        
        sessionConfig.success_url = cleanSuccessUrl;
        console.log('Cleaned success URL:', sessionConfig.success_url);
        
        // Validate the final URL format
        const urlRegex = /^extension:\/\/[a-zA-Z0-9]+\/[^?]+\?session_id=\{CHECKOUT_SESSION_ID\}$/;
        if (!urlRegex.test(sessionConfig.success_url)) {
          console.error('Invalid success URL format after cleaning:', sessionConfig.success_url);
          // Use a fallback URL
          sessionConfig.success_url = `extension://${extensionId}/success.html?session_id={CHECKOUT_SESSION_ID}`;
          console.log('Using fallback success URL:', sessionConfig.success_url);
        }
      }
      
      // Add customer email if provided
      if (customerEmail && customerEmail.includes('@')) {
        sessionConfig.customer_email = customerEmail;
        console.log('Added customer email to checkout session:', customerEmail);
      }
      
      // Create checkout session with subscription mode for recurring prices
      const session = await stripe.checkout.sessions.create(sessionConfig);

      // Validate session was created successfully
      if (!session || !session.id) {
        throw new Error('Failed to create checkout session');
      }

      console.log('Checkout session created successfully:', session.id);
      console.log('Checkout URL:', session.url);
      console.log('Success URL:', `extension://${extensionId}/success.html`);
      if (customerEmail) {
        console.log('Customer email set for checkout:', customerEmail);
      }
      
      // Return both sessionId and the checkout URL
      res.status(200).json({ 
        sessionId: session.id,
        checkoutUrl: session.url
      });
      return;

    } catch (err) {
      console.error('Stripe checkout error:', err);
      
      // Return appropriate error response
      const errorMessage = err.type === 'StripeCardError' 
        ? 'Payment processing error'
        : err.message || 'An unexpected error occurred';
      
      res.status(500).json({ 
        error: { 
          message: errorMessage,
          type: err.type || 'api_error'
        } 
      });
      return;
    }
  }

  // If we get here, it's an unsupported method
  console.log(`Unsupported method: ${req.method}`);
  res.setHeader('Allow', 'POST, GET, OPTIONS');
  return res.status(405).json({ 
    error: { 
      message: `Method ${req.method} Not Allowed`,
      supportedMethods: ['GET', 'POST', 'OPTIONS'],
      endpoint: '/api/create-checkout-session'
    } 
  });
}; 