import { NextRequest, NextResponse } from 'next/server';

const BOOKING_SERVICE_URL = process.env.BOOKING_SERVICE_URL || 'https://booking-service-production-d08e.up.railway.app';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const offset = searchParams.get('offset') || '0';
    const count = searchParams.get('count') || '3';

    // Use booking-service as single source of truth
    const response = await fetch(
      `${BOOKING_SERVICE_URL}/api/availability/kryptohjelpen?offset=${offset}&count=${count}`,
      { next: { revalidate: 60 } } // Cache for 1 minute
    );

    if (!response.ok) {
      throw new Error('Booking service unavailable');
    }

    const data = await response.json();

    return NextResponse.json({ slots: data.slots });
  } catch (error) {
    console.error('Availability error:', error);
    return NextResponse.json({ error: 'Kunne ikke hente ledige tider', slots: [] }, { status: 500 });
  }
}
