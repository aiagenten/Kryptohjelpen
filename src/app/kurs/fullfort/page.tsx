'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { GraduationCap, PartyPopper, ArrowRight, BookOpen, Shield, TrendingUp } from 'lucide-react';

export default function KursFullfortPage() {
  const [user, setUser] = useState<{ name: string } | null>(null);

  useEffect(() => {
    fetch('/api/auth/me', { credentials: 'include' })
      .then(r => r.json())
      .then(data => {
        if (data.authenticated) setUser(data.customer);
      })
      .catch(() => {});
  }, []);

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
          <h1>Gratulerer{user ? `, ${user.name.split(' ')[0]}` : ''}!</h1>
          <p>Du har fullført Kryptohjelpens kryptokurs. Du har nå bedre kunnskap om krypto enn de fleste nordmenn!</p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-8 py-12">
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
