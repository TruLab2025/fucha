// api/jobs/create/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createListing } from '../../../lib/db';

const jobSchema = z.object({
  title: z.string(),
  description: z.string(),
  province: z.string(),
  city: z.string(),
  category: z.string(),
  available_date: z.string(),
  available_hours: z.string(),
  rate: z.string(),
  phone: z.string(),
  email: z.string().email(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    // simple anti-spam: honeypot field should be empty
    if (body.hp) {
      return NextResponse.json({ error: 'Spam detected' }, { status: 400 });
    }
    // terms must be accepted (rodo is optional)
    if (!body.terms) {
      return NextResponse.json({ error: 'Regulamin wymagany' }, { status: 400 });
    }
    // phone must be exactly 9 digits
    const phoneDigits = body.phone.replace(/\D/g, '');
    if (phoneDigits.length !== 9) {
      return NextResponse.json({ error: 'Telefon musi mieć dokładnie 9 cyfr' }, { status: 400 });
    }
    // TODO: future improvement - send SMS/OTP verification to phone to prevent spam
    const data = jobSchema.parse(body);
    const listing = await createListing(data);
    return NextResponse.json(listing);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Invalid' }, { status: 400 });
  }
}
