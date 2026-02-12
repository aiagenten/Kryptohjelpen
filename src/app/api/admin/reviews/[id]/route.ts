import { NextRequest, NextResponse } from 'next/server';
import supabase from '@/lib/supabase';

// DELETE review
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const { error } = await supabase
      .from('reviews')
      .delete()
      .eq('id', parseInt(id));

    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Review delete error:', error);
    return NextResponse.json({ error: 'Failed to delete review' }, { status: 500 });
  }
}
