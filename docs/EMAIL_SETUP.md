# Email Setup Guide for Waitlist

This guide will help you set up email notifications for your waitlist signups.

## 🚀 Quick Setup

### 1. Gmail App Password Setup

1. **Enable 2-Factor Authentication** on your Gmail account
2. **Generate App Password**:
   - Go to Google Account settings
   - Security → 2-Step Verification → App passwords
   - Generate a new app password for "Mail"
   - Copy the 16-character password

### 2. Environment Variables

Add these environment variables to your Vercel project:

```bash
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-16-character-app-password
```

### 3. Vercel Configuration

1. Go to your Vercel dashboard
2. Select your project
3. Go to Settings → Environment Variables
4. Add the variables above

## 📧 How It Works

### When someone joins your waitlist:

1. **You get an email** with:
   - Subscriber's email address
   - Signup date and time
   - IP address (for security)
   - Professional HTML formatting

2. **Subscriber gets a welcome email** with:
   - Welcome message
   - Benefits of joining waitlist
   - Link to your website
   - Professional branding

## 🔧 Customization

### Change Email Templates

Edit the HTML templates in `api/waitlist-signup.js`:

```javascript
// Owner email template
const ownerEmail = {
  from: process.env.EMAIL_USER,
  to: process.env.EMAIL_USER,
  subject: '🎉 New Waitlist Signup - Fiverr Extractor',
  html: `Your custom HTML here`
};

// Subscriber welcome email template
const subscriberEmail = {
  from: process.env.EMAIL_USER,
  to: email,
  subject: '🎯 Welcome to Fiverr Extractor Waitlist!',
  html: `Your custom HTML here`
};
```

### Change Email Service

To use a different email service (like SendGrid, Mailgun, etc.):

1. Install the service package: `npm install @sendgrid/mail`
2. Update the transporter configuration in `api/waitlist-signup.js`
3. Update environment variables accordingly

## 🛡️ Security Features

- **Email validation**: Ensures valid email format
- **CORS protection**: Only allows POST requests
- **Error handling**: Graceful error messages
- **Rate limiting**: Consider adding rate limiting for production

## 📊 Monitoring

Check your Vercel function logs to monitor:
- Successful signups
- Failed attempts
- Email delivery status

## 🚨 Troubleshooting

### Common Issues:

1. **"Authentication failed"**
   - Check your app password is correct
   - Ensure 2FA is enabled on Gmail

2. **"Invalid email"**
   - Check email format validation
   - Ensure email contains @ symbol

3. **"Method not allowed"**
   - Ensure you're making a POST request
   - Check CORS headers

### Testing:

1. Deploy to Vercel
2. Test the waitlist form
3. Check your email for notifications
4. Verify subscriber receives welcome email

## 📈 Next Steps

Consider adding:
- Database storage for analytics
- Email templates with your branding
- A/B testing for different welcome emails
- Integration with your CRM
- Analytics dashboard for signup trends 