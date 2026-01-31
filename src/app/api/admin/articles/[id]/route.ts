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

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;

  try {
    const article = db.prepare('SELECT * FROM articles WHERE id = ?').get(id);
    if (!article) {
      return NextResponse.json({ error: 'Article not found' }, { status: 404 });
    }
    return NextResponse.json(article);
  } catch (error) {
    console.error('Error fetching article:', error);
    return NextResponse.json({ error: 'Failed to fetch article' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;

  try {
    const body = await request.json();
    const {
      title, slug, summary, content, category, image_url,
      seo_title, seo_description, seo_keywords,
      aeo_question, aeo_answer, is_published
    } = body;

    // Check existing published status
    const existing = db.prepare('SELECT is_published, published_at FROM articles WHERE id = ?').get(id) as any;
    let publishedAt = existing?.published_at;
    if (is_published && !existing?.is_published) {
      publishedAt = new Date().toISOString();
    }

    const stmt = db.prepare(`
      UPDATE articles 
      SET title = ?, slug = ?, summary = ?, content = ?, category = ?, image_url = ?,
          seo_title = ?, seo_description = ?, seo_keywords = ?,
          aeo_question = ?, aeo_answer = ?,
          is_published = ?, published_at = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);

    const result = stmt.run(
      title, slug, summary || '', content || '', category || null, image_url || null,
      seo_title || null, seo_description || null, seo_keywords || null,
      aeo_question || null, aeo_answer || null,
      is_published ? 1 : 0, publishedAt, id
    );

    if (result.changes === 0) {
      return NextResponse.json({ error: 'Article not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error updating article:', error);
    if (error.message?.includes('UNIQUE constraint')) {
      return NextResponse.json({ error: 'Article with this slug already exists' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to update article' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;

  try {
    const result = db.prepare('DELETE FROM articles WHERE id = ?').run(id);

    if (result.changes === 0) {
      return NextResponse.json({ error: 'Article not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting article:', error);
    return NextResponse.json({ error: 'Failed to delete article' }, { status: 500 });
  }
}
