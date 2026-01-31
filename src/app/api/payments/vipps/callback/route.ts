import { NextRequest, NextResponse } from 'next/server';
import Database from 'better-sqlite3';
import path from 'path';

const db = new Database(path.join(process.cwd(), 'database', 'store.db'));

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { orderId, transactionInfo } = body;

    console.log('Vipps callback received:', JSON.stringify(body, null, 2));

    if (!orderId || !transactionInfo) {
      return NextResponse.json({ error: 'Invalid callback data' }, { status: 400 });
    }

    const { status, amount } = transactionInfo;

    // Update order status in database
    if (status === 'SALE' || status === 'RESERVE') {
      // Payment successful
      const stmt = db.prepare(`
        UPDATE orders 
        SET status = 'paid', 
            payment_status = 'completed',
            payment_method = 'vipps',
            payment_reference = ?,
            updated_at = datetime('now')
        WHERE id = ? OR order_number = ?
      `);
      
      stmt.run(orderId, orderId, orderId);
      console.log(`Order ${orderId} marked as paid via Vipps`);

    } else if (status === 'CANCELLED' || status === 'REJECTED') {
      // Payment failed/cancelled
      const stmt = db.prepare(`
        UPDATE orders 
        SET status = 'cancelled', 
            payment_status = 'failed',
            updated_at = datetime('now')
        WHERE id = ? OR order_number = ?
      `);
      
      stmt.run(orderId, orderId);
      console.log(`Order ${orderId} marked as cancelled`);
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
