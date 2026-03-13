'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { marked } from 'marked';
import { ArrowLeft, ArrowRight, CheckCircle, Lock, GraduationCap } from 'lucide-react';

interface Chapter {
  id: number;
  slug: string;
  title: string;
  description: string;
  content: string;
  chapter_number: number;
  is_free: boolean;
}

interface ChapterListItem {
  id: number;
  slug: string;
  title: string;
  chapter_number: number;
  is_free: boolean;
}

const chapterImages: Record<number, string> = {
  1: '/images/kurs/kap1-kryptovaluta.png',
  2: '/images/kurs/kap2-blockchain.png',
  3: '/images/kurs/kap3-lommebok.png',
  4: '/images/kurs/kap4-kjope-selge.png',
  5: '/images/kurs/kap5-defi.png',
  6: '/images/kurs/kap6-sikkerhet.png',
};

export default function ChapterPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;

  const [chapter, setChapter] = useState<Chapter | null>(null);
  const [locked, setLocked] = useState(false);
  const [allChapters, setAllChapters] = useState<ChapterListItem[]>([]);
  const [completedIds, setCompletedIds] = useState<Set<number>>(new Set());
  const [user, setUser] = useState<{ name: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [marking, setMarking] = useState(false);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetch(`/api/course/chapters/${slug}`, { credentials: 'include' }).then(r => r.json()),
      fetch('/api/course/chapters').then(r => r.json()),
      fetch('/api/course/progress', { credentials: 'include' }).then(r => r.json()),
      fetch('/api/auth/me', { credentials: 'include' }).then(r => r.json()),
    ]).then(([chapterData, chaptersData, progressData, authData]) => {
      if (chapterData.error) {
        router.push('/kurs');
        return;
      }
      setChapter(chapterData.chapter);
      setLocked(chapterData.locked || false);
      setAllChapters(chaptersData.chapters || []);
      setCompletedIds(new Set((progressData.progress || []).map((p: { chapter_id: number }) => p.chapter_id)));
      if (authData.authenticated) {
        setUser(authData.customer);
      }
      setLoading(false);
    }).catch(() => {
      router.push('/kurs');
    });
  }, [slug, router]);

  const markComplete = async () => {
    if (!chapter || marking) return;
    setMarking(true);
    try {
      const res = await fetch('/api/course/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ chapterId: chapter.id }),
      });
      if (res.ok) {
        setCompletedIds(prev => new Set([...prev, chapter.id]));

        // If this was the last chapter, go to completion page
        const allCompleted = allChapters.every(
          c => c.id === chapter.id || completedIds.has(c.id)
        );
        if (allCompleted) {
          router.push('/kurs/fullfort');
          return;
        }

        // Otherwise navigate to next chapter
        const nextChapter = allChapters.find(
          c => c.chapter_number === chapter.chapter_number + 1
        );
        if (nextChapter) {
          router.push(`/kurs/${nextChapter.slug}`);
        }
      }
    } catch (err) {
      console.error('Error marking progress:', err);
    } finally {
      setMarking(false);
    }
  };

  if (loading || !chapter) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  const currentIndex = allChapters.findIndex(c => c.slug === slug);
  const prevChapter = currentIndex > 0 ? allChapters[currentIndex - 1] : null;
  const nextChapter = currentIndex < allChapters.length - 1 ? allChapters[currentIndex + 1] : null;
  const isCompleted = completedIds.has(chapter.id);
  const htmlContent = marked(chapter.content || '');

  return (
    <div className="min-h-screen">
      {/* Header bar */}
      <div className="bg-white border-b border-gray-100 sticky top-16 z-40">
        <div className="max-w-4xl mx-auto px-4 sm:px-8 py-3 flex items-center justify-between">
          <Link href="/kurs" className="text-sm text-gray-500 hover:text-[#5a9a6a] flex items-center gap-1 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Tilbake til kursoversikt
          </Link>
          <span className="text-sm text-gray-400">
            Kapittel {chapter.chapter_number} av {allChapters.length}
          </span>
        </div>
      </div>

      {/* Chapter hero image */}
      {chapterImages[chapter.chapter_number] && (
        <div className="w-full h-48 sm:h-64 relative overflow-hidden">
          <img
            src={chapterImages[chapter.chapter_number]}
            alt={chapter.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent" />
        </div>
      )}

      <div className="max-w-3xl mx-auto px-4 sm:px-8 py-10">
        {/* Chapter header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-sm font-semibold text-[#5a9a6a]">
              Kapittel {chapter.chapter_number}
            </span>
            {isCompleted && (
              <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-semibold rounded-md flex items-center gap-1">
                <CheckCircle className="w-3 h-3" />
                Fullført
              </span>
            )}
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900">
            {chapter.title}
          </h1>
        </div>

        {/* Content */}
        <div
          className="prose max-w-none"
          dangerouslySetInnerHTML={{ __html: htmlContent }}
        />

        {/* Locked gate */}
        {locked && (
          <div className="mt-8 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-8 text-center border-2 border-dashed border-gray-200">
            <Lock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Logg inn for å lese videre
            </h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              Dette kapittelet krever innlogging. Logg inn med Vipps - det er gratis og tar bare noen sekunder.
            </p>
            <a
              href={`/api/auth/vipps?returnUrl=/kurs/${slug}`}
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#ff5b24] hover:bg-[#e54d1c] text-white rounded-lg font-semibold transition-colors text-lg"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
              </svg>
              Logg inn med Vipps
            </a>
          </div>
        )}

        {/* Mark as complete + navigation */}
        {!locked && (
          <div className="mt-12 pt-8 border-t border-gray-200">
            {/* Mark complete button */}
            {user && !isCompleted && (
              <div className="mb-8 text-center">
                <button
                  onClick={markComplete}
                  disabled={marking}
                  className="btn-primary inline-flex items-center gap-2 text-lg"
                >
                  <CheckCircle className="w-5 h-5" />
                  {marking ? 'Lagrer...' : 'Marker som fullført'}
                </button>
              </div>
            )}

            {user && isCompleted && (
              <div className="mb-8 text-center">
                <div className="inline-flex items-center gap-2 text-[#5a9a6a] font-semibold">
                  <CheckCircle className="w-5 h-5" />
                  Du har fullført dette kapittelet
                </div>
              </div>
            )}

            {/* Prev / Next navigation */}
            <div className="flex items-center justify-between gap-4">
              {prevChapter ? (
                <Link
                  href={`/kurs/${prevChapter.slug}`}
                  className="flex items-center gap-2 text-gray-600 hover:text-[#5a9a6a] transition-colors group"
                >
                  <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                  <div className="text-left">
                    <div className="text-xs text-gray-400">Forrige</div>
                    <div className="text-sm font-medium">{prevChapter.title}</div>
                  </div>
                </Link>
              ) : <div />}

              {nextChapter ? (
                <Link
                  href={`/kurs/${nextChapter.slug}`}
                  className="flex items-center gap-2 text-gray-600 hover:text-[#5a9a6a] transition-colors group text-right"
                >
                  <div>
                    <div className="text-xs text-gray-400">Neste</div>
                    <div className="text-sm font-medium">{nextChapter.title}</div>
                  </div>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              ) : (
                <Link
                  href="/kurs/fullfort"
                  className="flex items-center gap-2 text-[#5a9a6a] font-semibold hover:underline group"
                >
                  <div className="text-right">
                    <div className="text-xs text-gray-400">Gratulerer!</div>
                    <div className="text-sm font-medium">Se din fullføring</div>
                  </div>
                  <GraduationCap className="w-5 h-5" />
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
