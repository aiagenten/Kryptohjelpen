import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import db from '@/lib/db';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('customer_session');

    if (!sessionCookie) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const session = JSON.parse(sessionCookie.value);

    if (!session.customerId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const orders = db.prepare(`
      SELECT id, order_number, total_nok, status, payment_status, created_at
      FROM orders
      WHERE customer_id = ?
      ORDER BY created_at DESC
    `).all(session.customerId);

    return NextResponse.json({ orders });
  } catch (error) {
    console.error('Customer orders error:', error);
    return NextResponse.json({ orders: [] });
  }
}
