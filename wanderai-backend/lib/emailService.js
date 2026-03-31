import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS?.replace(/"/g, ''), // strip quotes if present
  },
});

  const frontendUrl = process.env.CLIENT_URL || 'http://localhost:5173';

export const sendVerificationEmail = async (email, name, token) => {
  const verifyUrl = `${frontendUrl}/verify-email?token=${token}`;
  
  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: email,
    subject: `Verify your email for WanderAI`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
        <h2 style="color: #4f46e5; text-align: center;">Welcome to WanderAI</h2>
        <p>Hi ${name},</p>
        <p>Thank you for joining WanderAI. Please click the button below to verify your email address:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${verifyUrl}" style="background: #4f46e5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">Verify Email Address</a>
        </div>
        <p style="color: #666; font-size: 14px;">This link will expire in 24 hours. If you didn't create an account, you can safely ignore this email.</p>
        <p style="color: #999; font-size: 11px; word-break: break-all;">Link not working? Copy this URL: ${verifyUrl}</p>
        <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
        <p style="text-align: center; color: #999; font-size: 12px;">© ${new Date().getFullYear()} WanderAI. Happy travels!</p>
      </div>
    `,
  };

  return transporter.sendMail(mailOptions);
};

export const sendPasswordResetEmail = async (email, name, token) => {
  const resetUrl = `${frontendUrl}/reset-password/${token}`;
  
  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: email,
    subject: 'Reset your WanderAI password',
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
        <h2 style="color: #4f46e5; text-align: center;">Password Reset Request</h2>
        <p>Hi ${name},</p>
        <p>We received a request to reset your password. Click the button below to choose a new password:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" style="background: #4f46e5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">Reset Password</a>
        </div>
        <p style="color: #666; font-size: 14px;">This link will expire in 1 hour. If you didn't request a password reset, you can safely ignore this email.</p>
        <p style="color: #999; font-size: 11px; word-break: break-all;">Link not working? Copy this URL: ${resetUrl}</p>
        <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
        <p style="text-align: center; color: #999; font-size: 12px;">© ${new Date().getFullYear()} WanderAI. Keep exploring!</p>
      </div>
    `,
  };

  return transporter.sendMail(mailOptions);
};

export const sendCollaboratorInviteEmail = async (email, inviterName, tripName, role, tripId) => {
  const tripUrl = `${frontendUrl}/trip/${tripId}`;
  
  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: email,
    subject: `${inviterName} invited you to collaborate on a trip to ${tripName}`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
        <h2 style="color: #4f46e5; text-align: center;">You're Invited!</h2>
        <p>Hi,</p>
        <p><strong>${inviterName}</strong> has invited you to help plan their trip: <strong>${tripName}</strong>.</p>
        <p>You have been added as a <strong>${role}</strong>.</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${tripUrl}" style="background: #4f46e5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">View Trip Itinerary</a>
        </div>
        <p style="color: #666; font-size: 14px;">Collaborate in real-time, chat with the AI assistant, and help build the perfect journey!</p>
        <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
        <p style="text-align: center; color: #999; font-size: 12px;">© ${new Date().getFullYear()} WanderAI. Built for travelers.</p>
      </div>
    `,
  };

  return transporter.sendMail(mailOptions);
};
