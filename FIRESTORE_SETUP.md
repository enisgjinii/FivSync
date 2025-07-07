# Firestore Setup Guide

## Security Rules Configuration

To resolve the permission-denied errors, you need to deploy the security rules provided in `firestore.rules` to your Firebase project.

### Deploying Security Rules

1. **Using Firebase CLI:**
   ```bash
   # Install Firebase CLI if not already installed
   npm install -g firebase-tools
   
   # Login to Firebase
   firebase login
   
   # Initialize your project (if not already done)
   firebase init firestore
   
   # Deploy the security rules
   firebase deploy --only firestore:rules
   ```

2. **Using Firebase Console:**
   - Go to [Firebase Console](https://console.firebase.google.com)
   - Select your project
   - Navigate to Firestore Database
   - Go to the "Rules" tab
   - Copy and paste the content from `firestore.rules`
   - Click "Publish"

### Security Rules Explanation

The rules in `firestore.rules` ensure that:

- **User Documents**: Users can only read/write their own data using their Firebase Auth UID
- **Subscription Data**: Users can manage their own subscription information
- **Usage Statistics**: Users can track their own usage data
- **Public Configuration**: Authenticated users can read shared configuration (if needed)

### Document Structure

The application uses the following Firestore collections:

```
/users/{userId}
  - email: string
  - uid: string
  - subscriptionStatus: 'free' | 'pro' | 'active' | 'expired'
  - subscriptionExpiry: timestamp (optional)
  - planType: string (optional)
  - totalExports: number
  - thisMonthExports: number
  - createdAt: timestamp

/subscriptions/{userId}
  - (subscription-specific data)

/usage/{userId}
  - (usage tracking data)
```

### Troubleshooting

If you're still getting permission errors after deploying the rules:

1. **Check Authentication**: Ensure users are properly signed in to Firebase Auth
2. **Verify UID Usage**: Make sure documents are created with the user's UID, not email
3. **Test Rules**: Use the Firebase Console Rules Playground to test your rules
4. **Check Timestamps**: Ensure serverTimestamp() is used correctly

### Testing

You can test the rules using the Firebase Console:
1. Go to Firestore Rules tab
2. Click "Rules playground"
3. Test read/write operations with different user scenarios

## Implementation Notes

- The application now uses Firebase Auth UID instead of email as document IDs
- All payment status checks are done securely on the server side
- Users can only access their own data, ensuring privacy and security
- The rules are designed to scale with multiple users without conflicts 