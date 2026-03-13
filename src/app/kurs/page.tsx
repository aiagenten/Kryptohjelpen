'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { BookOpen, Lock, CheckCircle, ChevronRight, GraduationCap } from 'lucide-react';

interface Chapter {
  id: number;
  slug: string;
  title: string;
  description: string;
  chapter_number: number;
  is_free: boolean;
}

interface Progress {
  id: number;
  chapter_id: number;
  completed_at: string;
}

export default function KursPage() {
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [progress, setProgress] = useState<Progress[]>([]);
  const [user, setUser] = useState<{ name: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/api/course/chapters').then(r => r.json()),
      fetch('/api/course/progress', { credentials: 'include' }).then(r => r.json()),
      fetch('/api/auth/me', { credentials: 'include' }).then(r => r.json()),
    ]).then(([chaptersData, progressData, authData]) => {
      setChapters(chaptersData.chapters || []);
      setProgress(progressData.progress || []);
      if (authData.authenticated) {
        setUser(authData.customer);
      }
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const completedIds = new Set(progress.map(p => p.chapter_id));
  const completedCount = completedIds.size;
  const totalCount = chapters.length;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <div className="page-hero">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center gap-3 mb-4">
            <GraduationCap className="w-10 h-10 text-white/90" />
          </div>
          <h1>Gratis Kryptokurs</h1>
          <p>Lær alt om kryptovaluta fra bunnen av. Steg-for-steg guide tilpasset norske nybegynnere.</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-8 py-12">
        {/* Progress bar */}
        {user && completedCount > 0 && (
          <div className="mb-10 bg-white rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-semibold text-gray-700">Din fremgang</span>
              <span className="text-sm font-bold text-[#5a9a6a]">
                {completedCount} av {totalCount} kapitler fullført
              </span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#8DC99C] to-[#5a9a6a] rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            {progressPercent === 100 && (
              <div className="mt-3 text-center">
                <Link
                  href="/kurs/fullfort"
                  className="text-[#5a9a6a] font-semibold hover:underline"
                >
                  Du har fullført kurset! Se din gratulasjon &rarr;
                </Link>
              </div>
            )}
          </div>
        )}

        {/* Chapters list */}
        <div className="space-y-4">
          {chapters.map((chapter) => {
            const isCompleted = completedIds.has(chapter.id);
            const isLocked = !chapter.is_free && !user;

            return (
              <Link
                key={chapter.id}
                href={`/kurs/${chapter.slug}`}
                className="block bg-white rounded-2xl p-6 shadow-sm hover:-translate-y-1 hover:shadow-md transition-all duration-300 group"
              >
                <div className="flex items-start gap-4">
                  {/* Chapter number / status icon */}
                  <div className={`flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg ${
                    isCompleted
                      ? 'bg-[#8DC99C] text-white'
                      : isLocked
                        ? 'bg-gray-100 text-gray-400'
                        : 'bg-gradient-to-br from-[#8DC99C]/20 to-[#5a9a6a]/20 text-[#5a9a6a]'
                  }`}>
                    {isCompleted ? (
                      <CheckCircle className="w-6 h-6" />
                    ) : isLocked ? (
                      <Lock className="w-5 h-5" />
                    ) : (
                      chapter.chapter_number
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-lg font-bold text-gray-900 group-hover:text-[#5a9a6a] transition-colors">
                        {chapter.title}
                      </h3>
                      {chapter.is_free && (
                        <span className="px-2 py-0.5 bg-[#8DC99C]/20 text-[#5a9a6a] text-xs font-semibold rounded-md">
                          GRATIS
                        </span>
                      )}
                    </div>
                    <p className="text-gray-600 text-sm line-clamp-2">
                      {chapter.description}
                    </p>
                    {isLocked && (
                      <p className="text-xs text-gray-400 mt-2 flex items-center gap-1">
                        <Lock className="w-3 h-3" />
                        Logg inn med Vipps for å lese dette kapittelet
                      </p>
                    )}
                  </div>

                  {/* Arrow */}
                  <div className="flex-shrink-0 self-center">
                    <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-[#8DC99C] transition-colors" />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {/* CTA section */}
        <div className="mt-12 bg-gradient-to-br from-[#8DC99C]/10 to-[#5a9a6a]/10 rounded-2xl p-8 text-center">
          <BookOpen className="w-10 h-10 text-[#5a9a6a] mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Vil du lære mer?</h2>
          <p className="text-gray-600 mb-6 max-w-lg mx-auto">
            Etter kurset kan du booke en personlig veiledning med oss. Vi hjelper deg videre
            med alt fra skattemeldingen til investeringsstrategi.
          </p>
          <Link
            href="/konsultasjon"
            className="btn-primary inline-block"
          >
            Book en veiledning
          </Link>
        </div>
      </div>
    </div>
  );
}
