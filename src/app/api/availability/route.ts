import { NextRequest, NextResponse } from 'next/server';
import { findAvailableSlots } from '@/lib/calendar';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const offset = parseInt(searchParams.get('offset') || '0');
    const count = parseInt(searchParams.get('count') || '3');

    const slots = await findAvailableSlots(60, count, offset);

    return NextResponse.json({ slots });
  } catch (error) {
    console.error('Availability error:', error);
    return NextResponse.json({ error: 'Kunne ikke hente ledige tider', slots: [] }, { status: 500 });
  }
}
