import { NextResponse } from 'next/server';
import supabase from '@/lib/supabase';

export async function GET() {
  try {
    const { data: chapters, error } = await supabase
      .from('course_chapters')
      .select('id, slug, title, description, chapter_number, is_free, created_at')
      .order('chapter_number', { ascending: true });

    if (error) {
      console.error('Error fetching chapters:', error);
      return NextResponse.json({ error: 'Kunne ikke hente kapitler' }, { status: 500 });
    }

    return NextResponse.json({ chapters: chapters || [] });
  } catch (error) {
    console.error('Chapters API error:', error);
    return NextResponse.json({ error: 'Serverfeil' }, { status: 500 });
  }
}
