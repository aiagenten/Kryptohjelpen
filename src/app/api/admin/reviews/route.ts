import { NextRequest, NextResponse } from 'next/server';
import supabase from '@/lib/supabase';

// GET all reviews (admin)
export async function GET() {
  try {
    const { data, error } = await supabase
      .from('reviews')
      .select('*')
      .order('review_date', { ascending: false });

    if (error) throw error;
    return NextResponse.json(data);
  } catch (error) {
    console.error('Reviews fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch reviews' }, { status: 500 });
  }
}

// POST new review
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, rating, review_date, text } = body;

    const { data, error } = await supabase
      .from('reviews')
      .insert({ name, rating, review_date, text, visible: true })
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json(data);
  } catch (error) {
    console.error('Review create error:', error);
    return NextResponse.json({ error: 'Failed to create review' }, { status: 500 });
  }
}

// PUT update review
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, name, rating, review_date, text, visible } = body;

    const { data, error } = await supabase
      .from('reviews')
      .update({ name, rating, review_date, text, visible })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json(data);
  } catch (error) {
    console.error('Review update error:', error);
    return NextResponse.json({ error: 'Failed to update review' }, { status: 500 });
  }
}
