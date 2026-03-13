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

const chapterImages: Record<number, string> = {
  1: '/images/kurs/kap1-kryptovaluta.png',
  2: '/images/kurs/kap2-blockchain.png',
  3: '/images/kurs/kap3-lommebok.png',
  4: '/images/kurs/kap4-kjope-selge.png',
  5: '/images/kurs/kap5-defi.png',
  6: '/images/kurs/kap6-sikkerhet.png',
};

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
      {/* Hero with background image */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="/images/kurs/kurs-hero.png"
            alt=""
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/50 to-black/70" />
        </div>
        <div className="relative max-w-4xl mx-auto px-4 sm:px-8 py-20 sm:py-28 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <GraduationCap className="w-10 h-10 text-white/90" />
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-white mb-4">Kryptokurs</h1>
          <p className="text-lg text-white/80 max-w-2xl mx-auto">Lær alt om kryptovaluta fra bunnen av. Steg-for-steg guide tilpasset norske nybegynnere. Logg inn med Vipps for å starte.</p>
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

        {/* Vipps login CTA for non-logged-in users */}
        {!user && (
          <div className="mb-10 bg-gradient-to-br from-[#ff5b24]/5 to-[#ff5b24]/10 rounded-2xl p-6 text-center border border-[#ff5b24]/20">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Logg inn for å starte kurset</h3>
            <p className="text-gray-600 text-sm mb-4">Kurset er helt gratis. Logg inn med Vipps for å få tilgang til alle kapitlene og spore fremgangen din.</p>
            <a
              href="/api/auth/vipps?returnUrl=/kurs"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#ff5b24] hover:bg-[#e54d1c] text-white rounded-lg font-semibold transition-colors"
            >
              Logg inn med Vipps
            </a>
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
                className="block bg-white rounded-2xl overflow-hidden shadow-sm hover:-translate-y-1 hover:shadow-md transition-all duration-300 group"
              >
                <div className="flex flex-col sm:flex-row">
                  {/* Chapter image */}
                  {chapterImages[chapter.chapter_number] && (
                    <div className="sm:w-48 sm:flex-shrink-0 h-40 sm:h-auto relative overflow-hidden">
                      <img
                        src={chapterImages[chapter.chapter_number]}
                        alt={chapter.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      {isLocked && (
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                          <Lock className="w-8 h-8 text-white/80" />
                        </div>
                      )}
                      {isCompleted && (
                        <div className="absolute top-2 right-2 bg-[#8DC99C] rounded-full p-1">
                          <CheckCircle className="w-5 h-5 text-white" />
                        </div>
                      )}
                    </div>
                  )}

                  {/* Content */}
                  <div className="flex-1 p-6 flex items-start gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-semibold text-[#5a9a6a]">Kapittel {chapter.chapter_number}</span>
                        {isCompleted && (
                          <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-semibold rounded-md">
                            Fullført
                          </span>
                        )}
                      </div>
                      <h3 className="text-lg font-bold text-gray-900 group-hover:text-[#5a9a6a] transition-colors mb-1">
                        {chapter.title}
                      </h3>
                      <p className="text-gray-600 text-sm line-clamp-2">
                        {chapter.description}
                      </p>
                      {isLocked && (
                        <p className="text-xs text-gray-400 mt-2 flex items-center gap-1">
                          <Lock className="w-3 h-3" />
                          Logg inn med Vipps for å lese
                        </p>
                      )}
                    </div>

                    {/* Arrow */}
                    <div className="flex-shrink-0 self-center">
                      <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-[#8DC99C] transition-colors" />
                    </div>
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
