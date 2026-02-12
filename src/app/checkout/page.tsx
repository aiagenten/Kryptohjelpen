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

interface CryptoInfo {
  address: string;
  cryptoAmount: string;
  symbol: string;
  network: { name: string; explorer: string };
  networks: Array<{ id: string; name: string; symbol: string }>;
}

interface BookingInfo {
  slot: { start: string; end: string };
  displayDate: string;
  displayTime: string;
}

// Static fallback networks (same as API)
const AVAILABLE_NETWORKS = [
  { id: 'ethereum', name: 'Ethereum', symbol: 'ETH' },
  { id: 'polygon', name: 'Polygon', symbol: 'MATIC' },
  { id: 'arbitrum', name: 'Arbitrum', symbol: 'ETH' },
  { id: 'optimism', name: 'Optimism', symbol: 'ETH' },
  { id: 'base', name: 'Base', symbol: 'ETH' },
  { id: 'bsc', name: 'BNB Chain', symbol: 'BNB' },
];

export default function CheckoutPage() {
  const router = useRouter();
  const [cart, setCart] = useState<Cart>({ items: [], total: 0 });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'vipps' | 'crypto'>('vipps');
  
  // Booking state
  const [bookingInfo, setBookingInfo] = useState<BookingInfo | null>(null);
  
  // Crypto state
  const [selectedNetwork, setSelectedNetwork] = useState('polygon');
  const [cryptoInfo, setCryptoInfo] = useState<CryptoInfo | null>(null);
  const [txHash, setTxHash] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);

  useEffect(() => {
    loadCart();
    loadBookingInfo();
  }, []);

  useEffect(() => {
    if (paymentMethod === 'crypto' && cart.total > 0) {
      loadCryptoInfo();
    }
  }, [paymentMethod, selectedNetwork, cart.total]);

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

  const loadBookingInfo = () => {
    try {
      const stored = localStorage.getItem('consultationBooking');
      if (stored) {
        const booking = JSON.parse(stored);
        setBookingInfo(booking);
      }
    } catch (err) {
      console.error('Failed to load booking info:', err);
    }
  };

  const loadCryptoInfo = async () => {
    try {
      const res = await fetch(`/api/payments/crypto?amount=${cart.total}&network=${selectedNetwork}`);
      const data = await res.json();
      setCryptoInfo(data);
    } catch (err) {
      console.error('Failed to load crypto info:', err);
    }
  };

  const createOrder = async () => {
    const orderRes = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        items: cart.items,
        total: cart.total,
        paymentMethod: paymentMethod === 'crypto' ? `crypto-${selectedNetwork}` : 'vipps',
        bookingTime: bookingInfo?.slot?.start || null
      })
    });

    if (!orderRes.ok) {
      throw new Error('Kunne ikke opprette ordre');
    }

    const orderData = await orderRes.json();
    
    // Clear booking info after successful order
    localStorage.removeItem('consultationBooking');
    
    return orderData.orderId || orderData.id;
  };

  const handleVippsPayment = async () => {
    setSubmitting(true);
    setError('');

    try {
      const newOrderId = await createOrder();
      setOrderId(newOrderId);

      const vippsRes = await fetch('/api/payments/vipps/initiate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: cart.total,
          orderId: newOrderId.toString(),
          description: cart.items.map(i => i.name).join(', '),
          bookingTime: bookingInfo?.slot?.start || null
        })
      });

      const vippsData = await vippsRes.json();

      if (!vippsRes.ok || !vippsData.vippsUrl) {
        throw new Error(vippsData.error || 'Kunne ikke starte Vipps-betaling');
      }

      window.location.href = vippsData.vippsUrl;

    } catch (err) {
      console.error('Payment error:', err);
      setError(err instanceof Error ? err.message : 'Noe gikk galt. Prøv igjen.');
      setSubmitting(false);
    }
  };

  const handleCryptoPayment = async () => {
    setSubmitting(true);
    setError('');

    try {
      const newOrderId = await createOrder();
      setOrderId(newOrderId.toString());
      setSubmitting(false);
      // Now show the crypto payment details - user will pay and enter txHash
    } catch (err) {
      console.error('Order error:', err);
      setError(err instanceof Error ? err.message : 'Noe gikk galt. Prøv igjen.');
      setSubmitting(false);
    }
  };

  const verifyCryptoPayment = async () => {
    if (!txHash || !orderId) return;
    
    setVerifying(true);
    setError('');

    try {
      const res = await fetch('/api/payments/crypto', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId,
          network: selectedNetwork,
          txHash
        })
      });

      const data = await res.json();

      if (data.verified) {
        router.push(`/order-confirmation?orderId=${orderId}&tx=${txHash}`);
      } else {
        setError(data.error || 'Kunne ikke verifisere betaling. Sjekk transaksjons-hash.');
      }
    } catch (err) {
      setError('Verifisering feilet. Prøv igjen.');
    } finally {
      setVerifying(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  // Check if cart has consultation product
  const hasConsultation = cart.items.some(item => 
    item.name.toLowerCase().includes('konsultasjon') || 
    item.name.toLowerCase().includes('hjelp') ||
    item.product_id === 2
  );

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-8 py-16 text-center">
        <div className="animate-spin w-8 h-8 border-4 border-[#8DC99C] border-t-transparent rounded-full mx-auto mb-4"></div>
        <p className="text-gray-500">Laster...</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-8 py-12">
      <h1 className="text-3xl font-bold text-gray-800 mb-8 text-center">Fullfør kjøp</h1>

      {/* Order Summary */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Din ordre</h2>
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
        
        {/* Booking Time Display */}
        {bookingInfo && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
            <div className="flex items-center gap-2 text-blue-800">
              <span className="text-xl">📅</span>
              <div>
                <p className="font-medium">Valgt tidspunkt</p>
                <p className="text-sm">{bookingInfo.displayDate} kl. {bookingInfo.displayTime}</p>
              </div>
            </div>
          </div>
        )}
        
        {/* Warning if consultation without booking time */}
        {hasConsultation && !bookingInfo && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
            <div className="flex items-center gap-2 text-yellow-800">
              <span className="text-xl">⚠️</span>
              <div>
                <p className="font-medium">Mangler tidspunkt</p>
                <p className="text-sm">
                  <Link href="/konsultasjon" className="underline hover:no-underline">
                    Velg tidspunkt for konsultasjonen
                  </Link>
                </p>
              </div>
            </div>
          </div>
        )}
        
        <div className="border-t border-gray-200 pt-4">
          <div className="flex justify-between items-center">
            <span className="text-lg text-gray-600">Total</span>
            <span className="text-2xl font-bold text-gray-800">
              {cart.total.toLocaleString('nb-NO')} kr
            </span>
          </div>
        </div>
      </div>

      {/* Payment Method Selection */}
      {!orderId && (
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Velg betalingsmåte</h2>
          <div className="space-y-3">
            <button
              onClick={() => setPaymentMethod('vipps')}
              className={`w-full p-4 rounded-xl border-2 text-left flex items-center gap-4 transition-all ${
                paymentMethod === 'vipps' ? 'border-[#ff5b24] bg-[#ff5b24]/5' : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <span className="text-2xl">📱</span>
              <div>
                <span className="font-bold text-gray-800">Vipps</span>
                <p className="text-sm text-gray-500">Betal enkelt med Vipps</p>
              </div>
            </button>
            
            <button
              onClick={() => setPaymentMethod('crypto')}
              className={`w-full p-4 rounded-xl border-2 text-left flex items-center gap-4 transition-all ${
                paymentMethod === 'crypto' ? 'border-[#8DC99C] bg-[#8DC99C]/5' : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <span className="text-2xl">⛓️</span>
              <div>
                <span className="font-bold text-gray-800">Krypto</span>
                <p className="text-sm text-gray-500">ETH, MATIC, BNB på flere nettverk</p>
              </div>
            </button>
          </div>
        </div>
      )}

      {/* Payment Details */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 mb-4">
            {error}
          </div>
        )}

        {paymentMethod === 'vipps' && !orderId && (
          <>
            <p className="text-gray-600 mb-6">
              Du blir sendt til Vipps for å logge inn og betale.
            </p>
            <button
              onClick={handleVippsPayment}
              disabled={submitting}
              className="w-full py-4 bg-[#ff5b24] hover:bg-[#e54d1c] text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-3 disabled:opacity-50"
            >
              {submitting ? 'Starter Vipps...' : 'Betal med Vipps'}
            </button>
          </>
        )}

        {paymentMethod === 'crypto' && !orderId && (
          <>
            <div className="mb-4">
              <label className="block font-medium text-gray-700 mb-2">Velg nettverk</label>
              <select
                value={selectedNetwork}
                onChange={(e) => setSelectedNetwork(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg"
              >
                {(cryptoInfo?.networks || AVAILABLE_NETWORKS).map((net) => (
                  <option key={net.id} value={net.id}>
                    {net.name} ({net.symbol})
                  </option>
                ))}
              </select>
            </div>
            
            <button
              onClick={handleCryptoPayment}
              disabled={submitting}
              className="w-full py-4 bg-[#8DC99C] hover:bg-[#7ab889] text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-3 disabled:opacity-50"
            >
              {submitting ? 'Oppretter ordre...' : 'Fortsett med krypto'}
            </button>
          </>
        )}

        {paymentMethod === 'crypto' && orderId && cryptoInfo && (
          <div className="space-y-4">
            <h3 className="font-bold text-gray-800">Send betaling</h3>
            
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-500 mb-1">Beløp å sende:</p>
              <p className="text-2xl font-bold text-gray-800">
                {cryptoInfo.cryptoAmount} {cryptoInfo.symbol}
              </p>
              <p className="text-sm text-gray-500">≈ {cart.total.toLocaleString('nb-NO')} kr</p>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-500 mb-1">Send til ({cryptoInfo.network.name}):</p>
              <div className="flex items-center gap-2">
                <code className="text-sm font-mono bg-white px-2 py-1 rounded border break-all">
                  {cryptoInfo.address}
                </code>
                <button
                  onClick={() => copyToClipboard(cryptoInfo.address)}
                  className="text-[#8DC99C] hover:underline text-sm whitespace-nowrap"
                >
                  Kopier
                </button>
              </div>
            </div>

            <div className="border-t pt-4">
              <label className="block font-medium text-gray-700 mb-2">
                Lim inn transaksjons-hash etter sending:
              </label>
              <input
                type="text"
                value={txHash}
                onChange={(e) => setTxHash(e.target.value)}
                placeholder="0x..."
                className="w-full p-3 border border-gray-300 rounded-lg font-mono text-sm"
              />
            </div>

            <button
              onClick={verifyCryptoPayment}
              disabled={!txHash || verifying}
              className="w-full py-4 bg-[#8DC99C] hover:bg-[#7ab889] text-white font-bold rounded-xl transition-colors disabled:opacity-50"
            >
              {verifying ? 'Verifiserer...' : 'Verifiser betaling'}
            </button>

            <p className="text-xs text-gray-500 text-center">
              Etter sending, vent på minst 1 bekreftelse før du verifiserer.
            </p>
          </div>
        )}
      </div>

      <Link href="/cart" className="block text-center text-[#8DC99C] mt-6 hover:underline">
        ← Tilbake til handlekurv
      </Link>
    </div>
  );
}
