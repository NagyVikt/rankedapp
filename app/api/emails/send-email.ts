// pages/api/send-email.ts
import type { NextApiRequest, NextApiResponse } from 'next';

type Data = { success: boolean; error?: string };

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>,
) {
  if (req.method !== 'POST') {
    return res
      .status(405)
      .json({ success: false, error: 'Method not allowed' });
  }

  const { to, subject, html } = req.body as {
    to: string;
    subject: string;
    html: string;
  };

  const apiKey = process.env.SENDGRID_API_KEY;
  const from = process.env.SENDGRID_FROM_EMAIL;

  if (!apiKey || !from) {
    return res
      .status(500)
      .json({ success: false, error: 'Missing SendGrid configuration' });
  }

  try {
    const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        personalizations: [
          {
            to: [{ email: to }],
            subject,
          },
        ],
        from: { email: from },
        content: [
          {
            type: 'text/html',
            value: html,
          },
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return res
        .status(response.status)
        .json({ success: false, error: errorText });
    }

    return res.status(200).json({ success: true });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
}
