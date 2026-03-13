'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { GraduationCap, PartyPopper, ArrowRight, BookOpen, Shield, TrendingUp, Download, Award } from 'lucide-react';
import { useRef } from 'react';

interface Certificate {
  id: number;
  certificate_id: string;
  issued_at: string;
  customerName: string;
}

export default function KursFullfortPage() {
  const [user, setUser] = useState<{ name: string } | null>(null);
  const [certificate, setCertificate] = useState<Certificate | null>(null);
  const [issuing, setIssuing] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const certRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Check auth and existing certificate
    Promise.all([
      fetch('/api/auth/me', { credentials: 'include' }).then(r => r.json()),
      fetch('/api/course/certificate', { credentials: 'include' }).then(r => r.json()),
    ]).then(([authData, certData]) => {
      if (authData.authenticated) setUser(authData.customer);
      if (certData.certificate) setCertificate(certData.certificate);
    }).catch(() => {});
  }, []);

  const issueCertificate = async () => {
    setIssuing(true);
    try {
      const res = await fetch('/api/course/certificate', {
        method: 'POST',
        credentials: 'include',
      });
      const data = await res.json();
      if (data.certificate) {
        setCertificate(data.certificate);
      }
    } catch (err) {
      console.error('Certificate error:', err);
    } finally {
      setIssuing(false);
    }
  };

  const downloadPDF = async () => {
    if (!certificate || !certRef.current) return;
    setDownloading(true);
    try {
      const html2canvas = (await import('html2canvas')).default;
      const { jsPDF } = await import('jspdf');

      const canvas = await html2canvas(certRef.current, {
        scale: 2,
        backgroundColor: '#ffffff',
        useCORS: true,
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('landscape', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();

      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
      const x = (pdfWidth - imgWidth * ratio) / 2;
      const y = (pdfHeight - imgHeight * ratio) / 2;

      pdf.addImage(imgData, 'PNG', x, y, imgWidth * ratio, imgHeight * ratio);
      pdf.save(`Kursbevis-${certificate.certificate_id}.pdf`);
    } catch (err) {
      console.error('PDF download error:', err);
    } finally {
      setDownloading(false);
    }
  };

  const firstName = user?.name?.split(' ')[0] || '';
  const fullName = certificate?.customerName || user?.name || 'Kursbruker';

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <div className="page-hero">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center gap-3 mb-4">
            <PartyPopper className="w-10 h-10 text-white/90" />
            <GraduationCap className="w-12 h-12 text-white" />
            <PartyPopper className="w-10 h-10 text-white/90 scale-x-[-1]" />
          </div>
          <h1>Gratulerer{firstName ? `, ${firstName}` : ''}!</h1>
          <p>Du har fullført Kryptohjelpens kryptokurs. Du har nå bedre kunnskap om krypto enn de fleste nordmenn!</p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-8 py-12">

        {/* Certificate */}
        <div className="mb-8">
          {certificate ? (
            <div className="bg-white rounded-2xl shadow-sm border-2 border-[#8DC99C] overflow-hidden">
              {/* Certificate visual */}
              <div ref={certRef} className="bg-gradient-to-br from-[#f8fdf9] to-[#edf7ef] p-8 sm:p-12 text-center relative">
                {/* Decorative corners */}
                <div className="absolute top-4 left-4 w-10 h-10 border-t-2 border-l-2 border-[#8DC99C]/40 rounded-tl-lg" />
                <div className="absolute top-4 right-4 w-10 h-10 border-t-2 border-r-2 border-[#8DC99C]/40 rounded-tr-lg" />
                <div className="absolute bottom-4 left-4 w-10 h-10 border-b-2 border-l-2 border-[#8DC99C]/40 rounded-bl-lg" />
                <div className="absolute bottom-4 right-4 w-10 h-10 border-b-2 border-r-2 border-[#8DC99C]/40 rounded-br-lg" />

                {/* Logo */}
                <img
                  src="/images/kryptohjelpen-logo.png"
                  alt="Kryptohjelpen"
                  className="w-[180px] sm:w-[220px] mx-auto mb-6"
                />

                <p className="text-sm font-semibold text-[#5a9a6a] tracking-widest uppercase mb-3">Kursbevis</p>
                <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-1">{fullName}</h2>
                <p className="text-gray-600 mb-6">har fullført</p>
                <h3 className="text-xl font-bold text-[#5a9a6a] mb-6">Kryptohjelpens Kryptokurs</h3>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8 text-sm text-gray-500">
                  <div>
                    <span className="font-semibold text-gray-700">6 kapitler</span> fullført med quiz
                  </div>
                  <div className="hidden sm:block text-gray-300">|</div>
                  <div>
                    Utstedt <span className="font-semibold text-gray-700">
                      {new Date(certificate.issued_at).toLocaleDateString('nb-NO', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      })}
                    </span>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-[#8DC99C]/20">
                  <p className="text-xs text-gray-400">
                    Bevis-ID: {certificate.certificate_id}
                  </p>
                </div>
              </div>

              {/* Download button */}
              <div className="p-4 bg-white border-t border-[#8DC99C]/20 text-center">
                <button
                  onClick={downloadPDF}
                  disabled={downloading}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-[#5a9a6a] hover:bg-[#4a8a5a] text-white rounded-lg font-semibold transition-colors"
                >
                  <Download className="w-4 h-4" />
                  {downloading ? 'Genererer PDF...' : 'Last ned som PDF'}
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl p-8 shadow-sm text-center">
              <Award className="w-12 h-12 text-[#5a9a6a] mx-auto mb-4" />
              <h2 className="text-xl font-bold text-gray-900 mb-2">Hent ditt kursbevis</h2>
              <p className="text-gray-600 mb-6">Du har fullført alle kapitlene! Kursbeviset lagres på din konto.</p>
              <button
                onClick={issueCertificate}
                disabled={issuing}
                className="btn-primary inline-flex items-center gap-2 text-lg"
              >
                <GraduationCap className="w-5 h-5" />
                {issuing ? 'Utsteder...' : 'Hent kursbevis'}
              </button>
            </div>
          )}
        </div>

        {/* Summary */}
        <div className="bg-white rounded-2xl p-8 shadow-sm mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Hva du har lært</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="flex items-start gap-3 p-4 bg-[#8DC99C]/10 rounded-xl">
              <BookOpen className="w-5 h-5 text-[#5a9a6a] mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-gray-900">Grunnleggende krypto</h3>
                <p className="text-sm text-gray-600">Blockchain, Bitcoin, desentralisering</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-4 bg-[#8DC99C]/10 rounded-xl">
              <Shield className="w-5 h-5 text-[#5a9a6a] mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-gray-900">Sikkerhet</h3>
                <p className="text-sm text-gray-600">Lommebøker, seed phrases, 2FA</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-4 bg-[#8DC99C]/10 rounded-xl">
              <TrendingUp className="w-5 h-5 text-[#5a9a6a] mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-gray-900">Kjøp og salg</h3>
                <p className="text-sm text-gray-600">Norske børser, Vipps, DCA-strategi</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-4 bg-[#8DC99C]/10 rounded-xl">
              <GraduationCap className="w-5 h-5 text-[#5a9a6a] mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-gray-900">DeFi & Web3</h3>
                <p className="text-sm text-gray-600">Smart contracts, DEX, staking, NFT</p>
              </div>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="bg-gradient-to-br from-[#8DC99C] to-[#5a9a6a] rounded-2xl p-8 text-center text-white">
          <h2 className="text-2xl font-bold mb-3">Vil du lære mer?</h2>
          <p className="text-white/90 mb-6 max-w-lg mx-auto">
            Book en personlig veiledning med oss. Vi hjelper deg med alt fra skattemeldingen
            til investeringsstrategi – tilpasset akkurat ditt nivå og dine mål.
          </p>
          <Link
            href="/konsultasjon"
            className="inline-flex items-center gap-2 px-8 py-4 bg-white text-[#5a9a6a] rounded-lg font-bold text-lg hover:-translate-y-0.5 hover:shadow-lg transition-all"
          >
            Book en personlig veiledning
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>

        {/* Back to course */}
        <div className="mt-8 text-center">
          <Link
            href="/kurs"
            className="text-gray-500 hover:text-[#5a9a6a] text-sm transition-colors"
          >
            &larr; Tilbake til kursoversikten
          </Link>
        </div>
      </div>
    </div>
  );
}
