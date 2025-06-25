# Setup Notes for Fiverr Conversation Extractor

## Google OAuth Configuration (REQUIRED)

To enable Google authentication in the extension, you need to:

1. **Create a Google Cloud Project:**
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select existing one
   
2. **Enable Google+ API:**
   - In the API Library, enable "Google+ API" 
   
3. **Create OAuth 2.0 Credentials:**
   - Go to Credentials > Create Credentials > OAuth 2.0 Client ID
   - Application type: "Chrome extension"
   - Add your extension ID to authorized origins
   
4. **Update manifest.json:**
   - Replace `YOUR_GOOGLE_CLIENT_ID` in manifest.json with your actual client ID
   - Format: `"client_id": "123456789-abcdefghijklmnop.apps.googleusercontent.com"`

## Extension ID

Your current extension ID: `glhngllgakepoelafphbpjgdnknloikj`

## Payment Flow

1. User clicks "Upgrade to Pro" → Opens checkout.html
2. Payment redirects to success.html with session_id
3. success.html activates pro features and offers Google sign-in
4. Background script tracks pro status across extension

## Pro Features

- Unlimited conversation exports
- Export in TXT, CSV, JSON formats  
- Advanced attachment management
- Bulk conversation export
- Metadata export
- Google account sync

## Testing Payment

The current setup uses Stripe test mode. For production:
- Update Stripe price ID in `api/create-checkout-session.js`
- Set production Stripe keys in Vercel environment variables
- Test the full payment flow

## Files Modified

- `api/create-checkout-session.js` - Fixed redirect URLs and subscription mode
- `success.html` & `success.js` - Payment success page with Google auth
- `cancel.html` - Payment cancellation page
- `manifest.json` - Added Google OAuth permissions
- `background.js` - Pro status management
- `popup.js` & `popup.html` - Pro UI integration

## Next Steps

1. Set up Google OAuth credentials
2. Test payment flow end-to-end
3. Verify pro features work correctly
4. Deploy to production Stripe environment 