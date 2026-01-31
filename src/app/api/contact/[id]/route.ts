import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

// Mark as read / update
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { is_read } = await request.json();

    const stmt = db.prepare('UPDATE contact_messages SET is_read = ? WHERE id = ?');
    stmt.run(is_read ? 1 : 0, id);

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

    const stmt = db.prepare('DELETE FROM contact_messages WHERE id = ?');
    stmt.run(id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete message:', error);
    return NextResponse.json({ error: 'Kunne ikke slette melding' }, { status: 500 });
  }
}
