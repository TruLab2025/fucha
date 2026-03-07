// api/contact/send/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

const contactSchema = z.object({
  senderName: z.string().min(1, 'Imię wymagane'),
  senderEmail: z.string().email('Email wymagany'),
  senderPhone: z.string().optional(),
  message: z.string().min(10, 'Wiadomość musi mieć co najmniej 10 znaków'),
  targetListingId: z.string(),
  targetWorkerEmail: z.string().email(),
  targetWorkerPhone: z.string(),
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

    // In production, here you would:
    // 1. Check company tier and contact limits
    // 2. Send email to worker with sender's contact info
    // 3. Store message in database
    // 4. Decrement company's contact count if firm

    const message = {
      ...data,
      id: Date.now().toString(),
      sentAt: new Date().toISOString(),
    };

    global.demoMessages.push(message);

    // Log for demo
    console.log(`📧 Wiadomość wysłana od "${data.senderName}" do pracownika (Listing: ${data.targetListingId})`);
    console.log(`   Pracownik otrzyma email na: ${data.targetWorkerEmail}`);
    console.log(`   Treść: "${data.message.substring(0, 50)}..."`);

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
