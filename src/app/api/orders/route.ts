import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { items, total, paymentMethod, customerEmail, customerName, customerPhone } = body;

    if (!items || items.length === 0) {
      return NextResponse.json({ error: 'No items in order' }, { status: 400 });
    }

    // Generate order number
    const orderNumber = `KH-${Date.now()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;

    // Create order in database (use placeholder for customer info - will be updated after Vipps login)
    const insertOrder = db.prepare(`
      INSERT INTO orders (order_number, customer_email, customer_name, customer_phone, total_nok, payment_method, payment_status, order_status, created_at)
      VALUES (?, ?, ?, ?, ?, ?, 'pending', 'processing', datetime('now'))
    `);
    
    const result = insertOrder.run(
      orderNumber, 
      customerEmail || 'pending@vipps.no',
      customerName || 'Vipps-kunde',
      customerPhone || '',
      total, 
      paymentMethod || 'vipps'
    );
    const orderId = result.lastInsertRowid;

    // Insert order items
    const insertItem = db.prepare(`
      INSERT INTO order_items (order_id, product_id, product_name, price_nok, quantity)
      VALUES (?, ?, ?, ?, ?)
    `);

    for (const item of items) {
      insertItem.run(orderId, item.product_id, item.name, item.price, item.quantity);
    }

    // Clear cart after order creation
    const response = NextResponse.json({
      success: true,
      orderId: orderId,
      orderNumber: orderNumber
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

    let order;
    if (orderId) {
      order = db.prepare('SELECT * FROM orders WHERE id = ?').get(orderId);
    } else {
      order = db.prepare('SELECT * FROM orders WHERE order_number = ?').get(orderNumber);
    }

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    return NextResponse.json(order);

  } catch (error) {
    console.error('Order fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch order' }, { status: 500 });
  }
}
