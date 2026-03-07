// api/verify/check/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getCode } from '../send/route';

export async function POST(req: NextRequest) {
  const { phone, code } = await req.json();
  if (!phone || !code) {
    return NextResponse.json({ error: 'Missing data' }, { status: 400 });
  }
  const expected = getCode(phone);
  if (expected === code) {
    return NextResponse.json({ ok: true });
  }
  return NextResponse.json({ error: 'Invalid code' }, { status: 400 });
}
