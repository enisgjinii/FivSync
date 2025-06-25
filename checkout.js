document.addEventListener('DOMContentLoaded', () => {
  const stripe = Stripe('pk_test_51Rdot52cWT3pj6Lz2TimjiPDbgpfOC1BBpwqaPSLpAlf2sOtTLaCcrQN2J72KDPLH7md8vUgneCi5BoledSJftw900ptMbSM9W');

  // Fetch the Checkout Session ID from your backend
  fetch('https://fiv-sync-p1ag593u1-enisenisnisis-projects.vercel.app/api/create-checkout-session', {
    method: 'POST',
  })
  .then(function(response) {
    if (!response.ok) {
      return response.json().then(err => { throw new Error(err.error) });
    }
    return response.json();
  })
  .then(function(session) {
    return stripe.redirectToCheckout({ sessionId: session.id });
  })
  .then(function (result) {
    // If `redirectToCheckout` fails, it will be because of a browser
    // or network error. The error will be displayed to the user.
    if (result.error) {
      document.body.innerText = result.error.message;
    }
  })
  .catch(function(error) {
    console.error('Error:', error);
    document.body.innerText = 'Error: ' + error.message;
  });
}); 