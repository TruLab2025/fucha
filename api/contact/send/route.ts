// api/contact/send/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { sendContactEmail } from '../../../lib/email';

const contactSchema = z.object({
  name: z.string(),
  email: z.string().email(),
  phone: z.string().optional(),
  message: z.string(),
  listing: z.object({
    id: z.string(),
    title: z.string(),
    email: z.string().email(),
  }),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = contactSchema.parse(body);

    const subject = `Zapytanie o fuchę: ${data.listing.title}`;
    const text = `Imię: ${data.name}
Email: ${data.email}
Telefon: ${data.phone || '-'}

Wiadomość:
${data.message}`;

    await sendContactEmail({
      to: data.listing.email,
      subject,
      text,
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Invalid' }, { status: 400 });
  }
}
