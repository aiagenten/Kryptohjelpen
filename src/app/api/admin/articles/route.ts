import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import db from '@/lib/db';

async function requireAdmin() {
  const cookieStore = await cookies();
  const session = cookieStore.get('admin_session');
  if (!session) return null;
  try {
    return JSON.parse(session.value);
  } catch {
    return null;
  }
}

export async function GET() {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const articles = db.prepare('SELECT * FROM articles ORDER BY created_at DESC').all();
    return NextResponse.json(articles);
  } catch (error) {
    console.error('Error fetching articles:', error);
    return NextResponse.json({ error: 'Failed to fetch articles' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const {
      title, slug, summary, content, category, image_url,
      seo_title, seo_description, seo_keywords,
      aeo_question, aeo_answer, is_published
    } = body;

    const publishedAt = is_published ? new Date().toISOString() : null;

    const stmt = db.prepare(`
      INSERT INTO articles (
        title, slug, summary, content, category, image_url,
        seo_title, seo_description, seo_keywords,
        aeo_question, aeo_answer, aeo_schema_type,
        is_published, published_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Article', ?, ?)
    `);

    const result = stmt.run(
      title, slug, summary || '', content || '', category || null, image_url || null,
      seo_title || null, seo_description || null, seo_keywords || null,
      aeo_question || null, aeo_answer || null,
      is_published ? 1 : 0, publishedAt
    );

    return NextResponse.json({ success: true, articleId: result.lastInsertRowid });
  } catch (error: any) {
    console.error('Error creating article:', error);
    if (error.message?.includes('UNIQUE constraint')) {
      return NextResponse.json({ error: 'Article with this slug already exists' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to create article' }, { status: 500 });
  }
}
