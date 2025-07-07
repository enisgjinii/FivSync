import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
});

export async function POST(request: NextRequest) {
  console.log(`Received POST request to create-checkout-session`);
  
  try {
    const { customerEmail, success_url, cancel_url } = await request.json();
    console.log('Request body:', { customerEmail, success_url, cancel_url });

    // Validate environment variables
    if (!process.env.STRIPE_SECRET_KEY) {
      console.error('Missing STRIPE_SECRET_KEY environment variable');
      return NextResponse.json(
        { error: { message: 'Server configuration error - missing Stripe key' } },
        { status: 500 }
      );
    }

    const origin = request.headers.get('origin') || request.headers.get('referer');
    let extensionId = 'glhngllgakepoelafphbpjgdnknloikj'; // Default extension ID
    
    if (success_url && success_url.startsWith('https://')) {
      try {
        const urlParams = new URL(success_url).searchParams;
        const extensionIdFromUrl = urlParams.get('extension_id');
        if (extensionIdFromUrl) {
          extensionId = extensionIdFromUrl;
        }
      } catch (e) {
        console.log('Could not parse extension ID from success URL:', e);
      }
    } else if (origin && origin.includes('extension://')) {
      const match = origin.match(/extension:\/\/([^\/]+)/);
      if (match) {
        extensionId = match[1];
      }
    }
    
    // Prepare checkout session configuration
    const sessionConfig: Stripe.Checkout.SessionCreateParams = {
      payment_method_types: ['card'],
      line_items: [
        {
          price: 'price_1RdoyZ2cWT3pj6Lz3uDiiKaP', // Your recurring price ID
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: success_url || `https://fiv-sync.vercel.app/success.html?session_id={CHECKOUT_SESSION_ID}&extension_id=${extensionId}`,
      cancel_url: cancel_url || `https://fiv-sync.vercel.app/cancel.html?extension_id=${extensionId}`,
      metadata: {
        source: 'fiverr-extractor-extension',
        timestamp: new Date().toISOString(),
        origin: origin || 'unknown',
        extensionId: extensionId,
        customerEmail: customerEmail || 'not-provided'
      },
      subscription_data: {
        metadata: {
          source: 'fiverr-extractor-extension',
          plan: 'pro',
          extensionId: extensionId,
          customerEmail: customerEmail || 'not-provided'
        }
      }
    };

    // Simple validation for the URLs
    if (!sessionConfig.success_url!.startsWith('https://') || !sessionConfig.cancel_url!.startsWith('https://')) {
      console.error('Invalid URL format. URLs must be HTTPS.');
      return NextResponse.json(
        { error: { message: 'Server configuration error - invalid URL format.' } },
        { status: 500 }
      );
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
    
    // Return both sessionId and the checkout URL
    return NextResponse.json({ 
      sessionId: session.id,
      checkoutUrl: session.url
    });

  } catch (error) {
    console.error('Stripe checkout error:', error);
    
    // Return appropriate error response
    const errorMessage = error instanceof Error && 'type' in error && error.type === 'StripeCardError' 
      ? 'Payment processing error'
      : error instanceof Error ? error.message : 'An unexpected error occurred';
    
    return NextResponse.json(
      { 
        error: { 
          message: errorMessage,
          type: error instanceof Error && 'type' in error ? error.type : 'api_error'
        } 
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  console.log('Handling GET request - returning API status');
  return NextResponse.json({ 
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
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 200 });
} 