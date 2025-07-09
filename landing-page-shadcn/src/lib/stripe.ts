import { loadStripe } from '@stripe/stripe-js';

// Initialize Stripe
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

export const getStripe = () => {
  return stripePromise;
};

// Payment utility functions
export const createCheckoutSession = async (planType: 'free' | 'pro', customerEmail?: string) => {
  try {
    const response = await fetch('/api/create-checkout-session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        planType,
        customerEmail,
        success_url: `${window.location.origin}/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${window.location.origin}/cancel`,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || 'Failed to create checkout session');
    }

    const { sessionId, checkoutUrl } = await response.json();
    
    if (checkoutUrl) {
      // Redirect to Stripe Checkout
      window.location.href = checkoutUrl;
    } else {
      throw new Error('No checkout URL received');
    }
    
    return { sessionId, checkoutUrl };
  } catch (error) {
    console.error('Error creating checkout session:', error);
    throw error;
  }
};

export const redirectToCheckout = async (sessionId: string) => {
  const stripe = await getStripe();
  
  if (!stripe) {
    throw new Error('Stripe not loaded');
  }

  const { error } = await stripe.redirectToCheckout({ sessionId });
  
  if (error) {
    throw error;
  }
};

// Price configuration
export const PRICE_CONFIG = {
  free: {
    priceId: null,
    amount: 0,
    currency: 'usd',
    interval: null,
  },
  pro: {
    priceId: 'price_1RdoyZ2cWT3pj6Lz3uDiiKaP',
    amount: 499,
    currency: 'usd',
    interval: 'month',
  },
} as const; 