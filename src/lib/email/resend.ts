export interface EmailPayload {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail({ to, subject, html }: EmailPayload): Promise<boolean> {
  const resendKey = process.env.RESEND_API_KEY;

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
        from: 'Literary Harbour <noreply@literaryharbour.com>',
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
  } catch (error) {
    console.error('Resend fetch exception:', error);
    return false;
  }
}
