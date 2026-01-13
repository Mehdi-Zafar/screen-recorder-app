import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "./db";
import {
  getEmailVerificationTemplate,
  getPasswordResetEmailTemplate,
} from "./email/templates";
import { sendEmail } from "./email/brevo";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    usePlural: true,
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    sendResetPassword: async ({ user, url }) => {
      try {
        // Get email template
        const { html, text } = getPasswordResetEmailTemplate({
          userName: user.name || "",
          resetUrl: url,
        });

        // Send email via Brevo
        await sendEmail({
          to: user.email,
          subject: "Reset Your Password - Screen Recorder",
          htmlContent: html,
          textContent: text,
        });

      } catch (error) {
        console.error("❌ Failed to send password reset email:", error);
        throw error;
      }
    },
  },
  emailVerification: {
    sendVerificationEmail: async ({ user, url }) => {

      try {
        const { html, text } = getEmailVerificationTemplate({
          userName: user.name || "",
          verificationUrl: url,
        });

        await sendEmail({
          to: user.email,
          subject: "Verify Your Email - Screen Recorder",
          htmlContent: html,
          textContent: text,
        });

      } catch (error) {
        console.error("❌ Failed to send verification email:", error);
        throw error;
      }
    },
    sendOnSignIn: true,
    sendOnSignUp: true,
    autoSignInAfterVerification: true,
  },
  secret: process.env.BETTER_AUTH_SECRET!,
  trustedOrigins: [
    "http://localhost:3000",
    "https://screen-recorder-app-psi.vercel.app",
  ],
  advanced: {
    database: {
      generateId: false,
    },
  },
});
