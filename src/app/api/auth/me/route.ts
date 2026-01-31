import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import db from '@/lib/db';

interface Customer {
  id: number;
  name: string;
  email: string;
  phone?: string;
  created_at: string;
}

export async function GET() {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('customer_session');

    if (!sessionCookie) {
      return NextResponse.json({ authenticated: false });
    }

    try {
      const session = JSON.parse(sessionCookie.value);
      
      if (!session.customerId) {
        return NextResponse.json({ authenticated: false });
      }

      const customer = db.prepare(`
        SELECT id, name, email, phone, created_at
        FROM customers
        WHERE id = ?
      `).get(session.customerId) as Customer | undefined;

      if (!customer) {
        return NextResponse.json({ authenticated: false });
      }

      return NextResponse.json({
        authenticated: true,
        customer
      });
    } catch {
      return NextResponse.json({ authenticated: false });
    }
  } catch (error) {
    console.error('Auth check error:', error);
    return NextResponse.json({ authenticated: false });
  }
}
