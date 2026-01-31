'use client';

import { useState } from 'react';

interface TimeSlot {
  date: string;
  time: string;
  available: boolean;
}

export default function KonsultasjonPage() {
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    topic: '',
    message: ''
  });
  const [step, setStep] = useState(1);
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  // Generate available dates (next 14 days, excluding weekends)
  const getAvailableDates = () => {
    const dates: string[] = [];
    const today = new Date();
    
    for (let i = 1; i <= 21 && dates.length < 10; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      const day = date.getDay();
      if (day !== 0 && day !== 6) {
        dates.push(date.toISOString().split('T')[0]);
      }
    }
    return dates;
  };

  const availableTimes = [
    '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00'
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');

    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          date: selectedDate,
          time: selectedTime
        })
      });

      if (res.ok) {
        setStatus('success');
      } else {
        setStatus('error');
      }
    } catch {
      setStatus('error');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('nb-NO', {
      weekday: 'long',
      day: 'numeric',
      month: 'long'
    });
  };

  if (status === 'success') {
    return (
      <>
        <div className="page-hero">
          <h1 class="flex items-center gap-2"><svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>1-til-1 Konsultasjon</h1>
          <p>Personlig veiledning fra våre eksperter</p>
        </div>

        <div className="max-w-2xl mx-auto px-8 py-16 text-center">
          <div className="bg-white rounded-xl shadow-sm p-12">
            <span className="text-6xl mb-6 block text-[var(--primary)] flex justify-center"><svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg></span>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Booking bekreftet!</h2>
            <p className="text-gray-500 mb-2">
              Du har booket en konsultasjon den <strong>{formatDate(selectedDate)}</strong> kl. <strong>{selectedTime}</strong>
            </p>
            <p className="text-gray-500 mb-6">
              Du vil motta en bekreftelse på e-post med detaljer og lenke til videomøtet.
            </p>
            <a href="/" className="btn-primary inline-block">
              Tilbake til forsiden
            </a>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="page-hero">
        <h1 class="flex items-center gap-2"><svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>1-til-1 Konsultasjon</h1>
        <p>Personlig veiledning fra våre eksperter</p>
      </div>

      <div className="max-w-4xl mx-auto px-8 py-12">
        {/* Info Section */}
        <div className="bg-white rounded-xl shadow-sm p-8 mb-12">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Hva inkluderer konsultasjonen?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex gap-4">
              <span className="text-2xl">⏱️</span>
              <div>
                <h3 className="font-bold text-gray-800">30 min videomøte</h3>
                <p className="text-gray-500 text-sm">Personlig samtale via Google Meet eller Zoom</p>
              </div>
            </div>
            <div className="flex gap-4">
              <span className="text-2xl text-[var(--primary)]"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><circle cx="12" cy="12" r="6"></circle><circle cx="12" cy="12" r="2"></circle></svg></span>
              <div>
                <h3 className="font-bold text-gray-800">Skreddersydd råd</h3>
                <p className="text-gray-500 text-sm">Veiledning tilpasset dine behov</p>
              </div>
            </div>
            <div className="flex gap-4">
              <span className="text-2xl text-[var(--primary)]"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg></span>
              <div>
                <h3 className="font-bold text-gray-800">Oppfølging</h3>
                <p className="text-gray-500 text-sm">Skriftlig oppsummering etter møtet</p>
              </div>
            </div>
          </div>
        </div>

        {/* Booking Form */}
        <div className="bg-white rounded-xl shadow-sm p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Book din konsultasjon</h2>

          {/* Step Indicator */}
          <div className="flex items-center justify-center gap-4 mb-8">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${step >= 1 ? 'bg-[#8DC99C] text-white' : 'bg-gray-200 text-gray-500'}`}>1</div>
            <div className={`w-16 h-1 ${step >= 2 ? 'bg-[#8DC99C]' : 'bg-gray-200'}`}></div>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${step >= 2 ? 'bg-[#8DC99C] text-white' : 'bg-gray-200 text-gray-500'}`}>2</div>
            <div className={`w-16 h-1 ${step >= 3 ? 'bg-[#8DC99C]' : 'bg-gray-200'}`}></div>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${step >= 3 ? 'bg-[#8DC99C] text-white' : 'bg-gray-200 text-gray-500'}`}>3</div>
          </div>

          {/* Step 1: Choose Date */}
          {step === 1 && (
            <div>
              <h3 className="text-lg font-bold text-gray-800 mb-4">Velg dato</h3>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                {getAvailableDates().map((date) => (
                  <button
                    key={date}
                    onClick={() => {
                      setSelectedDate(date);
                      setStep(2);
                    }}
                    className={`p-4 rounded-lg border-2 text-center transition-all ${
                      selectedDate === date
                        ? 'border-[#8DC99C] bg-[#8DC99C]/10'
                        : 'border-gray-200 hover:border-[#8DC99C]'
                    }`}
                  >
                    <div className="font-bold text-gray-800">
                      {new Date(date).toLocaleDateString('nb-NO', { weekday: 'short' })}
                    </div>
                    <div className="text-2xl font-bold text-gray-800">
                      {new Date(date).getDate()}
                    </div>
                    <div className="text-sm text-gray-500">
                      {new Date(date).toLocaleDateString('nb-NO', { month: 'short' })}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: Choose Time */}
          {step === 2 && (
            <div>
              <h3 className="text-lg font-bold text-gray-800 mb-4">
                Velg tidspunkt - {formatDate(selectedDate)}
              </h3>
              <div className="grid grid-cols-4 gap-3 mb-6">
                {availableTimes.map((time) => (
                  <button
                    key={time}
                    onClick={() => {
                      setSelectedTime(time);
                      setStep(3);
                    }}
                    className={`p-4 rounded-lg border-2 text-center transition-all ${
                      selectedTime === time
                        ? 'border-[#8DC99C] bg-[#8DC99C]/10'
                        : 'border-gray-200 hover:border-[#8DC99C]'
                    }`}
                  >
                    <span className="font-bold text-gray-800">{time}</span>
                  </button>
                ))}
              </div>
              <button
                onClick={() => setStep(1)}
                className="text-[#8DC99C] hover:underline"
              >
                ← Velg annen dato
              </button>
            </div>
          )}

          {/* Step 3: Contact Info */}
          {step === 3 && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <h3 className="text-lg font-bold text-gray-800 mb-4">
                Fyll inn dine opplysninger
              </h3>
              <p className="text-gray-500 mb-6">
                {formatDate(selectedDate)} kl. {selectedTime}
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block font-medium text-gray-700 mb-2">Navn *</label>
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
              </div>

              <div>
                <label className="block font-medium text-gray-700 mb-2">Telefon</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>

              <div>
                <label className="block font-medium text-gray-700 mb-2">Tema *</label>
                <select
                  required
                  value={formData.topic}
                  onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                >
                  <option value="">Velg tema</option>
                  <option value="wallet">Wallet & sikkerhet</option>
                  <option value="defi">DeFi</option>
                  <option value="nft">NFT</option>
                  <option value="bitcoin">Bitcoin</option>
                  <option value="ethereum">Ethereum</option>
                  <option value="annet">Annet</option>
                </select>
              </div>

              <div>
                <label className="block font-medium text-gray-700 mb-2">Beskrivelse</label>
                <textarea
                  rows={4}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Beskriv kort hva du ønsker hjelp med..."
                />
              </div>

              {status === 'error' && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
                  Noe gikk galt. Prøv igjen.
                </div>
              )}

              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="px-6 py-3 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50"
                >
                  ← Tilbake
                </button>
                <button
                  type="submit"
                  disabled={status === 'loading'}
                  className="btn-primary flex-1"
                >
                  {status === 'loading' ? 'Booker...' : 'Bekreft booking'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </>
  );
}
