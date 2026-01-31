import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import supabase from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'E-post og passord er påkrevd' }, { status: 400 });
    }

    const { data: customer, error } = await supabase
      .from('customers')
      .select('id, name, email, password_hash')
      .eq('email', email.toLowerCase())
      .single();

    if (error || !customer) {
      return NextResponse.json({ error: 'Feil e-post eller passord' }, { status: 401 });
    }

    const passwordMatch = await bcrypt.compare(password, customer.password_hash);

    if (!passwordMatch) {
      return NextResponse.json({ error: 'Feil e-post eller passord' }, { status: 401 });
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
      maxAge: 60 * 60 * 24 * 7 // 7 days
    });

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Innlogging feilet' }, { status: 500 });
  }
}
