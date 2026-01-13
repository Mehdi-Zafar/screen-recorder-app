// /lib/email/brevo.ts (Complete with error handling)

export interface SendEmailOptions {
  to: string;
  subject: string;
  htmlContent: string;
  textContent?: string;
}

export async function sendEmail(options: SendEmailOptions) {
  const { to, subject, htmlContent, textContent } = options;

  // Validate environment variables
  if (!process.env.BREVO_API_KEY) {
    throw new Error('BREVO_API_KEY is not set');
  }

  if (!process.env.BREVO_SENDER_EMAIL) {
    throw new Error('BREVO_SENDER_EMAIL is not set');
  }

  const payload = {
    sender: {
      name: process.env.BREVO_SENDER_NAME || 'Screen Recorder',
      email: process.env.BREVO_SENDER_EMAIL,
    },
    to: [{ email: to }],
    subject,
    htmlContent,
    ...(textContent && { textContent }),
  };

  try {
    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'api-key': process.env.BREVO_API_KEY,
        'content-type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const result = await response.json();

    if (!response.ok) {
      console.error('❌ Brevo API error:', {
        status: response.status,
        statusText: response.statusText,
        error: result,
      });
      throw new Error(`Brevo API error: ${result.message || response.statusText}`);
    }

    return result;
  } catch (error) {
    console.error('❌ Email send failed:', error);
    throw error;
  }
}

// Helper function to test email sending
export async function testEmailConnection() {
  try {

    const result = await sendEmail({
      to: process.env.BREVO_SENDER_EMAIL || '',
      subject: 'Test Email from Screen Recorder',
      htmlContent: '<h1>Test Email</h1><p>If you received this, your Brevo setup is working!</p>',
      textContent: 'Test Email - If you received this, your Brevo setup is working!',
    });

    return true;
  } catch (error) {
    console.error('❌ Test email failed:', error);
    return false;
  }
}