'use client';

import { useEffect, useState } from 'react';

interface Article {
  id: number;
  title: string;
  slug: string;
  summary: string;
  content: string;
  category: string;
  image_url: string;
  seo_title: string;
  seo_description: string;
  seo_keywords: string;
  aeo_question: string;
  aeo_answer: string;
  is_published: boolean;
  created_at: string;
}

export default function AdminArticles() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editArticle, setEditArticle] = useState<Article | null>(null);
  const [search, setSearch] = useState('');

  const [form, setForm] = useState({
    title: '', slug: '', summary: '', content: '', category: '',
    image_url: '', seo_title: '', seo_description: '', seo_keywords: '',
    aeo_question: '', aeo_answer: '', is_published: false
  });

  const loadArticles = () => {
    fetch('/api/admin/articles')
      .then(r => r.json())
      .then(data => {
        setArticles(data);
        setLoading(false);
      });
  };

  useEffect(() => { loadArticles(); }, []);

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString('nb-NO', { day: 'numeric', month: 'short', year: 'numeric' });

  const generateSlug = (text: string) =>
    text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

  const openModal = (article?: Article) => {
    if (article) {
      setEditArticle(article);
      setForm({
        title: article.title,
        slug: article.slug,
        summary: article.summary || '',
        content: article.content || '',
        category: article.category || '',
        image_url: article.image_url || '',
        seo_title: article.seo_title || '',
        seo_description: article.seo_description || '',
        seo_keywords: article.seo_keywords || '',
        aeo_question: article.aeo_question || '',
        aeo_answer: article.aeo_answer || '',
        is_published: article.is_published
      });
    } else {
      setEditArticle(null);
      setForm({
        title: '', slug: '', summary: '', content: '', category: '',
        image_url: '', seo_title: '', seo_description: '', seo_keywords: '',
        aeo_question: '', aeo_answer: '', is_published: false
      });
    }
    setShowModal(true);
  };

  const handleSave = async () => {
    const url = editArticle ? `/api/admin/articles/${editArticle.id}` : '/api/admin/articles';
    const method = editArticle ? 'PUT' : 'POST';

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form)
    });

    if (res.ok) {
      setShowModal(false);
      loadArticles();
    }
  };

  const handleDelete = async (id: number, title: string) => {
    if (!confirm(`Slette "${title}"?`)) return;
    await fetch(`/api/admin/articles/${id}`, { method: 'DELETE' });
    loadArticles();
  };

  const filtered = articles.filter(a =>
    a.title.toLowerCase().includes(search.toLowerCase()) ||
    a.slug.toLowerCase().includes(search.toLowerCase())
  );

  const categories = ['Grunnleggende', 'Sikkerhet', 'DeFi', 'NFT', 'Hardware', 'Web3'];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#8DC99C] border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div>
      {/* Toolbar */}
      <div className="flex justify-between items-center mb-6">
        <input
          type="text"
          placeholder="🔍 Søk artikler..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="px-4 py-2 border rounded-lg w-72 focus:outline-none focus:border-[#8DC99C]"
        />
        <button
          onClick={() => openModal()}
          className="bg-[#8DC99C] text-white px-6 py-2 rounded-lg font-medium hover:bg-[#7ab889]"
        >
          ➕ Ny artikkel
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr className="text-left text-xs text-gray-500 uppercase">
              <th className="p-4">Tittel</th>
              <th className="p-4">Kategori</th>
              <th className="p-4">Status</th>
              <th className="p-4">Opprettet</th>
              <th className="p-4 w-32">Handlinger</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {filtered.length ? filtered.map(a => (
              <tr key={a.id} className="hover:bg-gray-50">
                <td className="p-4">
                  <div className="font-medium">{a.title}</div>
                  <div className="text-sm text-gray-500">/{a.slug}</div>
                </td>
                <td className="p-4 text-gray-600">{a.category || '-'}</td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    a.is_published ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
                  }`}>
                    {a.is_published ? 'Publisert' : 'Utkast'}
                  </span>
                </td>
                <td className="p-4 text-gray-500">{formatDate(a.created_at)}</td>
                <td className="p-4">
                  {a.is_published && (
                    <a href={`/artikler/${a.slug}`} target="_blank" className="p-2 hover:bg-gray-100 rounded inline-block">👁️</a>
                  )}
                  <button onClick={() => openModal(a)} className="p-2 hover:bg-gray-100 rounded">✏️</button>
                  <button onClick={() => handleDelete(a.id, a.title)} className="p-2 hover:bg-gray-100 rounded text-red-500">🗑️</button>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan={5} className="p-8 text-center text-gray-500">
                  Ingen artikler funnet
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b flex justify-between items-center">
              <h2 className="text-xl font-semibold">{editArticle ? 'Rediger artikkel' : 'Ny artikkel'}</h2>
              <button onClick={() => setShowModal(false)} className="text-2xl text-gray-400 hover:text-gray-600">&times;</button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Tittel *</label>
                  <input
                    type="text"
                    value={form.title}
                    onChange={(e) => {
                      setForm({ ...form, title: e.target.value, slug: editArticle ? form.slug : generateSlug(e.target.value) });
                    }}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-[#8DC99C]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">URL-slug *</label>
                  <input
                    type="text"
                    value={form.slug}
                    onChange={(e) => setForm({ ...form, slug: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-[#8DC99C]"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Oppsummering</label>
                <textarea
                  value={form.summary}
                  onChange={(e) => setForm({ ...form, summary: e.target.value })}
                  rows={2}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-[#8DC99C]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Innhold (Markdown)</label>
                <textarea
                  value={form.content}
                  onChange={(e) => setForm({ ...form, content: e.target.value })}
                  rows={10}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-[#8DC99C] font-mono text-sm"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Kategori</label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-[#8DC99C]"
                  >
                    <option value="">Velg kategori</option>
                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Bilde-URL</label>
                  <input
                    type="text"
                    value={form.image_url}
                    onChange={(e) => setForm({ ...form, image_url: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-[#8DC99C]"
                  />
                </div>
              </div>

              {/* SEO */}
              <details className="border rounded-lg p-4">
                <summary className="font-medium cursor-pointer">🔍 SEO-innstillinger</summary>
                <div className="mt-4 space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">SEO-tittel (maks 60 tegn)</label>
                    <input
                      type="text"
                      value={form.seo_title}
                      onChange={(e) => setForm({ ...form, seo_title: e.target.value })}
                      maxLength={60}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-[#8DC99C]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Meta-beskrivelse (maks 160 tegn)</label>
                    <textarea
                      value={form.seo_description}
                      onChange={(e) => setForm({ ...form, seo_description: e.target.value })}
                      maxLength={160}
                      rows={2}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-[#8DC99C]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Nøkkelord</label>
                    <input
                      type="text"
                      value={form.seo_keywords}
                      onChange={(e) => setForm({ ...form, seo_keywords: e.target.value })}
                      placeholder="bitcoin, krypto, sikkerhet"
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-[#8DC99C]"
                    />
                  </div>
                </div>
              </details>

              {/* AEO */}
              <details className="border rounded-lg p-4">
                <summary className="font-medium cursor-pointer">💡 AEO (Answer Engine Optimization)</summary>
                <div className="mt-4 space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Spørsmål</label>
                    <input
                      type="text"
                      value={form.aeo_question}
                      onChange={(e) => setForm({ ...form, aeo_question: e.target.value })}
                      placeholder="Hva er en hardware wallet?"
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-[#8DC99C]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Svar (for featured snippets)</label>
                    <textarea
                      value={form.aeo_answer}
                      onChange={(e) => setForm({ ...form, aeo_answer: e.target.value })}
                      rows={2}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-[#8DC99C]"
                    />
                  </div>
                </div>
              </details>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={form.is_published}
                  onChange={(e) => setForm({ ...form, is_published: e.target.checked })}
                  className="w-5 h-5 rounded border-gray-300 text-[#8DC99C] focus:ring-[#8DC99C]"
                />
                <label className="text-sm">Publisert</label>
              </div>
            </div>
            <div className="p-6 border-t flex justify-end gap-3">
              <button onClick={() => setShowModal(false)} className="px-6 py-2 border rounded-lg hover:bg-gray-50">
                Avbryt
              </button>
              <button onClick={handleSave} className="px-6 py-2 bg-[#8DC99C] text-white rounded-lg hover:bg-[#7ab889]">
                Lagre
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
