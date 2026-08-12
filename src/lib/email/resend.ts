import { getSystemSettings } from '@/lib/ai/settings-service';

export interface EmailPayload {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail({ to, subject, html }: EmailPayload): Promise<boolean> {
  const settings = await getSystemSettings();
  const resendKey = settings.resend_api_key || process.env.RESEND_API_KEY;

  if (!resendKey) {
    console.log(`[EMAIL SIMULATED - No Resend Key] To: ${to} | Subject: ${subject}`);
    return true;
  }

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Readora Library <noreply@readora.org>',
        to: [to],
        subject,
        html,
      }),
    });

    if (res.ok) {
      console.log(`✅ Email sent via Resend to ${to}`);
      return true;
    } else {
      const errData = await res.json();
      console.error('Resend Email Error:', errData);
      return false;
    }
  } catch (err) {
    console.error('Send Email Network Error:', err);
    return false;
  }
}

export async function sendWelcomeEmail(email: string, name?: string) {
  return sendEmail({
    to: email,
    subject: 'Welcome to Readora — Your Global Public Domain Library',
    html: `
      <div style="font-family: serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #1e293b;">
        <h1 style="color: #4f46e5;">Welcome to Readora!</h1>
        <p>Hello ${name || 'Reader'},</p>
        <p>Thank you for joining Readora. You now have access to thousands of copyright-free classics, sacred manuscripts, and world literature.</p>
        <p>Happy Reading!</p>
        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
        <p style="font-size: 12px; color: #64748b;">Readora — Global Copyright-Free Online Library</p>
      </div>
    `,
  });
}

export async function sendOrgInvitationEmail(email: string, orgName: string, inviteUrl: string) {
  return sendEmail({
    to: email,
    subject: `You've been invited to join ${orgName} on Readora`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2>Invitation to ${orgName}</h2>
        <p>An administrator has invited you to join their institutional subscription on Readora.</p>
        <p><a href="${inviteUrl}" style="background-color: #4f46e5; color: white; padding: 10px 20px; text-decoration: none; border-radius: 20px;">Accept Invitation</a></p>
      </div>
    `,
  });
}
