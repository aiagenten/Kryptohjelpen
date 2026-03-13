import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import supabase from '@/lib/supabase';

async function getCustomerId(): Promise<number | null> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('customer_session');
  if (!sessionCookie) return null;

  try {
    const session = JSON.parse(sessionCookie.value);
    return session.customerId || null;
  } catch {
    return null;
  }
}

export async function GET() {
  try {
    const customerId = await getCustomerId();
    if (!customerId) {
      return NextResponse.json({ progress: [] });
    }

    const { data: progress, error } = await supabase
      .from('course_progress')
      .select('id, chapter_id, completed_at')
      .eq('customer_id', customerId)
      .order('completed_at', { ascending: true });

    if (error) {
      console.error('Error fetching progress:', error);
      return NextResponse.json({ progress: [] });
    }

    return NextResponse.json({ progress: progress || [] });
  } catch (error) {
    console.error('Progress GET error:', error);
    return NextResponse.json({ progress: [] });
  }
}

export async function POST(request: NextRequest) {
  try {
    const customerId = await getCustomerId();
    if (!customerId) {
      return NextResponse.json({ error: 'Ikke innlogget' }, { status: 401 });
    }

    const body = await request.json();
    const { chapterId } = body;

    if (!chapterId) {
      return NextResponse.json({ error: 'Mangler chapterId' }, { status: 400 });
    }

    // Verify chapter exists
    const { data: chapter } = await supabase
      .from('course_chapters')
      .select('id')
      .eq('id', chapterId)
      .single();

    if (!chapter) {
      return NextResponse.json({ error: 'Kapittel ikke funnet' }, { status: 404 });
    }

    // Check if quiz was passed for this chapter
    const { data: quizResult } = await supabase
      .from('course_quiz_results')
      .select('passed')
      .eq('customer_id', customerId)
      .eq('chapter_id', chapterId)
      .eq('passed', true)
      .limit(1)
      .single();

    if (!quizResult) {
      return NextResponse.json({ error: 'Du må bestå quizen først' }, { status: 403 });
    }

    // Upsert progress (ignore if already completed)
    const { data: progress, error } = await supabase
      .from('course_progress')
      .upsert(
        { customer_id: customerId, chapter_id: chapterId },
        { onConflict: 'customer_id,chapter_id' }
      )
      .select()
      .single();

    if (error) {
      console.error('Error saving progress:', error);
      return NextResponse.json({ error: 'Kunne ikke lagre fremgang' }, { status: 500 });
    }

    return NextResponse.json({ success: true, progress });
  } catch (error) {
    console.error('Progress POST error:', error);
    return NextResponse.json({ error: 'Serverfeil' }, { status: 500 });
  }
}
