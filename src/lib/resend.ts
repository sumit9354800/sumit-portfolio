import { Resend } from 'resend';

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const CONTACT_EMAIL = process.env.CONTACT_EMAIL || 'sumit9354800@gmail.com';

let resendClient: Resend | null = null;

function getResendClient(): Resend | null {
  if (!resendClient && RESEND_API_KEY && RESEND_API_KEY.trim().length > 0) {
    try {
      resendClient = new Resend(RESEND_API_KEY);
    } catch (err) {
      console.warn('[Resend] Client initialization failed:', err);
    }
  }
  return resendClient;
}

export interface SendContactEmailParams {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export async function sendContactEmail(params: SendContactEmailParams): Promise<{ success: boolean; simulated?: boolean; error?: string }> {
  const client = getResendClient();

  if (!client) {
    // In preview/dev mode without Resend API key configured, log the payload and return graceful confirmation
    console.log('[Contact Submission - Local Preview / Logged]:', {
      to: CONTACT_EMAIL,
      from: `${params.name} <${params.email}>`,
      subject: `[Portfolio Inquiry] ${params.subject}`,
      timestamp: new Date().toISOString(),
      message: params.message,
    });
    return {
      success: true,
      simulated: true,
    };
  }

  try {
    const { data, error } = await client.emails.send({
      from: 'Portfolio Contact <onboarding@resend.dev>',
      to: CONTACT_EMAIL,
      replyTo: params.email,
      subject: `[Portfolio Inquiry] ${params.subject} - from ${params.name}`,
      text: `Name: ${params.name}\nEmail: ${params.email}\nSubject: ${params.subject}\nTimestamp: ${new Date().toISOString()}\n\nMessage:\n${params.message}`,
    });

    if (error) {
      console.error('[Resend] Send error:', error);
      return { success: false, error: 'Unable to send message via email provider.' };
    }

    return { success: true };
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    console.error('[Resend] Exception:', errorMessage);
    return { success: false, error: 'Failed to deliver message right now. Please try again later.' };
  }
}
