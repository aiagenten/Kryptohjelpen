import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import supabase from '@/lib/supabase';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    const { data: chapter, error } = await supabase
      .from('course_chapters')
      .select('*')
      .eq('slug', slug)
      .single();

    if (error || !chapter) {
      return NextResponse.json({ error: 'Kapittel ikke funnet' }, { status: 404 });
    }

    // Free chapters are available to everyone
    if (chapter.is_free) {
      return NextResponse.json({ chapter });
    }

    // Non-free chapters require authentication
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('customer_session');

    if (!sessionCookie) {
      // Return teaser (first 2 paragraphs) for non-authenticated users
      const teaser = extractTeaser(chapter.content || '');
      return NextResponse.json({
        chapter: {
          ...chapter,
          content: teaser,
        },
        locked: true,
      });
    }

    try {
      const session = JSON.parse(sessionCookie.value);
      if (!session.customerId) {
        const teaser = extractTeaser(chapter.content || '');
        return NextResponse.json({
          chapter: { ...chapter, content: teaser },
          locked: true,
        });
      }

      // Verify customer exists
      const { data: customer } = await supabase
        .from('customers')
        .select('id')
        .eq('id', session.customerId)
        .single();

      if (!customer) {
        const teaser = extractTeaser(chapter.content || '');
        return NextResponse.json({
          chapter: { ...chapter, content: teaser },
          locked: true,
        });
      }

      // Authenticated - return full content
      return NextResponse.json({ chapter, locked: false });
    } catch {
      const teaser = extractTeaser(chapter.content || '');
      return NextResponse.json({
        chapter: { ...chapter, content: teaser },
        locked: true,
      });
    }
  } catch (error) {
    console.error('Chapter API error:', error);
    return NextResponse.json({ error: 'Serverfeil' }, { status: 500 });
  }
}

function extractTeaser(content: string): string {
  const paragraphs = content.split('\n\n');
  // Get first ~3 content blocks (skip title headers, get actual paragraphs)
  const teaserBlocks: string[] = [];
  let contentParagraphs = 0;

  for (const block of paragraphs) {
    teaserBlocks.push(block);
    // Count non-header blocks as content paragraphs
    if (!block.startsWith('#')) {
      contentParagraphs++;
    }
    if (contentParagraphs >= 2) break;
  }

  return teaserBlocks.join('\n\n');
}
