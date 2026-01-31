'use client';

import { useState, useEffect } from 'react';

interface TimeSlot {
  start: string;
  end: string;
}

export default function KonsultasjonPage() {
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [offset, setOffset] = useState(0);
  const [loading, setLoading] = useState(true);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  const loadSlots = async (newOffset: number = 0) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/availability?offset=${newOffset}&count=3`);
      const data = await res.json();
      setSlots(data.slots || []);
      setOffset(newOffset);
    } catch (err) {
      console.error('Failed to load slots:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSlots(0);
  }, []);

  const formatSlot = (slot: TimeSlot) => {
    const start = new Date(slot.start);
    const end = new Date(slot.end);
    const dateStr = start.toLocaleDateString('nb-NO', {
      weekday: 'long',
      day: 'numeric',
      month: 'long'
    });
    const startTime = start.toLocaleTimeString('nb-NO', { hour: '2-digit', minute: '2-digit' });
    const endTime = end.toLocaleTimeString('nb-NO', { hour: '2-digit', minute: '2-digit' });
    return { dateStr, startTime, endTime, date: start.toISOString() };
  };

  const handleBooking = async (slot: TimeSlot) => {
    setSelectedSlot(slot);
    setIsAddingToCart(true);

    try {
      // Store selected time in session/localStorage for checkout
      const { dateStr, startTime } = formatSlot(slot);
      localStorage.setItem('consultationBooking', JSON.stringify({
        slot: slot,
        displayDate: dateStr,
        displayTime: startTime
      }));

      // Add consultation product to cart
      const res = await fetch('/api/cart/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ 
          productId: 10, // Personlig hjelp (60 min) - konsultasjon
          quantity: 1,
          metadata: {
            bookingDate: slot.start,
            bookingTime: startTime
          }
        })
      });

      if (res.ok) {
        // Trigger cart update
        window.dispatchEvent(new Event('cartUpdated'));
        // Redirect to checkout
        window.location.href = '/checkout';
      } else {
        alert('Kunne ikke legge til i handlekurv. Prøv igjen.');
        setIsAddingToCart(false);
      }
    } catch (err) {
      console.error('Booking error:', err);
      alert('Noe gikk galt. Prøv igjen.');
      setIsAddingToCart(false);
    }
  };

  return (
    <>
      <div className="page-hero">
        <h1 className="flex items-center justify-center gap-2">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
          1-til-1 Konsultasjon
        </h1>
        <p>Personlig veiledning fra våre eksperter</p>
      </div>

      <div className="max-w-4xl mx-auto px-8 py-12">
        {/* Info Section */}
        <div className="bg-white rounded-xl shadow-sm p-8 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            <div>
              <span className="text-3xl mb-2 block">⏱️</span>
              <h3 className="font-bold text-gray-800">60 min videomøte</h3>
              <p className="text-gray-500 text-sm">Via Google Meet</p>
            </div>
            <div>
              <span className="text-3xl mb-2 block">🎯</span>
              <h3 className="font-bold text-gray-800">Skreddersydd</h3>
              <p className="text-gray-500 text-sm">Tilpasset dine behov</p>
            </div>
            <div>
              <span className="text-3xl mb-2 block">💰</span>
              <h3 className="font-bold text-gray-800">1490 kr</h3>
              <p className="text-gray-500 text-sm">Inkl. mva</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Velg et tidspunkt</h2>
          <p className="text-gray-500 mb-6">Du blir sendt til betaling etter valg av tid</p>
          
          {loading ? (
            <div className="text-center py-12 text-gray-500">
              <div className="animate-spin w-8 h-8 border-4 border-[#8DC99C] border-t-transparent rounded-full mx-auto mb-4"></div>
              Laster ledige tider...
            </div>
          ) : slots.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <p className="mb-4">Ingen ledige tider funnet akkurat nå.</p>
              <p>Kontakt oss på <a href="mailto:post@kryptohjelpen.no" className="text-[#8DC99C] hover:underline">post@kryptohjelpen.no</a></p>
            </div>
          ) : (
            <>
              <div className="space-y-3 mb-6">
                {slots.map((slot, i) => {
                  const { dateStr, startTime, endTime } = formatSlot(slot);
                  const isSelected = selectedSlot === slot;
                  return (
                    <button
                      key={i}
                      onClick={() => handleBooking(slot)}
                      disabled={isAddingToCart}
                      className={`w-full p-4 rounded-xl border-2 transition-all text-left flex justify-between items-center ${
                        isSelected && isAddingToCart
                          ? 'border-[#8DC99C] bg-[#8DC99C]/10'
                          : 'border-gray-200 hover:border-[#8DC99C] hover:bg-[#8DC99C]/5'
                      } ${isAddingToCart ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      <div>
                        <div className="font-bold text-gray-800 capitalize">{dateStr}</div>
                        <div className="text-gray-500">kl. {startTime} - {endTime}</div>
                      </div>
                      {isSelected && isAddingToCart ? (
                        <span className="text-[#8DC99C]">
                          <div className="animate-spin w-5 h-5 border-2 border-[#8DC99C] border-t-transparent rounded-full"></div>
                        </span>
                      ) : (
                        <span className="text-[#8DC99C] font-bold">Book →</span>
                      )}
                    </button>
                  );
                })}
              </div>
              
              <button
                onClick={() => loadSlots(offset + 3)}
                disabled={isAddingToCart}
                className="w-full py-3 text-[#8DC99C] hover:bg-[#8DC99C]/10 rounded-lg transition-colors font-medium disabled:opacity-50"
              >
                📅 Vis flere tider
              </button>
            </>
          )}
        </div>

        {/* Payment info */}
        <div className="mt-8 text-center text-gray-500 text-sm">
          <p>Sikker betaling med Vipps • Du logger inn med Vipps i kassen</p>
        </div>
      </div>
    </>
  );
}
