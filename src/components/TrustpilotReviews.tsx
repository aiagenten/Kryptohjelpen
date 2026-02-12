'use client';

import { useEffect, useState } from 'react';

interface Review {
  id: number;
  name: string;
  rating: number;
  review_date: string;
  text: string;
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <svg
          key={star}
          className={`w-5 h-5 ${star <= rating ? 'text-[#00b67a]' : 'text-gray-300'}`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

export default function TrustpilotReviews() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/reviews')
      .then(res => res.json())
      .then(data => {
        setReviews(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="grid md:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 animate-pulse">
            <div className="h-5 bg-gray-200 rounded w-24 mb-3"></div>
            <div className="h-16 bg-gray-200 rounded mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-20"></div>
          </div>
        ))}
      </div>
    );
  }

  if (reviews.length === 0) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Trustpilot header */}
      <div className="flex items-center justify-center gap-4 mb-8">
        <a href="https://www.trustpilot.com/review/kryptohjelpen.no" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3">
          {/* Trustpilot star icon */}
          <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none">
            <path d="M12 2L9.19 8.63L2 9.24L7.46 13.97L5.82 21L12 17.27L18.18 21L16.54 13.97L22 9.24L14.81 8.63L12 2Z" fill="#00b67a"/>
          </svg>
          <span className="text-2xl font-bold text-gray-800">Trustpilot</span>
        </a>
        <div className="flex items-center gap-2">
          <span className="text-lg font-semibold text-gray-700">Utmerket</span>
          <div className="flex">
            {[1, 2, 3, 4, 5].map((star) => (
              <svg key={star} className="w-6 h-6 text-[#00b67a]" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            ))}
          </div>
        </div>
      </div>

      {/* Reviews grid */}
      <div className="grid md:grid-cols-3 gap-6">
        {reviews.slice(0, 3).map((review) => (
          <div key={review.id} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <StarRating rating={review.rating} />
            <p className="mt-3 text-gray-600 text-sm leading-relaxed">&ldquo;{review.text}&rdquo;</p>
            <div className="mt-4 flex items-center justify-between">
              <span className="font-medium text-gray-800">{review.name}</span>
              <span className="text-xs text-gray-400">{new Date(review.review_date).toLocaleDateString('nb-NO')}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Link to Trustpilot */}
      <div className="text-center pt-4">
        <a
          href="https://www.trustpilot.com/review/kryptohjelpen.no"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-[#00b67a] hover:text-[#009567] font-medium transition-colors"
        >
          Se alle anmeldelser på Trustpilot
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
        </a>
      </div>
    </div>
  );
}
