// api/jobs/list/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getListings } from '../../../lib/db';

export async function GET(req: NextRequest) {
  try {
    const listings = await getListings();
    return NextResponse.json(listings);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 });
  }
}
