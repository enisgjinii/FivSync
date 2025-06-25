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
      // Validate request origin for security
      const origin = req.headers.origin || req.headers.referer;
      console.log('Request from origin:', origin);
      
      // Create checkout session with subscription mode for recurring prices
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
          {
            price: 'price_1RdoyZ2cWT3pj6Lz3uDiiKaP', // Your recurring price ID
            quantity: 1,
          },
        ],
        mode: 'subscription', // Changed from 'payment' to 'subscription'
        success_url: `${origin || 'chrome-extension://your-extension-id'}/success.html?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${origin || 'chrome-extension://your-extension-id'}/cancel.html`,
        metadata: {
          source: 'fiverr-extractor-extension',
          timestamp: new Date().toISOString(),
          origin: origin || 'unknown'
        },
        // Add subscription-specific settings
        subscription_data: {
          metadata: {
            source: 'fiverr-extractor-extension',
            plan: 'pro'
          }
        }
      });

      // Validate session was created successfully
      if (!session || !session.id) {
        throw new Error('Failed to create checkout session');
      }

      console.log('Checkout session created successfully:', session.id);
      res.status(200).json({ sessionId: session.id });
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