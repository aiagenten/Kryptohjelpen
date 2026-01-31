import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import supabase from '@/lib/supabase';

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

    const { data: orders, error } = await supabase
      .from('orders')
      .select('id, order_number, total_nok, order_status, payment_status, created_at')
      .eq('customer_id', session.customerId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Customer orders error:', error);
      return NextResponse.json({ orders: [] });
    }

    // Map status field for compatibility
    const ordersWithStatus = orders?.map(o => ({
      ...o,
      status: o.order_status
    })) || [];

    return NextResponse.json({ orders: ordersWithStatus });
  } catch (error) {
    console.error('Customer orders error:', error);
    return NextResponse.json({ orders: [] });
  }
}
