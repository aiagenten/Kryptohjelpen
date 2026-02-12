import { NextRequest, NextResponse } from 'next/server';
import supabase from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { items, total, paymentMethod, customerEmail, customerName, customerPhone, bookingTime } = body;

    if (!items || items.length === 0) {
      return NextResponse.json({ error: 'No items in order' }, { status: 400 });
    }

    // Generate order number
    const orderNumber = `KH-${Date.now()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;

    // Create order in database
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        order_number: orderNumber,
        customer_email: customerEmail || 'pending@vipps.no',
        customer_name: customerName || 'Vipps-kunde',
        customer_phone: customerPhone || '',
        total_nok: total,
        payment_method: paymentMethod || 'vipps',
        payment_status: 'pending',
        order_status: 'processing',
        booking_time: bookingTime || null
      })
      .select()
      .single();

    if (orderError) {
      console.error('Order creation error:', orderError);
      return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
    }

    // Insert order items
    const orderItems = items.map((item: { product_id: number; name: string; price: number; quantity: number }) => ({
      order_id: order.id,
      product_id: item.product_id,
      product_name: item.name,
      price_nok: item.price,
      quantity: item.quantity
    }));

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems);

    if (itemsError) {
      console.error('Order items error:', itemsError);
      // Order was created but items failed - might want to clean up
    }

    // Clear cart after order creation
    const response = NextResponse.json({
      success: true,
      orderId: order.id,
      orderNumber: orderNumber,
      bookingTime: order.booking_time
    });
    
    response.cookies.set('cart', JSON.stringify({ items: [], total: 0 }), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7
    });

    return response;

  } catch (error) {
    console.error('Order creation error:', error);
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get('id');
    const orderNumber = searchParams.get('orderNumber');

    if (!orderId && !orderNumber) {
      return NextResponse.json({ error: 'Order ID or number required' }, { status: 400 });
    }

    let query = supabase.from('orders').select('*');

    if (orderId) {
      query = query.eq('id', orderId);
    } else {
      query = query.eq('order_number', orderNumber);
    }

    const { data: order, error } = await query.single();

    if (error || !order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    return NextResponse.json(order);

  } catch (error) {
    console.error('Order fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch order' }, { status: 500 });
  }
}
