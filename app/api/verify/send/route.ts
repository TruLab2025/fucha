// api/verify/send/route.ts
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// Make verification codes accessible across route handlers
declare global {
  var verificationCodes: Map<string, string>;
}

if (!global.verificationCodes) {
  global.verificationCodes = new Map();
}

export async function POST(req: NextRequest) {
  const { phone } = await req.json();
  if (!phone) {
    return NextResponse.json({ error: 'Phone required' }, { status: 400 });
  }
  // generate 6-digit code
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  global.verificationCodes.set(phone, code);
  console.log(`🔐 Demo: Verification code for ${phone}: ${code}`);
  // TODO: integrate SMS provider (Twilio, etc.)
  
  // In demo mode, return code to client so user can test the flow
  return NextResponse.json({ ok: true, demoCode: code });
}