'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface CartItem {
  id: number;
  product_id: number;
  name: string;
  price: number;
  quantity: number;
  image_url?: string;
  category?: string;
}

interface Cart {
  items: CartItem[];
  total: number;
}

export default function CartPage() {
  const [cart, setCart] = useState<Cart>({ items: [], total: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCart();
  }, []);

  const loadCart = async () => {
    try {
      const res = await fetch('/api/cart', { credentials: 'include' });
      const data = await res.json();
      setCart(data);
    } catch (error) {
      console.error('Failed to load cart:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (productId: number, quantity: number) => {
    try {
      const res = await fetch('/api/cart/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ productId, quantity })
      });

      if (res.ok) {
        loadCart();
      }
    } catch (error) {
      console.error('Failed to update quantity:', error);
    }
  };

  const removeItem = async (productId: number) => {
    try {
      const res = await fetch('/api/cart/remove', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ productId })
      });

      if (res.ok) {
        loadCart();
      }
    } catch (error) {
      console.error('Failed to remove item:', error);
    }
  };

  const getIcon = (category?: string) => {
    const iconMap: Record<string, JSX.Element> = {
      'chatbot': <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>,
      'konsultasjon': <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>,
      'kurs': <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 10v6M2 10l10-5 10 5-10 5z"></path><path d="M6 12v5c3 3 9 3 12 0v-5"></path></svg>,
      'hardware-wallets': <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>,
      'boker': <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>
    };
    return iconMap[category || ''] || <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path></svg>;
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-8 py-16 text-center">
        <div className="loading-spinner"></div>
        <p className="text-gray-500">Laster handlekurv...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-8 py-12">
      <h1 className="text-3xl font-bold text-gray-800 mb-8 flex items-center gap-3">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2">
          <circle cx="9" cy="21" r="1"></circle>
          <circle cx="20" cy="21" r="1"></circle>
          <path d="m1 1 4 4h16l-3 9H7L4 5H1"></path>
        </svg>
        Handlekurv
      </h1>

      {cart.items.length === 0 ? (
        <div className="bg-white rounded-xl p-12 text-center shadow-sm">
          <span className="text-6xl mb-4 block text-[var(--primary)] flex justify-center">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <circle cx="9" cy="21" r="1"></circle>
              <circle cx="20" cy="21" r="1"></circle>
              <path d="m1 1 4 4h16l-3 9H7L4 5H1"></path>
            </svg>
          </span>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Handlekurven er tom</h2>
          <p className="text-gray-500 mb-6">
            Du har ikke lagt til noen produkter ennå.
          </p>
          <Link href="/" className="btn-primary inline-block">
            Se produkter
          </Link>
        </div>
      ) : (
        <>
          {/* Cart Items */}
          <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-8">
            {cart.items.map((item, index) => (
              <div
                key={item.product_id}
                className={`flex items-center gap-6 p-6 ${
                  index > 0 ? 'border-t border-gray-100' : ''
                }`}
              >
                {/* Image */}
                {item.image_url ? (
                  <img
                    src={item.image_url}
                    alt={item.name}
                    className="w-20 h-20 object-cover rounded-lg"
                  />
                ) : (
                  <div className="w-20 h-20 bg-gradient-to-br from-[#8DC99C] to-[#6ab57a] rounded-lg flex items-center justify-center text-white">
                    {getIcon(item.category)}
                  </div>
                )}

                {/* Info */}
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-800">{item.name}</h3>
                  <p className="text-gray-500">
                    {item.price.toLocaleString('nb-NO')} kr per stk
                  </p>
                </div>

                {/* Quantity */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => updateQuantity(item.product_id, item.quantity - 1)}
                    className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-gray-200"
                    disabled={item.quantity <= 1}
                  >
                    −
                  </button>
                  <span className="w-8 text-center font-medium">{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.product_id, item.quantity + 1)}
                    className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-gray-200"
                  >
                    +
                  </button>
                </div>

                {/* Subtotal */}
                <div className="text-right min-w-[100px]">
                  <p className="text-lg font-bold text-gray-800">
                    {(item.price * item.quantity).toLocaleString('nb-NO')} kr
                  </p>
                </div>

                {/* Remove */}
                <button
                  onClick={() => removeItem(item.product_id)}
                  className="text-red-500 hover:text-red-700 p-2"
                  title="Fjern"
                >
                  🗑️
                </button>
              </div>
            ))}
          </div>

          {/* Summary */}
          <div className="bg-white rounded-xl shadow-sm p-8">
            <div className="flex justify-between items-center mb-6">
              <span className="text-xl text-gray-600">Sum</span>
              <span className="text-3xl font-bold text-gray-800">
                {cart.total.toLocaleString('nb-NO')} kr
              </span>
            </div>

            <Link href="/checkout" className="btn-primary block text-center">
              Gå til betaling
            </Link>

            <Link href="/" className="block text-center text-[#8DC99C] mt-4 hover:underline">
              ← Fortsett å handle
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
