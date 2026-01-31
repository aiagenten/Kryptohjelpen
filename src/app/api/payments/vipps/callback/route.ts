import { NextRequest, NextResponse } from 'next/server';
import supabase from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { orderId, transactionInfo } = body;

    console.log('Vipps callback received:', JSON.stringify(body, null, 2));

    if (!orderId || !transactionInfo) {
      return NextResponse.json({ error: 'Invalid callback data' }, { status: 400 });
    }

    const { status } = transactionInfo;

    // Update order status in database
    if (status === 'SALE' || status === 'RESERVE') {
      // Payment successful
      const { error } = await supabase
        .from('orders')
        .update({
          order_status: 'paid',
          payment_status: 'completed',
          payment_method: 'vipps',
          updated_at: new Date().toISOString()
        })
        .or(`id.eq.${orderId},order_number.eq.${orderId}`);

      if (error) {
        console.error('Error updating order:', error);
      } else {
        console.log(`Order ${orderId} marked as paid via Vipps`);
      }

    } else if (status === 'CANCELLED' || status === 'REJECTED') {
      // Payment failed/cancelled
      const { error } = await supabase
        .from('orders')
        .update({
          order_status: 'cancelled',
          payment_status: 'failed',
          updated_at: new Date().toISOString()
        })
        .or(`id.eq.${orderId},order_number.eq.${orderId}`);

      if (error) {
        console.error('Error updating order:', error);
      } else {
        console.log(`Order ${orderId} marked as cancelled`);
      }
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Vipps callback error:', error);
    return NextResponse.json(
      { error: 'Callback processing failed' },
      { status: 500 }
    );
  }
}

// Vipps also sends GET requests to check if callback URL is valid
export async function GET() {
  return NextResponse.json({ status: 'ok' });
}
