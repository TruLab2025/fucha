// api/verify/check/route.ts
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

declare global {
  var verificationCodes: Map<string, string>;
}

export async function POST(req: NextRequest) {
  const { phone, code } = await req.json();
  if (!phone || !code) {
    return NextResponse.json({ error: 'Missing data' }, { status: 400 });
  }
  const expected = global.verificationCodes?.get(phone);
  if (expected === code) {
    global.verificationCodes.delete(phone); // cleanup
    return NextResponse.json({ ok: true });
  }
  return NextResponse.json({ error: 'Invalid code' }, { status: 400 });
}
