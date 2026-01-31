'use client';

import { useEffect, useState } from 'react';

interface Product {
  id: number;
  name: string;
  description: string;
  price_nok: number;
  category: string;
  image_url?: string;
  stock: number;
}

interface Category {
  slug: string;
  name: string;
}

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');

  useEffect(() => {
    loadCategories();
    loadProducts();
  }, []);

  const loadCategories = async () => {
    try {
      const res = await fetch('/api/products/meta/categories');
      const data = await res.json();
      setCategories(data);
    } catch (error) {
      console.error('Failed to load categories:', error);
    }
  };

  const loadProducts = async (cat = '', searchQuery = '') => {
    try {
      setLoading(true);
      let url = '/api/products?limit=100';
      if (cat) url += `&category=${cat}`;
      if (searchQuery) url += `&search=${encodeURIComponent(searchQuery)}`;

      const res = await fetch(url);
      const data = await res.json();
      setProducts(data.products || []);
    } catch (error) {
      console.error('Failed to load products:', error);
    } finally {
      setLoading(false);
    }
  };

  const getProductIcon = (cat: string) => {
    const iconMap: Record<string, JSX.Element> = {
      'chatbot': <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>,
      'konsultasjon': <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>,
      'kurs': <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 10v6M2 10l10-5 10 5-10 5z"></path><path d="M6 12v5c3 3 9 3 12 0v-5"></path></svg>,
      'kurser': <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 10v6M2 10l10-5 10 5-10 5z"></path><path d="M6 12v5c3 3 9 3 12 0v-5"></path></svg>,
      'hardware-wallets': <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>,
      'boker': <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>
    };
    return iconMap[cat] || <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path></svg>;
  };

  const getCategoryName = (cat: string) => {
    const names: Record<string, string> = {
      'chatbot': 'Chatbot',
      'konsultasjon': 'Konsultasjon',
      'kurs': 'Bedriftskurs'
    };
    return names[cat] || cat;
  };

  const hasOffer = (product: Product) => {
    return product.description?.toLowerCase().includes('tilbud');
  };

  const addToCart = async (productId: number) => {
    try {
      const res = await fetch('/api/cart/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ productId, quantity: 1 })
      });

      if (res.ok) {
        const product = products.find(p => p.id === productId);
        if (product) {
          showNotification(`${product.name} lagt til i handlekurven`);
        }
        // Reload cart count in nav
        window.dispatchEvent(new Event('cartUpdated'));
      } else {
        const error = await res.json();
        showNotification(error.error || 'Kunne ikke legge til produkt', 'error');
      }
    } catch (error) {
      console.error('Failed to add to cart:', error);
      showNotification('Noe gikk galt. Prøv igjen.', 'error');
    }
  };

  const showNotification = (message: string, type: 'success' | 'error' = 'success') => {
    const notification = document.createElement('div');
    notification.textContent = message;
    notification.className = `notification ${type}`;
    document.body.appendChild(notification);

    setTimeout(() => {
      notification.style.animation = 'slideOut 0.3s ease';
      setTimeout(() => notification.remove(), 300);
    }, 3000);
  };

  const handleSearch = (value: string) => {
    setSearch(value);
    loadProducts(category, value);
  };

  const handleCategoryChange = (value: string) => {
    setCategory(value);
    loadProducts(value, search);
  };

  return (
    <>
      {/* Hero Section */}
      <div className="hero">
        <div className="relative max-w-4xl mx-auto">
          <h1 className="text-4xl font-extrabold mb-4 leading-tight" style={{ textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)' }}>
            Kryptohjelpen - Din guide til Web3
          </h1>
          <p className="text-lg opacity-95 mb-6" style={{ textShadow: '0 1px 3px rgba(0, 0, 0, 0.25)' }}>
            Teknisk veiledning innen krypto, metaverse og Web3. Vi tilbyr kun rådgivning - ingen investeringsråd.
          </p>
          <div className="flex justify-center gap-4 md:gap-8 flex-wrap mt-8">
            <span className="hero-badge">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
              Chatbot 24/7
            </span>
            <span className="hero-badge">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
              Personlig veiledning
            </span>
            <span className="hero-badge">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 10v6M2 10l10-5 10 5-10 5z"></path><path d="M6 12v5c3 3 9 3 12 0v-5"></path></svg>
              Bedriftskurs
            </span>
          </div>
        </div>
      </div>

      {/* About Section */}
      <section className="bg-white py-12 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
            Om Kryptohjelpen
          </h2>
          <p className="text-gray-500 leading-relaxed mb-6 max-w-2xl">
            Vi tilbyr <strong>teknisk veiledning</strong> innen krypto, metaverse og Web3 – ikke investeringsråd.
            Vår misjon er å gjøre blokkjedeteknologi tilgjengelig for alle, fra nybegynnere til bedrifter.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex gap-3">
              <span className="text-2xl text-[var(--primary)]">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 10v6M2 10l10-5 10 5-10 5z"></path><path d="M6 12v5c3 3 9 3 12 0v-5"></path></svg>
              </span>
              <div>
                <strong className="block text-gray-800 mb-1">Kompetanse</strong>
                <p className="text-gray-500 text-sm">Erfarne rådgivere med dyp teknisk forståelse</p>
              </div>
            </div>
            <div className="flex gap-3">
              <span className="text-2xl text-[var(--primary)]">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
              </span>
              <div>
                <strong className="block text-gray-800 mb-1">Sikkerhet først</strong>
                <p className="text-gray-500 text-sm">Vi lærer deg trygge metoder og beste praksis</p>
              </div>
            </div>
            <div className="flex gap-3">
              <span className="text-2xl text-[var(--primary)]">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>
              </span>
              <div>
                <strong className="block text-gray-800 mb-1">Norsk support</strong>
                <p className="text-gray-500 text-sm">Veiledning på norsk, tilpasset norske forhold</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trustpilot Reviews Section */}
      <section className="bg-gray-50 py-12 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-8 text-center">Hva kundene sier</h2>
          
          {/* Trustpilot Rating Card */}
          <div className="max-w-2xl mx-auto">
            <a 
              href="https://no.trustpilot.com/review/kryptohjelpen.no" 
              target="_blank" 
              rel="noopener noreferrer"
              className="block bg-white rounded-xl shadow-sm p-8 hover:shadow-md transition-shadow text-center"
            >
              {/* Trustpilot Logo */}
              <div className="flex items-center justify-center gap-2 mb-4">
                <svg width="120" height="30" viewBox="0 0 126 31" xmlns="http://www.w3.org/2000/svg">
                  <path d="M33.1 10.8h-6.9v15.6h3.1v-5.6h3.8c3.2 0 5.5-2.1 5.5-5s-2.3-5-5.5-5zm-.2 7.5h-3.6v-4.8h3.6c1.6 0 2.6.9 2.6 2.4s-1 2.4-2.6 2.4zm12.2-2.5c-1.8 0-3 .8-3.5 2v-1.8h-3v12.4h3.1v-6.4c0-1.8 1-2.8 2.5-2.8.4 0 .9.1 1.3.2v-3.4c-.3-.1-.9-.2-1.4-.2zm10.9 10.5v-3c-.4.1-.8.2-1.2.2-1.1 0-1.7-.6-1.7-1.7v-5.2h2.9v-2.6h-2.9V9.8h-3.1v4.2h-2v2.6h2v5.8c0 2.5 1.5 4 4.2 4 .7 0 1.3-.1 1.8-.1zm7.2.2c2.4 0 4.1-1.1 4.8-2.8l-2.6-1c-.3.9-1.1 1.4-2.2 1.4-1.4 0-2.4-.9-2.6-2.4h7.6v-.9c0-3.7-2.3-6-5.5-6-3.3 0-5.5 2.4-5.5 5.9 0 3.4 2.3 5.8 6 5.8zm-.4-9.4c1.2 0 2.1.8 2.3 2.1h-4.7c.3-1.3 1.2-2.1 2.4-2.1zm14.2 9.2l-.6-2.7c-.2.1-.5.1-.8.1-.8 0-1.3-.5-1.3-1.4v-9.3h3.1V10h-3.1V6.4h-3v3.6h-2v2.7h2V22c0 2.6 1.4 4.1 4 4.1.6 0 1.2-.1 1.7-.2zm12.6 0v-8.6c0-2.6-1.7-4.4-4.7-4.4-2 0-3.6.8-4.4 2.3l2.4 1.4c.4-.9 1.1-1.3 2-1.3 1.2 0 1.8.6 1.8 1.7v.8c-.6-.3-1.5-.5-2.5-.5-2.5 0-4.3 1.3-4.3 3.6 0 2.1 1.6 3.6 4 3.6 1.4 0 2.5-.5 3-1.4v1.3h2.7v-.5zm-5-2.1c-1 0-1.6-.5-1.6-1.3 0-.8.7-1.3 1.9-1.3.8 0 1.5.2 2 .4-.1 1.3-1.1 2.2-2.3 2.2zm9.2 2.1V13h3.1v13.3h-3.1zm1.5-15c1 0 1.8-.8 1.8-1.8s-.8-1.8-1.8-1.8-1.8.8-1.8 1.8.8 1.8 1.8 1.8zm9.6 15.2c3.3 0 5.3-2 5.3-4.3 0-2.7-2.1-3.5-4.4-4-1.6-.4-2.3-.6-2.3-1.3 0-.6.5-1 1.5-1 1.1 0 1.8.5 2 1.4l2.7-1.1c-.5-1.8-2.1-3-4.6-3-2.8 0-4.7 1.6-4.7 3.9 0 2.5 1.9 3.4 4.1 3.9 1.7.4 2.6.6 2.6 1.4 0 .7-.6 1.1-1.7 1.1-1.4 0-2.3-.7-2.5-1.8l-2.8 1c.5 2.1 2.3 3.4 4.8 3.4zm12.2 0c2.4 0 4.1-1.1 4.8-2.8l-2.6-1c-.3.9-1.1 1.4-2.2 1.4-1.4 0-2.4-.9-2.6-2.4h7.6v-.9c0-3.7-2.3-6-5.5-6-3.3 0-5.5 2.4-5.5 5.9 0 3.4 2.3 5.8 6 5.8zm-.4-9.4c1.2 0 2.1.8 2.3 2.1h-4.7c.3-1.3 1.2-2.1 2.4-2.1z" fill="#191919"/>
                  <path d="M0 10.7l12.7-1.7 4.6-10.1 4.6 10.1 12.7 1.7-9.2 8.6 2.2 12.5-10.3-5.6-10.3 5.6 2.2-12.5L0 10.7z" fill="#00B67A"/>
                  <path d="M25.5 22.3l-1-3.3-7.2 5.3 8.2-2z" fill="#005128"/>
                </svg>
              </div>
              
              {/* Stars */}
              <div className="flex justify-center gap-1 mb-3">
                {[1,2,3,4].map((i) => (
                  <svg key={i} width="24" height="24" viewBox="0 0 24 24" fill="#00B67A">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                  </svg>
                ))}
                <svg width="24" height="24" viewBox="0 0 24 24">
                  <defs>
                    <linearGradient id="half">
                      <stop offset="50%" stopColor="#00B67A"/>
                      <stop offset="50%" stopColor="#dcdce6"/>
                    </linearGradient>
                  </defs>
                  <path fill="url(#half)" d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>
              </div>
              
              <p className="text-gray-800 font-semibold mb-1">Vurdert som «Bra»</p>
              <p className="text-gray-500 text-sm mb-4">Basert på anmeldelser på Trustpilot</p>
              
              <span className="text-[var(--primary)] font-medium hover:underline">
                Les anmeldelser på Trustpilot →
              </span>
            </a>
          </div>
        </div>
      </section>

      {/* Products Section */}
      <div className="max-w-7xl mx-auto px-8 py-12">
        {/* Section Header */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800">Våre tjenester</h2>
          <p className="text-gray-500 mt-2">Velg den tjenesten som passer best for deg</p>
        </div>

        {/* Product Grid */}
        {loading ? (
          <div className="text-center py-16 text-gray-500">
            <div className="loading-spinner"></div>
            <p>Laster produkter...</p>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-16 text-gray-500">
            <p>Ingen produkter funnet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => {
              const icon = getProductIcon(product.category);
              const isOffer = hasOffer(product);
              const categoryName = getCategoryName(product.category);
              const priceFormatted = product.price_nok.toLocaleString('nb-NO', { maximumFractionDigits: 0 });
              const isExMva = product.description?.toLowerCase().includes('eks. mva');

              return (
                <article key={product.id} className="product-card">
                  {product.image_url ? (
                    <img
                      src={product.image_url}
                      alt={product.name}
                      className="w-full h-40 object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        target.parentElement?.classList.add('product-image-placeholder-fallback');
                      }}
                    />
                  ) : (
                    <div className="product-image-placeholder">{icon}</div>
                  )}
                  <div className="p-5 flex-1 flex flex-col">
                    <div className="flex gap-2 items-center mb-4">
                      <span className="category-badge">{categoryName}</span>
                      {isOffer && (
                        <span className="category-badge" style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#ef4444' }}>
                          TILBUD
                        </span>
                      )}
                    </div>
                    <h3 className="text-xl font-bold text-gray-800 mb-3">{product.name}</h3>
                    <p className="text-gray-500 leading-relaxed mb-6 flex-1">
                      {product.description || 'Ingen beskrivelse tilgjengelig.'}
                    </p>
                    <div className="border-t border-gray-200 pt-6">
                      <div className="mb-4">
                        <div className="text-2xl font-bold text-gray-800">
                          {isOffer && (
                            <span className="line-through text-base text-gray-400 mr-2">1 990</span>
                          )}
                          {priceFormatted} kr
                          {isExMva && <small className="text-xs font-normal"> eks.mva</small>}
                        </div>
                      </div>
                      {product.category === 'konsultasjon' ? (
                        <a href="/konsultasjon" className="btn-primary w-full block text-center">
                          Velg tid & bestill
                        </a>
                      ) : (
                        <button className="btn-primary w-full" onClick={() => addToCart(product.id)}>
                          Bestill nå
                        </button>
                      )}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
