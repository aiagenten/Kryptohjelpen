import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');

    const articles = db.prepare(`
      SELECT id, title, slug, summary as excerpt, image_url, category, 
             'Kryptohjelpen' as author, created_at
      FROM articles
      WHERE is_published = 1
      ORDER BY created_at DESC
      LIMIT ? OFFSET ?
    `).all(limit, offset);

    const countResult = db.prepare(`
      SELECT COUNT(*) as total FROM articles WHERE is_published = 1
    `).get() as { total: number };

    return NextResponse.json({
      articles,
      total: countResult.total
    });
  } catch (error) {
    console.error('Articles API error:', error);
    return NextResponse.json({ articles: [], total: 0 });
  }
}
