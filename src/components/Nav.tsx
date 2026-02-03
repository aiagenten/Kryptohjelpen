'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { ShoppingCart, Menu, X } from 'lucide-react';

export default function Nav() {
  const [cartCount, setCartCount] = useState(0);
  const [user, setUser] = useState<{ name: string } | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const fetchCartCount = () => {
    fetch('/api/cart', { credentials: 'include' })
      .then((res) => res.json())
      .then((data) => setCartCount(data.items?.length || 0))
      .catch(() => setCartCount(0));
  };

  useEffect(() => {
    fetchCartCount();

    // Check auth status
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => {
        if (data.authenticated) {
          setUser(data.customer);
        }
      })
      .catch(() => setUser(null));

    // Listen for cart updates
    const handleCartUpdate = () => fetchCartCount();
    window.addEventListener('cartUpdated', handleCartUpdate);
    return () => window.removeEventListener('cartUpdated', handleCartUpdate);
  }, []);

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex-shrink-0">
            <img
              src="/images/kryptohjelpen-logo.png"
              alt="Kryptohjelpen"
              className="w-[140px] sm:w-[200px]"
            />
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-6">
            <Link href="/" className="text-gray-700 hover:text-[#8DC99C] font-medium transition-colors">
              Tjenester
            </Link>
            <Link href="/artikler" className="text-gray-700 hover:text-[#8DC99C] font-medium transition-colors">
              Artikler
            </Link>
            <Link href="/om-oss" className="text-gray-700 hover:text-[#8DC99C] font-medium transition-colors">
              Om oss
            </Link>
            <Link href="/kontakt" className="text-gray-700 hover:text-[#8DC99C] font-medium transition-colors">
              Kontakt
            </Link>
            <Link href="/cart" className="text-gray-700 hover:text-[#8DC99C] font-medium transition-colors flex items-center gap-1 relative">
              <ShoppingCart className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-[#8DC99C] text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">
                  {cartCount}
                </span>
              )}
            </Link>
            {user ? (
              <Link href="/min-side" className="flex items-center gap-2 text-gray-700 hover:text-[#8DC99C] font-medium">
                <span className="w-7 h-7 bg-gradient-to-br from-[#8DC99C] to-[#6ab57a] rounded-full flex items-center justify-center text-white font-semibold text-xs">
                  {getInitials(user.name)}
                </span>
              </Link>
            ) : (
              <a
                href="/api/auth/vipps"
                className="px-4 py-2 bg-[#ff5b24] hover:bg-[#e54d1c] text-white rounded-lg font-medium transition-colors flex items-center gap-2"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                </svg>
                Logg inn med Vipps
              </a>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center gap-3">
            <Link href="/cart" className="text-gray-700 relative">
              <ShoppingCart className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-[#8DC99C] text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">
                  {cartCount}
                </span>
              )}
            </Link>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-gray-700"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden pb-4 border-t border-gray-100">
            <div className="flex flex-col gap-2 pt-4">
              <Link href="/" onClick={() => setMobileMenuOpen(false)} className="px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-lg">
                Tjenester
              </Link>
              <Link href="/artikler" onClick={() => setMobileMenuOpen(false)} className="px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-lg">
                Artikler
              </Link>
              <Link href="/om-oss" onClick={() => setMobileMenuOpen(false)} className="px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-lg">
                Om oss
              </Link>
              <Link href="/kontakt" onClick={() => setMobileMenuOpen(false)} className="px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-lg">
                Kontakt
              </Link>
              {user ? (
                <Link href="/min-side" onClick={() => setMobileMenuOpen(false)} className="px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-lg flex items-center gap-2">
                  <span className="w-6 h-6 bg-gradient-to-br from-[#8DC99C] to-[#6ab57a] rounded-full flex items-center justify-center text-white font-semibold text-xs">
                    {getInitials(user.name)}
                  </span>
                  Min side
                </Link>
              ) : (
                <a
                  href="/api/auth/vipps"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3 py-3 bg-[#ff5b24] text-white rounded-lg text-center font-medium flex items-center justify-center gap-2"
                >
                  Logg inn med Vipps
                </a>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
