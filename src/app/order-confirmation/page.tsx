'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

function OrderConfirmationContent() {
  const searchParams = useSearchParams();
  const orderNumber = searchParams.get('order') || searchParams.get('orderId') || 'UNKNOWN';

  return (
    <div className="max-w-2xl mx-auto px-8 py-16 text-center">
      <div className="bg-white rounded-xl shadow-sm p-12">
        <span className="text-6xl mb-6 block text-[var(--primary)] flex justify-center"><svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg></span>
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
        <div className="loading-spinner"></div>
        <p className="text-gray-500">Laster...</p>
      </div>
    }>
      <OrderConfirmationContent />
    </Suspense>
  );
}
