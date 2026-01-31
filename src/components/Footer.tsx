import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white py-12 mt-24">
      <div className="max-w-7xl mx-auto px-8 text-center">
        <p className="text-lg font-semibold mb-2">© 2026 Kryptohjelpen.no</p>
        <p className="opacity-80 mb-6">Kryptohjelpen tilbyr kun teknisk veiledning - ikke investeringsråd</p>
        <nav className="flex flex-wrap justify-center gap-4 md:gap-8">
          <Link href="/om-oss" className="text-white/80 hover:text-white transition-colors">
            Om oss
          </Link>
          <Link href="/artikler" className="text-white/80 hover:text-white transition-colors">
            Artikler
          </Link>
          <Link href="/kontakt" className="text-white/80 hover:text-white transition-colors">
            Kontakt
          </Link>
          <Link href="/personvern" className="text-white/80 hover:text-white transition-colors">
            Personvern
          </Link>
          <Link href="/vilkar" className="text-white/80 hover:text-white transition-colors">
            Vilkår
          </Link>
        </nav>
        <div className="mt-8 pt-6 border-t border-white/10">
          <p className="text-sm text-white/50">
            Levert av{' '}
            <a 
              href="https://aiagenten.no" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-white/70 hover:text-white transition-colors"
            >
              AI Agenten AS
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
