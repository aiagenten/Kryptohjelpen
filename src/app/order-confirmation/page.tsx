'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';

interface OrderStatus {
  order_status: string;
  payment_status: string;
  order_number: string;
}

function OrderConfirmationContent() {
  const searchParams = useSearchParams();
  const orderNumber = searchParams.get('order') || searchParams.get('orderId') || 'UNKNOWN';
  const [status, setStatus] = useState<'loading' | 'paid' | 'pending' | 'failed'>('loading');
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    const checkOrderStatus = async () => {
      try {
        const res = await fetch(`/api/orders/${orderNumber}`);
        if (res.ok) {
          const order: OrderStatus = await res.json();
          
          if (order.payment_status === 'completed' || order.order_status === 'paid') {
            setStatus('paid');
          } else if (order.payment_status === 'failed' || order.order_status === 'cancelled') {
            setStatus('failed');
          } else {
            // Payment might still be processing - retry up to 15 times (30 sec total)
            if (retryCount < 15) {
              setTimeout(() => {
                setRetryCount(r => r + 1);
              }, 2000);
            } else {
              setStatus('pending');
            }
          }
        } else {
          setStatus('pending');
        }
      } catch {
        setStatus('pending');
      }
    };

    checkOrderStatus();
  }, [orderNumber, retryCount]);

  if (status === 'loading') {
    return (
      <div className="max-w-2xl mx-auto px-8 py-16 text-center">
        <div className="bg-white rounded-xl shadow-sm p-12">
          <div className="animate-spin w-16 h-16 border-4 border-[var(--primary)] border-t-transparent rounded-full mx-auto mb-6"></div>
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Bekrefter betaling...</h1>
          <p className="text-gray-500">Vennligst vent mens vi bekrefter betalingen din.</p>
        </div>
      </div>
    );
  }

  if (status === 'failed') {
    return (
      <div className="max-w-2xl mx-auto px-8 py-16 text-center">
        <div className="bg-white rounded-xl shadow-sm p-12">
          <span className="text-6xl mb-6 block text-red-500 flex justify-center">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="15" y1="9" x2="9" y2="15"></line>
              <line x1="9" y1="9" x2="15" y2="15"></line>
            </svg>
          </span>
          <h1 className="text-3xl font-bold text-gray-800 mb-4">Betalingen ble avbrutt</h1>
          <p className="text-gray-500 mb-8">
            Det ser ut som betalingen ikke ble fullført. Ingen penger er trukket.
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/checkout" className="btn-primary">
              Prøv igjen
            </Link>
            <Link href="/" className="px-6 py-3 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors">
              Tilbake til forsiden
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (status === 'pending') {
    return (
      <div className="max-w-2xl mx-auto px-8 py-16 text-center">
        <div className="bg-white rounded-xl shadow-sm p-12">
          <span className="text-6xl mb-6 block text-yellow-500 flex justify-center">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
          </span>
          <h1 className="text-3xl font-bold text-gray-800 mb-4">Venter på bekreftelse</h1>
          <p className="text-gray-500 mb-2">
            Ordrenummer: <strong className="text-gray-800">#{orderNumber}</strong>
          </p>
          <p className="text-gray-500 mb-8">
            Vi venter på bekreftelse fra betalingsleverandøren. Du vil motta en e-post når betalingen er bekreftet.
          </p>
          <Link href="/" className="btn-primary">
            Tilbake til forsiden
          </Link>
        </div>
      </div>
    );
  }

  // status === 'paid'
  return (
    <div className="max-w-2xl mx-auto px-8 py-16 text-center">
      <div className="bg-white rounded-xl shadow-sm p-12">
        <span className="text-6xl mb-6 block text-[var(--primary)] flex justify-center">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
            <polyline points="22 4 12 14.01 9 11.01"></polyline>
          </svg>
        </span>
        <h1 className="text-3xl font-bold text-gray-800 mb-4">Takk for din bestilling!</h1>
        <p className="text-gray-500 mb-2">
          Ordrenummer: <strong className="text-gray-800">#{orderNumber}</strong>
        </p>
        <p className="text-gray-500 mb-8">
          Du vil motta en bekreftelse på e-post med alle detaljer.
        </p>

        <div className="bg-gray-50 rounded-lg p-6 mb-8 text-left">
          <h2 className="font-bold text-gray-800 mb-3">Hva skjer nå?</h2>
          <ol className="list-decimal list-inside space-y-2 text-gray-600">
            <li>Du mottar en ordrebekreftelse på e-post</li>
            <li>Vi behandler din bestilling</li>
            <li>Du får beskjed når produktet er klart</li>
          </ol>
        </div>

        <div className="flex gap-4 justify-center">
          <Link href="/" className="btn-primary">
            Tilbake til forsiden
          </Link>
          <Link
            href="/min-side"
            className="px-6 py-3 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors"
          >
            Mine bestillinger
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function OrderConfirmationPage() {
  return (
    <Suspense fallback={
      <div className="max-w-2xl mx-auto px-8 py-16 text-center">
        <div className="bg-white rounded-xl shadow-sm p-12">
          <div className="animate-spin w-16 h-16 border-4 border-gray-300 border-t-[var(--primary)] rounded-full mx-auto mb-6"></div>
          <p className="text-gray-500">Laster...</p>
        </div>
      </div>
    }>
      <OrderConfirmationContent />
    </Suspense>
  );
}
