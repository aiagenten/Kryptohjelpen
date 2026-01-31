import { NextResponse } from 'next/server';
import supabase from '@/lib/supabase';

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('category')
      .not('category', 'is', null)
      .not('category', 'eq', '');

    if (error) {
      console.error('Categories API error:', error);
      return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 });
    }

    // Get unique categories
    const uniqueCategories = [...new Set(data?.map(p => p.category))];
    const categories = uniqueCategories.sort().map(cat => ({
      slug: cat,
      name: cat
    }));

    return NextResponse.json(categories);
  } catch (error) {
    console.error('Categories API error:', error);
    return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 });
  }
}
