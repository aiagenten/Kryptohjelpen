import { NextRequest, NextResponse } from 'next/server';
import supabase from '@/lib/supabase';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: NextRequest) {
  try {
    const { name, email, phone, topic, message, date, time } = await request.json();

    if (!name || !email || !topic || !date || !time) {
      return NextResponse.json({ error: 'Manglende påkrevde felt' }, { status: 400 });
    }

    const bookingId = uuidv4();

    const { error } = await supabase
      .from('bookings')
      .insert({
        id: bookingId,
        customer_name: name,
        customer_email: email,
        customer_phone: phone || null,
        booking_date: date,
        booking_time: time,
        notes: topic + (message ? `: ${message}` : ''),
        status: 'pending',
        payment_status: 'pending',
        duration_minutes: 60,
        price_nok: 1490
      });

    if (error) {
      console.error('Booking error:', error);
      return NextResponse.json({ error: 'Kunne ikke registrere booking' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      bookingId,
      message: 'Booking registrert'
    });
  } catch (error) {
    console.error('Booking error:', error);
    return NextResponse.json({ error: 'Kunne ikke registrere booking' }, { status: 500 });
  }
}
