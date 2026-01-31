'use client';

import { useState } from 'react';

// SVG Icons
const MailboxIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
    <polyline points="22,6 12,13 2,6"></polyline>
  </svg>
);

const EmailIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
    <polyline points="22,6 12,13 2,6"></polyline>
  </svg>
);

const ChatIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
  </svg>
);

const PhoneIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2">
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
  </svg>
);

const ClockIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2">
    <circle cx="12" cy="12" r="10"></circle>
    <polyline points="12 6 12 12 16 14"></polyline>
  </svg>
);

const SendIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2">
    <line x1="22" y1="2" x2="11" y2="13"></line>
    <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
  </svg>
);

const CheckCircleIcon = () => (
  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
    <polyline points="22 4 12 14.01 9 11.01"></polyline>
  </svg>
);

export default function Kontakt() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (res.ok) {
        setStatus('success');
        setFormData({ name: '', email: '', subject: '', message: '' });
      } else {
        setStatus('error');
      }
    } catch {
      setStatus('error');
    }
  };

  return (
    <>
      {/* Hero */}
      <div className="page-hero">
        <h1>Kontakt oss</h1>
        <p>Vi er her for å hjelpe deg med krypto og Web3</p>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Contact Info */}
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              <MailboxIcon /> Kontaktinformasjon
            </h2>
            
            <div className="space-y-6">
              <div className="flex gap-4">
                <span className="text-[var(--primary)]"><EmailIcon /></span>
                <div>
                  <h3 className="font-bold text-gray-800">E-post</h3>
                  <a href="mailto:support@kryptohjelpen.no" className="text-[#8DC99C] hover:underline">
                    support@kryptohjelpen.no
                  </a>
                </div>
              </div>

              <div className="flex gap-4">
                <span className="text-[var(--primary)]"><ChatIcon /></span>
                <div>
                  <h3 className="font-bold text-gray-800">Chatbot</h3>
                  <p className="text-gray-600">Tilgjengelig 24/7 på alle sider</p>
                </div>
              </div>

              <div className="flex gap-4">
                <span className="text-[var(--primary)]"><PhoneIcon /></span>
                <div>
                  <h3 className="font-bold text-gray-800">1-til-1 Konsultasjon</h3>
                  <a href="/konsultasjon" className="text-[#8DC99C] hover:underline">
                    Book en samtale →
                  </a>
                </div>
              </div>
            </div>

            <div className="mt-8 p-6 bg-gray-50 rounded-xl">
              <h3 className="font-bold text-gray-800 mb-2 flex items-center gap-2">
                <ClockIcon /> Åpningstider
              </h3>
              <p className="text-gray-600">
                Chatbot: 24/7<br />
                E-post svar: Innen 24 timer<br />
                Konsultasjoner: Man-Fre 09:00-17:00
              </p>
            </div>
          </div>

          {/* Contact Form */}
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              <SendIcon /> Send oss en melding
            </h2>
            
            {status === 'success' ? (
              <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-center">
                <span className="block mb-4 flex justify-center"><CheckCircleIcon /></span>
                <h3 className="text-xl font-bold text-green-800 mb-2">Melding sendt!</h3>
                <p className="text-green-700">Vi svarer deg så snart som mulig.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block font-medium text-gray-700 mb-2">Navn *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Ditt navn"
                  />
                </div>

                <div>
                  <label className="block font-medium text-gray-700 mb-2">E-post *</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="din@epost.no"
                  />
                </div>

                <div>
                  <label className="block font-medium text-gray-700 mb-2">Emne</label>
                  <select
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  >
                    <option value="">Velg emne</option>
                    <option value="generell">Generell henvendelse</option>
                    <option value="teknisk">Teknisk spørsmål</option>
                    <option value="kurs">Bedriftskurs</option>
                    <option value="samarbeid">Samarbeid</option>
                    <option value="annet">Annet</option>
                  </select>
                </div>

                <div>
                  <label className="block font-medium text-gray-700 mb-2">Melding *</label>
                  <textarea
                    required
                    rows={5}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Skriv din melding her..."
                  />
                </div>

                {status === 'error' && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
                    Noe gikk galt. Vennligst prøv igjen.
                  </div>
                )}

                <button
                  type="submit"
                  disabled={status === 'loading'}
                  className="btn-primary w-full"
                >
                  {status === 'loading' ? 'Sender...' : 'Send melding'}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
