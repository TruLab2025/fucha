// api/jobs/create/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createListing } from '../../../../lib/db';

export const dynamic = 'force-dynamic';

const baseSchema = z.object({
  type: z.enum(['worker', 'employer']),
  phone: z.string(),
  email: z.string().email(),
  description: z.string(),
  terms: z.boolean(),
  hp: z.string().optional(),
});

const workerSchema = baseSchema.extend({
  type: z.literal('worker'),
  title: z.string(),
  province: z.string(),
  city: z.string(),
  category: z.string(),
  availability_mode: z.enum(['single', 'range']).optional(),
  available_date: z.string(),
  available_to: z.string().optional(),
  available_hours: z.string().optional(),
  rate_type: z.enum(['hourly', 'daily']).optional(),
  rate: z.string(),
});

const employerSchema = baseSchema.extend({
  type: z.literal('employer'),
  company_name: z.string(),
  job_title: z.string(),
  skills_required: z.string(),
  experience_level: z.string(),
  salary_min: z.string(),
  salary_max: z.string(),
});

const jobSchema = z.discriminatedUnion('type', [workerSchema, employerSchema]);

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    // simple anti-spam: honeypot field should be empty
    if (body.hp) {
      return NextResponse.json({ error: 'Spam detected' }, { status: 400 });
    }
    
    // terms must be accepted
    if (!body.terms) {
      return NextResponse.json({ error: 'Regulamin wymagany' }, { status: 400 });
    }
    
    // phone must be exactly 9 digits
    const phoneDigits = body.phone.replace(/\D/g, '');
    if (phoneDigits.length !== 9) {
      return NextResponse.json({ error: 'Telefon musi mieć dokładnie 9 cyfr' }, { status: 400 });
    }
    
    const data = jobSchema.parse(body);
    const listing = await createListing(data as any);
    return NextResponse.json(listing);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Invalid' }, { status: 400 });
  }
}
