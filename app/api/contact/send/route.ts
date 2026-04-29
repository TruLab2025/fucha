// api/contact/send/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { sendContactEmail } from '../../../../lib/email';
import { getListingById, getListingContact } from '../../../../lib/db';

export const dynamic = 'force-dynamic';

const contactSchema = z.object({
  senderName: z.string().min(1, 'Imię wymagane'),
  senderEmail: z.string().email('Email wymagany'),
  senderPhone: z.string().optional(),
  message: z.string().min(10, 'Wiadomość musi mieć co najmniej 10 znaków'),
  targetListingId: z.string(),
  isCompany: z.boolean().optional(),
});

type ContactInput = z.infer<typeof contactSchema>;

// Demo storage for messages
declare global {
  var demoMessages: Array<ContactInput & { id: string; sentAt: string }>;
}

if (!global.demoMessages) {
  global.demoMessages = [];
}

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

    const message = {
      ...data,
      id: Date.now().toString(),
      sentAt: new Date().toISOString(),
    };

    global.demoMessages.push(message);

    // Log for demo
    const subject = `Zapytanie o ogłoszenie: ${listing.title || listing.job_title || 'Fucha24'}`;
    const text = `Imię: ${data.senderName}
Email: ${data.senderEmail}
Telefon: ${data.senderPhone || '-'}

Wiadomość:
${data.message}`;

    await sendContactEmail({
      to: contact.email,
      subject,
      text,
    });

    console.log(`📧 Wiadomość wysłana od "${data.senderName}" do listingu ${data.targetListingId}`);

    return NextResponse.json({
      success: true,
      messageId: message.id,
    });
  } catch (err) {
    console.error('Contact send error:', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Błąd wysyłania wiadomości' },
      { status: 400 }
    );
  }
}
