const nodemailer = require('nodemailer');

module.exports = async (req, res) => {
  console.log(`Received ${req.method} request to waitlist-signup`);
  console.log('Request headers:', req.headers);
  console.log('Request body:', req.body);

  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    console.log('Handling OPTIONS preflight request');
    res.status(200).end();
    return;
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    console.log(`Method ${req.method} not allowed`);
    return res.status(405).json({ 
      error: { message: 'Method not allowed' } 
    });
  }

  try {
    const { email } = req.body;

    // Validate email
    if (!email || !email.includes('@')) {
      return res.status(400).json({ 
        error: { message: 'Valid email is required' } 
      });
    }

    // Check if email configuration is available
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
      console.error('Missing email configuration:', {
        hasEmailUser: !!process.env.EMAIL_USER,
        hasEmailPassword: !!process.env.EMAIL_PASSWORD
      });
      return res.status(500).json({ 
        error: { message: 'Email service not configured' } 
      });
    }

    // Create transporter using Gmail (you'll need to set up app password)
    const transporter = nodemailer.createTransporter({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER, // Your Gmail address
        pass: process.env.EMAIL_PASSWORD // Your Gmail app password
      }
    });

    // Email to you (the owner)
    const ownerEmail = {
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_USER, // Send to yourself
      subject: '🎉 New Waitlist Signup - Fiverr Extractor',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #333; text-align: center;">🎉 New Waitlist Signup!</h2>
          <div style="background: #f8f9fa; padding: 20px; border-radius: 10px; margin: 20px 0;">
            <h3 style="color: #007bff; margin-top: 0;">New Subscriber Details:</h3>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Signup Date:</strong> ${new Date().toLocaleString()}</p>
            <p><strong>IP Address:</strong> ${req.headers['x-forwarded-for'] || req.connection.remoteAddress}</p>
          </div>
          <div style="text-align: center; margin-top: 30px;">
            <p style="color: #666; font-size: 14px;">
              This email was sent automatically from your Fiverr Extractor waitlist.
            </p>
          </div>
        </div>
      `
    };

    // Welcome email to the subscriber
    const subscriberEmail = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: '🎯 Welcome to Fiverr Extractor Waitlist!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #333; text-align: center;">🎯 Welcome to the Waitlist!</h2>
          <p>Hi there!</p>
          <p>Thank you for joining the Fiverr Extractor waitlist! We're excited to have you on board.</p>
          
          <div style="background: #f8f9fa; padding: 20px; border-radius: 10px; margin: 20px 0;">
            <h3 style="color: #007bff; margin-top: 0;">What happens next?</h3>
            <ul style="color: #555;">
              <li>🚀 <strong>Early Access:</strong> You'll be among the first to try new features</li>
              <li>💎 <strong>Exclusive Updates:</strong> Get insider information and tips</li>
              <li>🎯 <strong>Priority Support:</strong> Direct access to our development team</li>
            </ul>
          </div>
          
          <p>We'll notify you as soon as we launch! In the meantime, feel free to check out our features and pricing.</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="https://fiv-sync.vercel.app" style="background: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
              Visit Our Website
            </a>
          </div>
          
          <div style="text-align: center; margin-top: 30px;">
            <p style="color: #666; font-size: 14px;">
              Best regards,<br>
              The Fiverr Extractor Team
            </p>
          </div>
        </div>
      `
    };

    // Send both emails
    try {
      await transporter.sendMail(ownerEmail);
      await transporter.sendMail(subscriberEmail);
      console.log(`Emails sent successfully for: ${email}`);
    } catch (emailError) {
      console.error('Email sending failed:', emailError);
      // Continue with success response even if email fails
    }

    // Store in database or log (optional)
    console.log(`New waitlist signup: ${email} at ${new Date().toISOString()}`);

    res.status(200).json({ 
      success: true, 
      message: 'Successfully joined waitlist!' 
    });

  } catch (error) {
    console.error('Waitlist signup error:', error);
    
    // Ensure we always return a proper JSON response
    try {
      res.status(500).json({ 
        error: { 
          message: 'Failed to join waitlist. Please try again.',
          details: error.message 
        } 
      });
    } catch (jsonError) {
      console.error('Failed to send error response:', jsonError);
      res.status(500).send('Internal server error');
    }
  }
}; 