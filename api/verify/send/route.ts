// api/verify/send/route.ts
import { NextRequest, NextResponse } from 'next/server';

// simple in-memory store of codes by phone
const codes = new Map<string, string>();

export async function POST(req: NextRequest) {
  const { phone } = await req.json();
  if (!phone) {
    return NextResponse.json({ error: 'Phone required' }, { status: 400 });
  }
  // generate 6-digit code
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  codes.set(phone, code);
  console.log(`🔐 Demo: Verification code for ${phone}: ${code}`);
  // TODO: integrate SMS provider (Twilio, etc.)
  
  // In demo mode, return code to client so user can test the flow
  return NextResponse.json({ ok: true, demoCode: code });
}

export function getCode(phone: string) {
  return codes.get(phone);
}