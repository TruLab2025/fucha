// api/jobs/list/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getListings } from '../../../../lib/db';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type') || 'worker';
    const province = searchParams.get('province') || undefined;
    const city = searchParams.get('city') || undefined;
    const category = searchParams.get('category') || undefined;
    const date = searchParams.get('date') || undefined;

    const listings = await getListings({
      type: type as 'worker' | 'employer',
      province: province,
      city: city,
      category: category,
      available_date: date,
    });

    // Remove sensitive data (phone/email are private and only shared via contact form)
    const sanitized = listings.map(({ phone, email, ...listing }) => listing);

    return NextResponse.json(sanitized);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 });
  }
}
