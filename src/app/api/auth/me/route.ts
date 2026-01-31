import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import supabase from '@/lib/supabase';

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

      const { data: customer, error } = await supabase
        .from('customers')
        .select('id, name, email, phone, created_at')
        .eq('id', session.customerId)
        .single();

      if (error || !customer) {
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
