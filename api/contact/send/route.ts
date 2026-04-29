// api/contact/send/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { sendContactEmail } from '../../../lib/email';
import { getListingById, getListingContact } from '../../../lib/db';

const contactSchema = z.object({
  name: z.string(),
  email: z.string().email(),
  phone: z.string().optional(),
  message: z.string(),
  targetListingId: z.string(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = contactSchema.parse(body);

    const [listing, contact] = await Promise.all([
      getListingById(data.targetListingId),
      getListingContact(data.targetListingId),
    ]);

    if (!listing || !contact) {
      return NextResponse.json({ error: 'Ogłoszenie nie istnieje lub nie ma kontaktu' }, { status: 404 });
    }

    const subject = `Zapytanie o fuchę: ${listing.title || listing.job_title || 'Fucha24'}`;
    const text = `Imię: ${data.name}
Email: ${data.email}
Telefon: ${data.phone || '-'}

Wiadomość:
${data.message}`;

    await sendContactEmail({
      to: contact.email,
      subject,
      text,
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Invalid' }, { status: 400 });
  }
}
