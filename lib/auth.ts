import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "./db";
import { getPasswordResetEmailTemplate } from "./email/templates";
import { sendEmail } from "./email/brevo";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    usePlural: true,
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification:false,
    sendResetPassword: async ({ user, url }) => {
      // Log in development
      if (process.env.NODE_ENV === 'development') {
        console.log('========================================');
        console.log('🔐 PASSWORD RESET REQUEST');
        console.log('========================================');
        console.log('To:', user.email);
        console.log('Name:', user.name);
        console.log('Reset URL:', url);
        console.log('========================================');
      }

      try {
        // Get email template
        const { html, text } = getPasswordResetEmailTemplate({
          userName: user.name || '',
          resetUrl: url,
        });

        // Send email via Brevo
        await sendEmail({
          to: user.email,
          subject: 'Reset Your Password - Screen Recorder',
          htmlContent: html,
          textContent: text,
        });

        if (process.env.NODE_ENV === 'development') {
          console.log('✅ Password reset email sent successfully via Brevo');
        }
      } catch (error) {
        console.error('❌ Failed to send password reset email:', error);
        throw error;
      }
    },
  },
  secret: process.env.AUTH_SECRET!,
  trustedOrigins: ["http://localhost:3000","https://screen-recorder-app-psi.vercel.app"],
  advanced: {
    database: {
      generateId: false,
    },
  },
});
