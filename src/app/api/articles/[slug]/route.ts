import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    const article = db.prepare(`
      SELECT id, title, slug, content, summary as excerpt, image_url, category, 
             'Kryptohjelpen' as author, created_at,
             seo_title, seo_description, seo_keywords,
             aeo_question, aeo_answer
      FROM articles
      WHERE slug = ? AND is_published = 1
    `).get(slug);

    if (!article) {
      return NextResponse.json({ error: 'Article not found' }, { status: 404 });
    }

    return NextResponse.json(article);
  } catch (error) {
    console.error('Article API error:', error);
    return NextResponse.json({ error: 'Failed to fetch article' }, { status: 500 });
  }
}
