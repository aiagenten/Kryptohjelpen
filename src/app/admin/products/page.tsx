'use client';

import { useEffect, useState } from 'react';

interface Product {
  id: number;
  name: string;
  slug: string;
  description: string;
  price_nok: number;
  image_url: string;
  category: string;
  tags: string;
  stock: number;
  is_active: boolean;
}

export default function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [search, setSearch] = useState('');

  const [form, setForm] = useState({
    name: '', slug: '', description: '', price: '', stock: '0',
    category: 'hardware-wallets', tags: '', imageUrl: '', isActive: true
  });

  const loadProducts = () => {
    fetch('/api/admin/products')
      .then(r => r.json())
      .then(data => {
        setProducts(data);
        setLoading(false);
      });
  };

  useEffect(() => { loadProducts(); }, []);

  const formatNOK = (amount: number) =>
    new Intl.NumberFormat('nb-NO', { style: 'currency', currency: 'NOK', minimumFractionDigits: 0 }).format(amount);

  const generateSlug = (text: string) =>
    text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

  const openModal = (product?: Product) => {
    if (product) {
      setEditProduct(product);
      setForm({
        name: product.name,
        slug: product.slug,
        description: product.description || '',
        price: String(product.price_nok),
        stock: String(product.stock),
        category: product.category,
        tags: product.tags || '',
        imageUrl: product.image_url || '',
        isActive: product.is_active
      });
    } else {
      setEditProduct(null);
      setForm({ name: '', slug: '', description: '', price: '', stock: '0', category: 'hardware-wallets', tags: '', imageUrl: '', isActive: true });
    }
    setShowModal(true);
  };

  const handleSave = async () => {
    const data = {
      name: form.name,
      slug: form.slug,
      description: form.description,
      price: parseFloat(form.price),
      stock: parseInt(form.stock),
      category: form.category,
      tags: form.tags,
      imageUrl: form.imageUrl,
      isActive: form.isActive
    };

    const url = editProduct ? `/api/admin/products/${editProduct.id}` : '/api/admin/products';
    const method = editProduct ? 'PUT' : 'POST';

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });

    if (res.ok) {
      setShowModal(false);
      loadProducts();
    }
  };

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`Slette "${name}"?`)) return;
    await fetch(`/api/admin/products/${id}`, { method: 'DELETE' });
    loadProducts();
  };

  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.slug.toLowerCase().includes(search.toLowerCase())
  );

  const categories: Record<string, string> = {
    'hardware-wallets': 'Hardware Wallets',
    'seed-storage': 'Seed Storage',
    'accessories': 'Tilbehør',
    'bundles': 'Pakker'
  };

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
          placeholder="🔍 Søk produkter..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="px-4 py-2 border rounded-lg w-72 focus:outline-none focus:border-[#8DC99C]"
        />
        <button
          onClick={() => openModal()}
          className="bg-[#8DC99C] text-white px-6 py-2 rounded-lg font-medium hover:bg-[#7ab889]"
        >
          ➕ Nytt produkt
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr className="text-left text-xs text-gray-500 uppercase">
              <th className="p-4 w-16">Bilde</th>
              <th className="p-4">Produkt</th>
              <th className="p-4">Kategori</th>
              <th className="p-4">Pris</th>
              <th className="p-4">Lager</th>
              <th className="p-4">Status</th>
              <th className="p-4 w-32">Handlinger</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {filtered.length ? filtered.map(p => (
              <tr key={p.id} className="hover:bg-gray-50">
                <td className="p-4">
                  {p.image_url ? (
                    <img src={p.image_url} alt={p.name} className="w-12 h-12 object-cover rounded-lg" />
                  ) : (
                    <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">📦</div>
                  )}
                </td>
                <td className="p-4">
                  <div className="font-medium">{p.name}</div>
                  <div className="text-sm text-gray-500">{p.slug}</div>
                </td>
                <td className="p-4 text-gray-600">{categories[p.category] || p.category}</td>
                <td className="p-4">{formatNOK(p.price_nok)}</td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    p.stock === 0 ? 'bg-red-100 text-red-800' :
                    p.stock < 10 ? 'bg-yellow-100 text-yellow-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {p.stock} stk
                  </span>
                </td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    p.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
                  }`}>
                    {p.is_active ? 'Aktiv' : 'Inaktiv'}
                  </span>
                </td>
                <td className="p-4">
                  <button onClick={() => openModal(p)} className="p-2 hover:bg-gray-100 rounded">✏️</button>
                  <button onClick={() => handleDelete(p.id, p.name)} className="p-2 hover:bg-gray-100 rounded text-red-500">🗑️</button>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan={7} className="p-8 text-center text-gray-500">
                  Ingen produkter funnet
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b flex justify-between items-center">
              <h2 className="text-xl font-semibold">{editProduct ? 'Rediger produkt' : 'Nytt produkt'}</h2>
              <button onClick={() => setShowModal(false)} className="text-2xl text-gray-400 hover:text-gray-600">&times;</button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Produktnavn *</label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => {
                      setForm({ ...form, name: e.target.value, slug: editProduct ? form.slug : generateSlug(e.target.value) });
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
                <label className="block text-sm font-medium mb-1">Beskrivelse</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-[#8DC99C]"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Pris (NOK) *</label>
                  <input
                    type="number"
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-[#8DC99C]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Lager *</label>
                  <input
                    type="number"
                    value={form.stock}
                    onChange={(e) => setForm({ ...form, stock: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-[#8DC99C]"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Kategori</label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-[#8DC99C]"
                  >
                    {Object.entries(categories).map(([val, label]) => (
                      <option key={val} value={val}>{label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Tags</label>
                  <input
                    type="text"
                    value={form.tags}
                    onChange={(e) => setForm({ ...form, tags: e.target.value })}
                    placeholder="ledger, bitcoin"
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-[#8DC99C]"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Bilde-URL</label>
                <input
                  type="text"
                  value={form.imageUrl}
                  onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-[#8DC99C]"
                />
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={form.isActive}
                  onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                  className="w-5 h-5 rounded border-gray-300 text-[#8DC99C] focus:ring-[#8DC99C]"
                />
                <label className="text-sm">Aktiv (synlig i nettbutikken)</label>
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
