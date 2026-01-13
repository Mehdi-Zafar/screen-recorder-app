export function getPasswordResetEmailTemplate(data: {
  userName: string;
  resetUrl: string;
}): { html: string; text: string } {
  const { userName, resetUrl } = data;

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Reset Your Password</title>
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5;">
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center; border-radius: 12px 12px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 32px; font-weight: 700;">🔐 Password Reset</h1>
        </div>
        
        <!-- Main Content -->
        <div style="background: white; padding: 40px 30px; border-radius: 0 0 12px 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          <p style="font-size: 18px; margin-bottom: 20px; color: #333;">Hi ${userName || "there"},</p>
          
          <p style="font-size: 16px; margin-bottom: 24px; color: #555; line-height: 1.6;">
            We received a request to reset your password for your <strong>Screen Recorder</strong> account. 
            Click the button below to create a new password:
          </p>
          
          <!-- CTA Button -->
          <div style="text-align: center; margin: 35px 0;">
            <a href="${resetUrl}" 
               style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                      color: white; 
                      padding: 16px 32px; 
                      text-decoration: none; 
                      border-radius: 8px; 
                      font-weight: 600; 
                      display: inline-block;
                      font-size: 16px;
                      box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
                      transition: transform 0.2s;">
              Reset My Password
            </a>
          </div>
          
          <!-- Security Info -->
          <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 16px; border-radius: 6px; margin: 30px 0;">
            <p style="margin: 0; font-size: 14px; color: #92400e;">
              <strong>⚠️ Security Notice:</strong> This link will expire in <strong>1 hour</strong> for your protection.
            </p>
          </div>
          
          <p style="font-size: 14px; color: #6b7280; margin-top: 24px; line-height: 1.6;">
            If you didn't request this password reset, please ignore this email. 
            Your password will remain unchanged, and your account is secure.
          </p>
          
          <!-- Divider -->
          <hr style="border: none; border-top: 2px solid #e5e7eb; margin: 30px 0;">
          
          <!-- Alternative Link -->
          <div style="background: #f9fafb; padding: 20px; border-radius: 8px; border: 1px solid #e5e7eb;">
            <p style="font-size: 13px; color: #6b7280; margin: 0 0 10px 0; font-weight: 600;">
              Button not working? Copy and paste this link:
            </p>
            <p style="font-size: 12px; margin: 0;">
              <a href="${resetUrl}" style="color: #667eea; word-break: break-all; text-decoration: none;">${resetUrl}</a>
            </p>
          </div>
        </div>
        
        <!-- Footer -->
        <div style="text-align: center; margin-top: 30px; padding: 20px;">
          <p style="font-size: 13px; color: #9ca3af; margin: 0 0 8px 0;">
            This email was sent by <strong>Screen Recorder</strong>
          </p>
          <p style="font-size: 12px; color: #9ca3af; margin: 0;">
            © ${new Date().getFullYear()} Screen Recorder. All rights reserved.
          </p>
        </div>
      </body>
    </html>
  `;

  const text = `
    Reset Your Password - Screen Recorder
    
    Hi ${userName || "there"},
    
    We received a request to reset your password for your Screen Recorder account.
    
    Click the link below to reset your password:
    ${resetUrl}
    
    This link will expire in 1 hour for security reasons.
    
    If you didn't request this password reset, you can safely ignore this email.
    Your password will remain unchanged.
    
    ---
    © ${new Date().getFullYear()} Screen Recorder. All rights reserved.
  `;

  return { html, text };
}

export function getEmailVerificationTemplate(data: {
  userName: string;
  verificationUrl: string;
}): { html: string; text: string } {
  const { userName, verificationUrl } = data;

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Verify Your Email</title>
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5;">
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center; border-radius: 12px 12px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 32px; font-weight: 700;">✉️ Verify Your Email</h1>
        </div>
        
        <!-- Main Content -->
        <div style="background: white; padding: 40px 30px; border-radius: 0 0 12px 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          <p style="font-size: 18px; margin-bottom: 20px; color: #333;">Welcome ${userName || "there"}! 👋</p>
          
          <p style="font-size: 16px; margin-bottom: 24px; color: #555; line-height: 1.6;">
            Thank you for signing up with <strong>Screen Recorder</strong>! 
            We're excited to have you on board. To get started, please verify your email address by clicking the button below:
          </p>
          
          <!-- CTA Button -->
          <div style="text-align: center; margin: 35px 0;">
            <a href="${verificationUrl}" 
               style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                      color: white; 
                      padding: 16px 32px; 
                      text-decoration: none; 
                      border-radius: 8px; 
                      font-weight: 600; 
                      display: inline-block;
                      font-size: 16px;
                      box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
                      transition: transform 0.2s;">
              Verify My Email
            </a>
          </div>
          
          <!-- Benefits Section -->
          <div style="background: #f0fdf4; border-left: 4px solid #22c55e; padding: 20px; border-radius: 6px; margin: 30px 0;">
            <p style="margin: 0 0 12px 0; font-size: 15px; color: #166534; font-weight: 600;">
              ✨ Once verified, you'll be able to:
            </p>
            <ul style="margin: 0; padding-left: 20px; color: #166534; font-size: 14px;">
              <li style="margin-bottom: 8px;">Upload and share your screen recordings</li>
              <li style="margin-bottom: 8px;">Manage your video library</li>
              <li style="margin-bottom: 8px;">Access all premium features</li>
            </ul>
          </div>
          
          <!-- Security Info -->
          <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 16px; border-radius: 6px; margin: 30px 0;">
            <p style="margin: 0; font-size: 14px; color: #92400e;">
              <strong>⏰ Quick Action Required:</strong> This verification link will expire in <strong>24 hours</strong>.
            </p>
          </div>
          
          <p style="font-size: 14px; color: #6b7280; margin-top: 24px; line-height: 1.6;">
            If you didn't create an account with Screen Recorder, please ignore this email.
          </p>
          
          <!-- Divider -->
          <hr style="border: none; border-top: 2px solid #e5e7eb; margin: 30px 0;">
          
          <!-- Alternative Link -->
          <div style="background: #f9fafb; padding: 20px; border-radius: 8px; border: 1px solid #e5e7eb;">
            <p style="font-size: 13px; color: #6b7280; margin: 0 0 10px 0; font-weight: 600;">
              Button not working? Copy and paste this link:
            </p>
            <p style="font-size: 12px; margin: 0;">
              <a href="${verificationUrl}" style="color: #667eea; word-break: break-all; text-decoration: none;">${verificationUrl}</a>
            </p>
          </div>
        </div>
        
        <!-- Footer -->
        <div style="text-align: center; margin-top: 30px; padding: 20px;">
          <p style="font-size: 13px; color: #9ca3af; margin: 0 0 8px 0;">
            Need help? Contact us at <a href="mailto:support@screenrecorder.com" style="color: #667eea; text-decoration: none;">support@screenrecorder.com</a>
          </p>
          <p style="font-size: 12px; color: #9ca3af; margin: 0;">
            © ${new Date().getFullYear()} Screen Recorder. All rights reserved.
          </p>
        </div>
      </body>
    </html>
  `;

  const text = `
    Verify Your Email - Screen Recorder
    
    Welcome ${userName || "there"}!
    
    Thank you for signing up with Screen Recorder! We're excited to have you on board.
    
    To get started, please verify your email address by clicking the link below:
    ${verificationUrl}
    
    Once verified, you'll be able to:
    - Upload and share your screen recordings
    - Manage your video library
    - Access all premium features
    
    This verification link will expire in 24 hours.
    
    If you didn't create an account with Screen Recorder, please ignore this email.
    
    ---
    Need help? Contact us at support@screenrecorder.com
    © ${new Date().getFullYear()} Screen Recorder. All rights reserved.
  `;

  return { html, text };
}
