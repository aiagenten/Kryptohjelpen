import { NextRequest, NextResponse } from 'next/server';
import supabase from '@/lib/supabase';

// GET quiz questions for a chapter
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ chapterSlug: string }> }
) {
  try {
    const { chapterSlug } = await params;

    // Get chapter
    const { data: chapter, error: chapterError } = await supabase
      .from('course_chapters')
      .select('id, chapter_number, title')
      .eq('slug', chapterSlug)
      .single();

    if (chapterError || !chapter) {
      return NextResponse.json({ error: 'Kapittel ikke funnet' }, { status: 404 });
    }

    // Get quiz questions
    const { data: questions, error: quizError } = await supabase
      .from('course_quizzes')
      .select('id, question_number, question, image_path, options, correct_option')
      .eq('chapter_id', chapter.id)
      .order('question_number');

    if (quizError) {
      return NextResponse.json({ error: 'Kunne ikke hente quiz' }, { status: 500 });
    }

    // Don't send correct answers to client - they'll be checked server-side
    const safeQuestions = (questions || []).map(q => ({
      id: q.id,
      question_number: q.question_number,
      question: q.question,
      image_path: q.image_path,
      options: q.options,
    }));

    return NextResponse.json({
      chapter: { id: chapter.id, title: chapter.title, chapter_number: chapter.chapter_number },
      questions: safeQuestions,
    });
  } catch (error) {
    console.error('Quiz fetch error:', error);
    return NextResponse.json({ error: 'Intern feil' }, { status: 500 });
  }
}

// POST submit quiz answers
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ chapterSlug: string }> }
) {
  try {
    const { chapterSlug } = await params;

    // Check auth
    const sessionCookie = request.cookies.get('customer_session')?.value;
    if (!sessionCookie) {
      return NextResponse.json({ error: 'Ikke innlogget' }, { status: 401 });
    }

    const session = JSON.parse(sessionCookie);
    const customerId = session.customerId;

    // Get chapter
    const { data: chapter } = await supabase
      .from('course_chapters')
      .select('id')
      .eq('slug', chapterSlug)
      .single();

    if (!chapter) {
      return NextResponse.json({ error: 'Kapittel ikke funnet' }, { status: 404 });
    }

    // Get correct answers
    const { data: questions } = await supabase
      .from('course_quizzes')
      .select('id, question_number, correct_option')
      .eq('chapter_id', chapter.id)
      .order('question_number');

    if (!questions || questions.length === 0) {
      return NextResponse.json({ error: 'Ingen quizspørsmål funnet' }, { status: 404 });
    }

    const body = await request.json();
    const answers: Record<number, number> = body.answers; // { questionNumber: selectedOption }

    // Check each answer
    let correct = 0;
    const results = questions.map(q => {
      const userAnswer = answers[q.question_number];
      const isCorrect = userAnswer === q.correct_option;
      if (isCorrect) correct++;
      return {
        question_number: q.question_number,
        correct: isCorrect,
        correct_option: q.correct_option,
        user_answer: userAnswer,
      };
    });

    const total = questions.length;
    const passed = correct === total; // Must be 100%

    // Save result
    await supabase.from('course_quiz_results').insert({
      customer_id: customerId,
      chapter_id: chapter.id,
      score: correct,
      total,
      passed,
    });

    return NextResponse.json({
      score: correct,
      total,
      passed,
      results,
    });
  } catch (error) {
    console.error('Quiz submit error:', error);
    return NextResponse.json({ error: 'Intern feil' }, { status: 500 });
  }
}
