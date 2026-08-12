'use client';

import { useRef, useState } from 'react';
import { Check, Mail, MapPin, Phone } from 'lucide-react';
import { BRAND, STORES } from '@bobby/shared';
import {
  Alert,
  Button,
  Container,
  Field,
  Input,
  SectionHeading,
  Textarea,
} from '@bobby/ui';

export default function ContactPage() {
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [form, setForm] = useState({ name: '', email: '', phone: '', subject: '', message: '' });

  // Spam controls: a field humans never fill, plus a minimum time-to-submit.
  const honeypot = useRef('');
  const renderedAt = useRef(Date.now());

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((f) => ({ ...f, [k]: e.target.value }));
    setErrors((p) => {
      if (!p[k]) return p;
      const n = { ...p };
      delete n[k];
      return n;
    });
  };

  async function submit(e: React.FormEvent) {
    e.preventDefault();

    const next: Record<string, string> = {};
    if (form.name.trim().length < 2) next.name = 'Enter your name';
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email)) next.email = 'Enter a valid email address';
    if (form.subject.trim().length < 3) next.subject = 'Enter a subject';
    if (form.message.trim().length < 10) next.message = 'Tell us a little more';
    setErrors(next);
    if (Object.keys(next).length) return;

    setStatus('sending');
    const res = await fetch('/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, honeypot: honeypot.current, renderedAt: renderedAt.current }),
    });

    if (res.ok) {
      setStatus('sent');
      setForm({ name: '', email: '', phone: '', subject: '', message: '' });
    } else {
      setStatus('error');
    }
  }

  return (
    <div className="py-12">
      <Container wide>
        <SectionHeading
          eyebrow="Get in touch"
          title="Contact Us"
          subtitle="Questions about an order, a fabric, or a fitting? We usually reply the same day."
          className="mb-12"
          as="h1"
        />

        <div className="grid gap-12 lg:grid-cols-[1fr_1.2fr]">
          {/* Details */}
          <div className="flex flex-col gap-6">
            <a
              href={`tel:+91${BRAND.contact.phone}`}
              className="flex items-start gap-4 border border-line bg-card p-5 transition-colors hover:border-maroon"
            >
              <Phone className="mt-0.5 size-5 shrink-0 text-gold-muted" aria-hidden="true" />
              <span>
                <span className="label-caps block text-muted">Call us</span>
                <span className="mt-1 block text-lg text-maroon">{BRAND.contact.phoneDisplay}</span>
                <span className="text-xs text-muted">11 AM – 9:30 PM, all days</span>
              </span>
            </a>

            <a
              href={`mailto:${BRAND.contact.email}`}
              className="flex items-start gap-4 border border-line bg-card p-5 transition-colors hover:border-maroon"
            >
              <Mail className="mt-0.5 size-5 shrink-0 text-gold-muted" aria-hidden="true" />
              <span>
                <span className="label-caps block text-muted">Email</span>
                <span className="mt-1 block text-sm text-maroon">{BRAND.contact.email}</span>
              </span>
            </a>

            <div className="flex items-start gap-4 border border-line bg-card p-5">
              <MapPin className="mt-0.5 size-5 shrink-0 text-gold-muted" aria-hidden="true" />
              <span>
                <span className="label-caps block text-muted">Visit</span>
                <span className="mt-1 block text-sm text-ink">{STORES[0]?.name}</span>
                <span className="block text-xs text-muted">
                  {STORES[0]?.addressLine}, {STORES[0]?.area}
                </span>
              </span>
            </div>
          </div>

          {/* Form */}
          <div className="border border-line bg-card p-6 sm:p-8">
            {status === 'sent' ? (
              <div className="flex flex-col items-center gap-3 py-12 text-center">
                <span className="flex size-12 items-center justify-center rounded-full bg-success-soft text-success">
                  <Check className="size-6" aria-hidden="true" />
                </span>
                <h2 className="font-display text-2xl text-maroon">Message sent</h2>
                <p className="text-sm text-muted">We&apos;ll get back to you shortly.</p>
                <Button variant="ghost" onClick={() => setStatus('idle')} className="mt-2">
                  Send another
                </Button>
              </div>
            ) : (
              <form onSubmit={submit} noValidate className="flex flex-col gap-4">
                {/* Honeypot — hidden from users, catches naive bots. */}
                <input
                  type="text"
                  tabIndex={-1}
                  autoComplete="off"
                  aria-hidden="true"
                  onChange={(e) => (honeypot.current = e.target.value)}
                  className="absolute left-[-9999px] size-0"
                />

                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Name" required error={errors.name} htmlFor="name">
                    <Input id="name" value={form.name} onChange={set('name')} invalid={!!errors.name} autoComplete="name" />
                  </Field>
                  <Field label="Email" required error={errors.email} htmlFor="cemail">
                    <Input
                      id="cemail"
                      type="email"
                      value={form.email}
                      onChange={set('email')}
                      invalid={!!errors.email}
                      autoComplete="email"
                    />
                  </Field>
                </div>

                <Field label="Phone" htmlFor="cphone" hint="Optional">
                  <Input id="cphone" type="tel" value={form.phone} onChange={set('phone')} autoComplete="tel" />
                </Field>

                <Field label="Subject" required error={errors.subject} htmlFor="subject">
                  <Input id="subject" value={form.subject} onChange={set('subject')} invalid={!!errors.subject} />
                </Field>

                <Field label="Message" required error={errors.message} htmlFor="message">
                  <Textarea id="message" rows={5} value={form.message} onChange={set('message')} invalid={!!errors.message} maxLength={2000} />
                </Field>

                {status === 'error' && (
                  <Alert tone="danger">
                    We couldn&apos;t send that. Please try again, or call us on{' '}
                    {BRAND.contact.phoneDisplay}.
                  </Alert>
                )}

                <Button type="submit" size="lg" fullWidth loading={status === 'sending'}>
                  Send message
                </Button>
              </form>
            )}
          </div>
        </div>
      </Container>
    </div>
  );
}
