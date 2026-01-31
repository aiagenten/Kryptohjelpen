import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import db from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const { name, email, phone, password } = await request.json();

    if (!name || !email || !password) {
      return NextResponse.json({ error: 'Navn, e-post og passord er påkrevd' }, { status: 400 });
    }

    if (password.length < 8) {
      return NextResponse.json({ error: 'Passordet må være minst 8 tegn' }, { status: 400 });
    }

    // Check if email already exists
    const existing = db.prepare('SELECT id FROM customers WHERE email = ?').get(email.toLowerCase());

    if (existing) {
      return NextResponse.json({ error: 'E-postadressen er allerede registrert' }, { status: 400 });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Insert customer
    const result = db.prepare(`
      INSERT INTO customers (name, email, phone, password_hash, created_at)
      VALUES (?, ?, ?, ?, datetime('now'))
    `).run(name, email.toLowerCase(), phone || null, passwordHash);

    const customerId = result.lastInsertRowid;

    const session = {
      customerId,
      email: email.toLowerCase(),
      name
    };

    const response = NextResponse.json({
      success: true,
      customer: {
        id: customerId,
        name,
        email: email.toLowerCase()
      }
    });

    response.cookies.set('customer_session', JSON.stringify(session), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7
    });

    return response;
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json({ error: 'Registrering feilet' }, { status: 500 });
  }
}
