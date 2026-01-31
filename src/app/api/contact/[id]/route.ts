import { NextRequest, NextResponse } from 'next/server';
import supabase from '@/lib/supabase';

// Mark as read / update
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { is_read } = await request.json();

    const { error } = await supabase
      .from('contact_messages')
      .update({ is_read: is_read ? true : false })
      .eq('id', id);

    if (error) {
      console.error('Failed to update message:', error);
      return NextResponse.json({ error: 'Kunne ikke oppdatere melding' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to update message:', error);
    return NextResponse.json({ error: 'Kunne ikke oppdatere melding' }, { status: 500 });
  }
}

// Delete message
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const { error } = await supabase
      .from('contact_messages')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Failed to delete message:', error);
      return NextResponse.json({ error: 'Kunne ikke slette melding' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete message:', error);
    return NextResponse.json({ error: 'Kunne ikke slette melding' }, { status: 500 });
  }
}
