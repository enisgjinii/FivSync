import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(request: NextRequest) {
  console.log(`Received POST request to waitlist-signup`);
  
  try {
    const { email } = await request.json();
    console.log('Request body:', { email });

    // Validate email
    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { error: { message: 'Valid email is required' } },
        { status: 400 }
      );
    }

    // Check if email configuration is available
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
      console.error('Missing email configuration:', {
        hasEmailUser: !!process.env.EMAIL_USER,
        hasEmailPassword: !!process.env.EMAIL_PASSWORD
      });
      return NextResponse.json(
        { error: { message: 'Email service not configured' } },
        { status: 500 }
      );
    }

    // Create transporter using Gmail
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
      }
    });

    // Email to you (the owner)
    const ownerEmail = {
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_USER,
      subject: '🎉 New Waitlist Signup - Fiverr Extractor',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #333; text-align: center;">🎉 New Waitlist Signup!</h2>
          <div style="background: #f8f9fa; padding: 20px; border-radius: 10px; margin: 20px 0;">
            <h3 style="color: #007bff; margin-top: 0;">New Subscriber Details:</h3>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Signup Date:</strong> ${new Date().toLocaleString()}</p>
            <p><strong>IP Address:</strong> ${request.headers.get('x-forwarded-for') || 'unknown'}</p>
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

    return NextResponse.json({ 
      success: true, 
      message: 'Successfully joined waitlist!' 
    });

  } catch (error) {
    console.error('Waitlist signup error:', error);
    
    return NextResponse.json(
      { 
        error: { 
          message: 'Failed to join waitlist. Please try again.',
          details: error instanceof Error ? error.message : 'Unknown error'
        } 
      },
      { status: 500 }
    );
  }
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 200 });
} 