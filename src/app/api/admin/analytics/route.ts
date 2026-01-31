import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import db from '@/lib/db';

async function requireAdmin() {
  const cookieStore = await cookies();
  const session = cookieStore.get('admin_session');
  if (!session) return null;
  try {
    return JSON.parse(session.value);
  } catch {
    return null;
  }
}

export async function GET() {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Total sales
    const totalSales = db.prepare(`
      SELECT COALESCE(SUM(total_nok), 0) as total 
      FROM orders 
      WHERE payment_status = 'completed'
    `).get() as { total: number };

    // Orders by status
    const ordersByStatus = db.prepare(`
      SELECT order_status, COUNT(*) as count 
      FROM orders 
      GROUP BY order_status
    `).all();

    // Payment methods
    const paymentMethods = db.prepare(`
      SELECT payment_method, COUNT(*) as count, COALESCE(SUM(total_nok), 0) as total
      FROM orders 
      WHERE payment_status = 'completed'
      GROUP BY payment_method
    `).all();

    // Recent orders
    const recentOrders = db.prepare(`
      SELECT id, order_number, customer_name, total_nok, payment_status, created_at
      FROM orders 
      ORDER BY created_at DESC 
      LIMIT 10
    `).all();

    // Top products
    const topProducts = db.prepare(`
      SELECT p.name, SUM(oi.quantity) as total_sold, SUM(oi.quantity * oi.price_nok) as revenue
      FROM order_items oi
      JOIN products p ON oi.product_id = p.id
      JOIN orders o ON oi.order_id = o.id
      WHERE o.payment_status = 'completed'
      GROUP BY p.id, p.name
      ORDER BY total_sold DESC
      LIMIT 10
    `).all();

    // Low stock products
    const lowStock = db.prepare(`
      SELECT id, name, stock 
      FROM products 
      WHERE stock < 10 AND is_active = 1
      ORDER BY stock ASC
    `).all();

    return NextResponse.json({
      totalSales: totalSales?.total || 0,
      ordersByStatus,
      paymentMethods,
      recentOrders,
      topProducts,
      lowStock
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 });
  }
}
