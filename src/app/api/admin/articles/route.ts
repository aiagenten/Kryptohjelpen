import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import supabase from '@/lib/supabase';

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
    const { data: articles, error } = await supabase
      .from('articles')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching articles:', error);
      return NextResponse.json({ error: 'Failed to fetch articles' }, { status: 500 });
    }

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

    const { data, error } = await supabase
      .from('articles')
      .insert({
        title,
        slug,
        summary: summary || '',
        content: content || '',
        category: category || null,
        image_url: image_url || null,
        seo_title: seo_title || null,
        seo_description: seo_description || null,
        seo_keywords: seo_keywords || null,
        aeo_question: aeo_question || null,
        aeo_answer: aeo_answer || null,
        aeo_schema_type: 'Article',
        is_published: is_published || false,
        published_at: publishedAt
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating article:', error);
      if (error.code === '23505') {
        return NextResponse.json({ error: 'Article with this slug already exists' }, { status: 400 });
      }
      return NextResponse.json({ error: 'Failed to create article' }, { status: 500 });
    }

    return NextResponse.json({ success: true, articleId: data.id });
  } catch (error) {
    console.error('Error creating article:', error);
    return NextResponse.json({ error: 'Failed to create article' }, { status: 500 });
  }
}
