import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: NextRequest) {
  try {
    const { name, email, phone, topic, message, date, time } = await request.json();

    if (!name || !email || !topic || !date || !time) {
      return NextResponse.json({ error: 'Manglende påkrevde felt' }, { status: 400 });
    }

    const bookingId = uuidv4();

    // Check if bookings table exists, create if not
    db.exec(`
      CREATE TABLE IF NOT EXISTS bookings (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT NOT NULL,
        phone TEXT,
        topic TEXT NOT NULL,
        message TEXT,
        booking_date TEXT NOT NULL,
        booking_time TEXT NOT NULL,
        status TEXT DEFAULT 'pending',
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      )
    `);

    db.prepare(`
      INSERT INTO bookings (id, name, email, phone, topic, message, booking_date, booking_time)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(bookingId, name, email, phone || null, topic, message || null, date, time);

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
