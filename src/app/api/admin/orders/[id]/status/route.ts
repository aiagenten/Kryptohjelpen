import { NextRequest, NextResponse } from 'next/server';
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

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;

  try {
    const { orderStatus } = await request.json();

    const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
    if (!validStatuses.includes(orderStatus)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    const { error, count } = await supabase
      .from('orders')
      .update({
        order_status: orderStatus,
        updated_at: new Date().toISOString()
      })
      .eq('id', id);

    if (error) {
      console.error('Error updating order:', error);
      return NextResponse.json({ error: 'Failed to update order' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating order:', error);
    return NextResponse.json({ error: 'Failed to update order' }, { status: 500 });
  }
}
