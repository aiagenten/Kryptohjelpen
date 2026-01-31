import { NextRequest, NextResponse } from 'next/server';
import supabase from '@/lib/supabase';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    const { data: article, error } = await supabase
      .from('articles')
      .select(`
        id, title, slug, content, summary, image_url, category, created_at,
        seo_title, seo_description, seo_keywords,
        aeo_question, aeo_answer
      `)
      .eq('slug', slug)
      .eq('is_published', true)
      .single();

    if (error || !article) {
      return NextResponse.json({ error: 'Article not found' }, { status: 404 });
    }

    return NextResponse.json({
      ...article,
      excerpt: article.summary,
      author: 'Kryptohjelpen'
    });
  } catch (error) {
    console.error('Article API error:', error);
    return NextResponse.json({ error: 'Failed to fetch article' }, { status: 500 });
  }
}
