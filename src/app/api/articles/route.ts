import { NextRequest, NextResponse } from 'next/server';
import supabase from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');

    const { data: articles, error, count } = await supabase
      .from('articles')
      .select('id, title, slug, summary, image_url, category, created_at', { count: 'exact' })
      .eq('is_published', true)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('Articles API error:', error);
      return NextResponse.json({ articles: [], total: 0 });
    }

    // Add author field for compatibility
    const articlesWithAuthor = articles?.map(a => ({
      ...a,
      excerpt: a.summary,
      author: 'Kryptohjelpen'
    })) || [];

    return NextResponse.json({
      articles: articlesWithAuthor,
      total: count || 0
    });
  } catch (error) {
    console.error('Articles API error:', error);
    return NextResponse.json({ articles: [], total: 0 });
  }
}
