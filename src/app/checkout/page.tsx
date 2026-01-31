'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface CartItem {
  product_id: number;
  name: string;
  price: number;
  quantity: number;
}

interface Cart {
  items: CartItem[];
  total: number;
}

export default function CheckoutPage() {
  const router = useRouter();
  const [cart, setCart] = useState<Cart>({ items: [], total: 0 });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    postalCode: '',
    city: '',
    paymentMethod: 'vipps'
  });

  useEffect(() => {
    loadCart();
  }, []);

  const loadCart = async () => {
    try {
      const res = await fetch('/api/cart', { credentials: 'include' });
      const data = await res.json();
      setCart(data);

      if (data.items.length === 0) {
        router.push('/cart');
      }
    } catch (error) {
      console.error('Failed to load cart:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      // In a real implementation, this would call the checkout API
      // For now, we simulate success
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Clear cart and redirect to confirmation
      router.push('/order-confirmation?order=' + Math.random().toString(36).substring(7).toUpperCase());
    } catch (error) {
      console.error('Checkout error:', error);
      alert('Noe gikk galt. Prøv igjen.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-8 py-16 text-center">
        <div className="loading-spinner"></div>
        <p className="text-gray-500">Laster...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-8 py-12">
      <h1 className="text-3xl font-bold text-gray-800 mb-8 flex items-center gap-3"><svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2"><rect x="1" y="4" width="22" height="16" rx="2"></rect><line x1="1" y1="10" x2="23" y2="10"></line></svg>Betaling</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Checkout Form */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Contact Info */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Kontaktinformasjon</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block font-medium text-gray-700 mb-2">Fullt navn *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block font-medium text-gray-700 mb-2">E-post *</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block font-medium text-gray-700 mb-2">Telefon</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>
              </div>
            </div>

            {/* Address */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">📍 Leveringsadresse</h2>
              <div className="space-y-4">
                <div>
                  <label className="block font-medium text-gray-700 mb-2">Adresse *</label>
                  <input
                    type="text"
                    required
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block font-medium text-gray-700 mb-2">Postnummer *</label>
                    <input
                      type="text"
                      required
                      value={formData.postalCode}
                      onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block font-medium text-gray-700 mb-2">Sted *</label>
                    <input
                      type="text"
                      required
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Betalingsmetode</h2>
              <div className="space-y-3">
                <label className="flex items-center gap-4 p-4 border-2 rounded-lg cursor-pointer transition-colors hover:border-[#8DC99C]">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="vipps"
                    checked={formData.paymentMethod === 'vipps'}
                    onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                    className="w-5 h-5 text-[#8DC99C]"
                  />
                  <span className="text-2xl">📱</span>
                  <div>
                    <span className="font-bold text-gray-800">Vipps</span>
                    <p className="text-sm text-gray-500">Betal enkelt med Vipps</p>
                  </div>
                </label>
                <label className="flex items-center gap-4 p-4 border-2 rounded-lg cursor-pointer transition-colors hover:border-[#8DC99C]">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="card"
                    checked={formData.paymentMethod === 'card'}
                    onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                    className="w-5 h-5 text-[#8DC99C]"
                  />
                  <span className="text-2xl text-[var(--primary)]"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="1" y="4" width="22" height="16" rx="2"></rect><line x1="1" y1="10" x2="23" y2="10"></line></svg></span>
                  <div>
                    <span className="font-bold text-gray-800">Kort</span>
                    <p className="text-sm text-gray-500">Visa, Mastercard</p>
                  </div>
                </label>
                <label className="flex items-center gap-4 p-4 border-2 rounded-lg cursor-pointer transition-colors hover:border-[#8DC99C]">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="crypto"
                    checked={formData.paymentMethod === 'crypto'}
                    onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                    className="w-5 h-5 text-[#8DC99C]"
                  />
                  <span className="text-2xl">⛓️</span>
                  <div>
                    <span className="font-bold text-gray-800">Krypto</span>
                    <p className="text-sm text-gray-500">Bitcoin, Ethereum, stablecoins</p>
                  </div>
                </label>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="btn-primary w-full text-lg py-4"
            >
              {submitting ? 'Behandler...' : `Betal ${cart.total.toLocaleString('nb-NO')} kr`}
            </button>
          </form>
        </div>

        {/* Order Summary */}
        <div>
          <div className="bg-white rounded-xl shadow-sm p-6 sticky top-24">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Ordre</h2>

            <div className="space-y-4 mb-6">
              {cart.items.map((item) => (
                <div key={item.product_id} className="flex justify-between items-start">
                  <div>
                    <p className="font-medium text-gray-800">{item.name}</p>
                    <p className="text-sm text-gray-500">Antall: {item.quantity}</p>
                  </div>
                  <p className="font-bold text-gray-800">
                    {(item.price * item.quantity).toLocaleString('nb-NO')} kr
                  </p>
                </div>
              ))}
            </div>

            <div className="border-t border-gray-200 pt-4">
              <div className="flex justify-between items-center">
                <span className="text-lg text-gray-600">Total</span>
                <span className="text-2xl font-bold text-gray-800">
                  {cart.total.toLocaleString('nb-NO')} kr
                </span>
              </div>
            </div>

            <Link href="/cart" className="block text-center text-[#8DC99C] mt-4 hover:underline">
              ← Tilbake til handlekurv
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
