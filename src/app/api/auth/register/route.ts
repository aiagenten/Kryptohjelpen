import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import supabase from '@/lib/supabase';

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
    const { data: existing } = await supabase
      .from('customers')
      .select('id')
      .eq('email', email.toLowerCase())
      .single();

    if (existing) {
      return NextResponse.json({ error: 'E-postadressen er allerede registrert' }, { status: 400 });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Insert customer
    const { data: customer, error } = await supabase
      .from('customers')
      .insert({
        name,
        email: email.toLowerCase(),
        phone: phone || null,
        password_hash: passwordHash
      })
      .select()
      .single();

    if (error) {
      console.error('Registration error:', error);
      return NextResponse.json({ error: 'Registrering feilet' }, { status: 500 });
    }

    const session = {
      customerId: customer.id,
      email: customer.email,
      name: customer.name
    };

    const response = NextResponse.json({
      success: true,
      customer: {
        id: customer.id,
        name: customer.name,
        email: customer.email
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
