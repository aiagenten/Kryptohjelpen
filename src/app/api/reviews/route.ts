import { NextResponse } from 'next/server';
import supabase from '@/lib/supabase';

// GET visible reviews (public)
export async function GET() {
  try {
    const { data, error } = await supabase
      .from('reviews')
      .select('id, name, rating, review_date, text')
      .eq('visible', true)
      .order('review_date', { ascending: false })
      .limit(6);

    if (error) throw error;
    return NextResponse.json(data);
  } catch (error) {
    console.error('Reviews fetch error:', error);
    return NextResponse.json([], { status: 500 });
  }
}
