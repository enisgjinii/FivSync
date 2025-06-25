const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

module.exports = async (req, res) => {
  // Set CORS headers to allow requests from your extension
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Handle preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: { message: 'Method Not Allowed' } });
  }

  // Validate environment variables
  if (!process.env.STRIPE_SECRET_KEY) {
    console.error('Missing STRIPE_SECRET_KEY environment variable');
    return res.status(500).json({ 
      error: { message: 'Server configuration error' } 
    });
  }

  try {
    // Validate request origin for security
    const origin = req.headers.origin || req.headers.referer;
    
    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: 'price_1RdoyZ2cWT3pj6Lz3uDiiKaP', // Your price ID
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${origin || 'chrome-extension://your-extension-id'}/success.html?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin || 'chrome-extension://your-extension-id'}/cancel.html`,
      metadata: {
        source: 'fiverr-extractor-extension',
        timestamp: new Date().toISOString()
      }
    });

    // Validate session was created successfully
    if (!session || !session.id) {
      throw new Error('Failed to create checkout session');
    }

    console.log('Checkout session created successfully:', session.id);
    res.status(200).json({ sessionId: session.id });

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
  }
}; 