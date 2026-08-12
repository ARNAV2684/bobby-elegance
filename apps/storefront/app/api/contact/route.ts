import { NextResponse } from 'next/server';
import { contactSchema } from '@bobby/shared';

/** Naive in-memory limiter. Upstash Redis replaces this when configured. */
const hits = new Map<string, number[]>();
const WINDOW_MS = 60_000;
const MAX_PER_WINDOW = 3;

function rateLimited(key: string): boolean {
  const now = Date.now();
  const recent = (hits.get(key) ?? []).filter((t) => now - t < WINDOW_MS);
  if (recent.length >= MAX_PER_WINDOW) return true;
  recent.push(now);
  hits.set(key, recent);
  return false;
}

/**
 * Contact form.
 *
 * With no RESEND_API_KEY set, submissions are logged to the server console
 * rather than emailed — which is what happens in this development build.
 * Setting the key is all that is needed to start delivering mail.
 */
export async function POST(request: Request) {
  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    request.headers.get('x-real-ip') ??
    'unknown';

  if (rateLimited(ip)) {
    return NextResponse.json(
      { error: 'Too many messages. Please wait a minute and try again.' },
      { status: 429 },
    );
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }

  const parsed = contactSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Please check the form and try again.' }, { status: 400 });
  }

  const data = parsed.data;

  // Honeypot: a filled hidden field means a bot. Respond 200 so the bot has no
  // signal that it was caught and does not adapt.
  if (data.honeypot) {
    return NextResponse.json({ ok: true });
  }

  // Time check: a human cannot read and complete this form in under 2 seconds.
  if (data.renderedAt && Date.now() - data.renderedAt < 2000) {
    return NextResponse.json({ ok: true });
  }

  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    console.info('[contact] RESEND_API_KEY not set — logging instead of sending:', {
      name: data.name,
      email: data.email,
      phone: data.phone || '(none)',
      subject: data.subject,
      message: data.message.slice(0, 200),
    });
    return NextResponse.json({ ok: true, delivered: false });
  }

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: process.env.EMAIL_FROM ?? 'orders@bobbyelegance.com',
        to: process.env.EMAIL_ADMIN ?? process.env.CONTACT_TO_EMAIL,
        reply_to: data.email,
        subject: `[Website] ${data.subject}`,
        text: [
          `From: ${data.name} <${data.email}>`,
          data.phone ? `Phone: ${data.phone}` : null,
          '',
          data.message,
        ]
          .filter(Boolean)
          .join('\n'),
      }),
    });

    if (!res.ok) throw new Error(`Resend responded ${res.status}`);
    return NextResponse.json({ ok: true, delivered: true });
  } catch (error) {
    console.error('[contact] send failed', error);
    return NextResponse.json({ error: 'Could not send your message.' }, { status: 502 });
  }
}
