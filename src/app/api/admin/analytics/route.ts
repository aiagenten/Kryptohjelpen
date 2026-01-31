import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import supabase from '@/lib/supabase';

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
    const { data: salesData } = await supabase
      .from('orders')
      .select('total_nok')
      .eq('payment_status', 'completed');
    
    const totalSales = salesData?.reduce((sum, o) => sum + (o.total_nok || 0), 0) || 0;

    // Orders by status
    const { data: allOrders } = await supabase
      .from('orders')
      .select('order_status');
    
    const statusCounts: Record<string, number> = {};
    allOrders?.forEach(o => {
      statusCounts[o.order_status] = (statusCounts[o.order_status] || 0) + 1;
    });
    const ordersByStatus = Object.entries(statusCounts).map(([order_status, count]) => ({
      order_status,
      count
    }));

    // Payment methods
    const { data: completedOrders } = await supabase
      .from('orders')
      .select('payment_method, total_nok')
      .eq('payment_status', 'completed');
    
    const methodStats: Record<string, { count: number; total: number }> = {};
    completedOrders?.forEach(o => {
      if (!methodStats[o.payment_method]) {
        methodStats[o.payment_method] = { count: 0, total: 0 };
      }
      methodStats[o.payment_method].count++;
      methodStats[o.payment_method].total += o.total_nok || 0;
    });
    const paymentMethods = Object.entries(methodStats).map(([payment_method, stats]) => ({
      payment_method,
      count: stats.count,
      total: stats.total
    }));

    // Recent orders
    const { data: recentOrders } = await supabase
      .from('orders')
      .select('id, order_number, customer_name, total_nok, payment_status, created_at')
      .order('created_at', { ascending: false })
      .limit(10);

    // Top products
    const { data: orderItems } = await supabase
      .from('order_items')
      .select(`
        quantity, price_nok, product_id,
        products(name),
        orders!inner(payment_status)
      `)
      .eq('orders.payment_status', 'completed');
    
    const productStats: Record<string, { name: string; total_sold: number; revenue: number }> = {};
    orderItems?.forEach(item => {
      const name = (item.products as any)?.name || 'Unknown';
      if (!productStats[item.product_id]) {
        productStats[item.product_id] = { name, total_sold: 0, revenue: 0 };
      }
      productStats[item.product_id].total_sold += item.quantity;
      productStats[item.product_id].revenue += item.quantity * item.price_nok;
    });
    const topProducts = Object.values(productStats)
      .sort((a, b) => b.total_sold - a.total_sold)
      .slice(0, 10);

    // Low stock products
    const { data: lowStock } = await supabase
      .from('products')
      .select('id, name, stock')
      .eq('is_active', true)
      .lt('stock', 10)
      .order('stock', { ascending: true });

    return NextResponse.json({
      totalSales,
      ordersByStatus,
      paymentMethods,
      recentOrders: recentOrders || [],
      topProducts,
      lowStock: lowStock || []
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 });
  }
}
