import { NextRequest, NextResponse } from 'next/server';
import supabase from '@/lib/supabase';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json({ error: 'Order ID required' }, { status: 400 });
    }

    // Try to find order by id or order_number
    const { data: order, error } = await supabase
      .from('orders')
      .select('id, order_number, order_status, payment_status, total_amount, created_at')
      .or(`id.eq.${id},order_number.eq.${id}`)
      .single();

    if (error || !order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    return NextResponse.json(order);

  } catch (error) {
    console.error('Order fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch order' }, { status: 500 });
  }
}
