'use client';

import { useEffect, useState } from 'react';

interface Review {
  id: number;
  name: string;
  rating: number;
  review_date: string;
  text: string;
  visible: boolean;
}

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Review | null>(null);
  const [newReview, setNewReview] = useState({ name: '', rating: 5, text: '', review_date: new Date().toISOString().split('T')[0] });

  useEffect(() => {
    loadReviews();
  }, []);

  const loadReviews = async () => {
    try {
      const res = await fetch('/api/admin/reviews');
      const data = await res.json();
      setReviews(data);
    } catch (error) {
      console.error('Failed to load reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (review: Partial<Review>) => {
    try {
      const res = await fetch('/api/admin/reviews', {
        method: review.id ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(review),
      });
      if (res.ok) {
        loadReviews();
        setEditing(null);
        setNewReview({ name: '', rating: 5, text: '', review_date: new Date().toISOString().split('T')[0] });
      }
    } catch (error) {
      console.error('Failed to save review:', error);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Er du sikker på at du vil slette denne anmeldelsen?')) return;
    try {
      await fetch(`/api/admin/reviews/${id}`, { method: 'DELETE' });
      loadReviews();
    } catch (error) {
      console.error('Failed to delete review:', error);
    }
  };

  const toggleVisibility = async (review: Review) => {
    await handleSave({ ...review, visible: !review.visible });
  };

  if (loading) {
    return <div className="p-8">Laster...</div>;
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Trustpilot Anmeldelser</h1>

      {/* Add new review */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h2 className="text-lg font-semibold mb-4">Legg til ny anmeldelse</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <input
            type="text"
            placeholder="Navn (f.eks. Thomas K.)"
            value={newReview.name}
            onChange={(e) => setNewReview({ ...newReview, name: e.target.value })}
            className="px-4 py-2 border rounded-lg"
          />
          <input
            type="date"
            value={newReview.review_date}
            onChange={(e) => setNewReview({ ...newReview, review_date: e.target.value })}
            className="px-4 py-2 border rounded-lg"
          />
          <select
            value={newReview.rating}
            onChange={(e) => setNewReview({ ...newReview, rating: parseInt(e.target.value) })}
            className="px-4 py-2 border rounded-lg"
          >
            {[5, 4, 3, 2, 1].map((r) => (
              <option key={r} value={r}>{r} stjerner</option>
            ))}
          </select>
          <div></div>
          <textarea
            placeholder="Anmeldelsestekst..."
            value={newReview.text}
            onChange={(e) => setNewReview({ ...newReview, text: e.target.value })}
            className="px-4 py-2 border rounded-lg md:col-span-2"
            rows={3}
          />
        </div>
        <button
          onClick={() => handleSave(newReview)}
          disabled={!newReview.name || !newReview.text}
          className="mt-4 px-6 py-2 bg-[#8DC99C] text-white rounded-lg hover:bg-[#7ab889] disabled:opacity-50"
        >
          Legg til
        </button>
      </div>

      {/* Existing reviews */}
      <div className="space-y-4">
        {reviews.map((review) => (
          <div key={review.id} className={`bg-white rounded-lg shadow p-6 ${!review.visible ? 'opacity-50' : ''}`}>
            {editing?.id === review.id ? (
              <div className="space-y-4">
                <input
                  type="text"
                  value={editing.name}
                  onChange={(e) => setEditing({ ...editing, name: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg"
                />
                <div className="flex gap-4">
                  <input
                    type="date"
                    value={editing.review_date?.split('T')[0]}
                    onChange={(e) => setEditing({ ...editing, review_date: e.target.value })}
                    className="px-4 py-2 border rounded-lg"
                  />
                  <select
                    value={editing.rating}
                    onChange={(e) => setEditing({ ...editing, rating: parseInt(e.target.value) })}
                    className="px-4 py-2 border rounded-lg"
                  >
                    {[5, 4, 3, 2, 1].map((r) => (
                      <option key={r} value={r}>{r} stjerner</option>
                    ))}
                  </select>
                </div>
                <textarea
                  value={editing.text}
                  onChange={(e) => setEditing({ ...editing, text: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg"
                  rows={3}
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => handleSave(editing)}
                    className="px-4 py-2 bg-[#8DC99C] text-white rounded-lg"
                  >
                    Lagre
                  </button>
                  <button
                    onClick={() => setEditing(null)}
                    className="px-4 py-2 border rounded-lg"
                  >
                    Avbryt
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <span className="font-semibold">{review.name}</span>
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <svg
                          key={star}
                          className={`w-4 h-4 ${star <= review.rating ? 'text-[#00b67a]' : 'text-gray-300'}`}
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                    <span className="text-sm text-gray-500">
                      {new Date(review.review_date).toLocaleDateString('nb-NO')}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => toggleVisibility(review)}
                      className={`px-3 py-1 text-sm rounded ${review.visible ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}
                    >
                      {review.visible ? 'Synlig' : 'Skjult'}
                    </button>
                    <button
                      onClick={() => setEditing(review)}
                      className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded"
                    >
                      Rediger
                    </button>
                    <button
                      onClick={() => handleDelete(review.id)}
                      className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded"
                    >
                      Slett
                    </button>
                  </div>
                </div>
                <p className="text-gray-600">&ldquo;{review.text}&rdquo;</p>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
