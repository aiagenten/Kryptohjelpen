'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { LayoutDashboard, Package, ShoppingCart, FileText, Globe, LogOut, Star } from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<{ username: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Skip auth check on login page
    if (pathname === '/admin/login') {
      setLoading(false);
      return;
    }

    // Check authentication
    fetch('/api/admin/check')
      .then(res => res.json())
      .then(data => {
        if (data.authenticated) {
          setUser(data.user);
        } else {
          router.push('/admin/login');
        }
        setLoading(false);
      })
      .catch(() => {
        router.push('/admin/login');
        setLoading(false);
      });
  }, [pathname, router]);

  const handleLogout = async () => {
    await fetch('/api/admin/logout', { method: 'POST' });
    router.push('/admin/login');
  };

  // Don't show sidebar on login page
  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#8DC99C] border-t-transparent"></div>
      </div>
    );
  }

  const navItems = [
    { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/admin/orders', label: 'Ordrer', icon: ShoppingCart },
    { href: '/admin/products', label: 'Tjenester', icon: Package },
    { href: '/admin/articles', label: 'Artikler', icon: FileText },
    { href: '/admin/reviews', label: 'Anmeldelser', icon: Star },
  ];

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-900 text-white fixed h-full">
        <div className="p-6 border-b border-gray-700">
          <Link href="/admin" className="flex items-center gap-3">
            <span className="text-3xl text-[#8DC99C]">₿</span>
            <span className="text-lg font-bold">Kryptohjelpen</span>
          </Link>
        </div>

        <nav className="p-4">
          <div className="text-xs uppercase text-gray-500 mb-4">Meny</div>
          {navItems.map(item => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg mb-1 transition-colors ${
                  pathname === item.href
                    ? 'bg-[#8DC99C]/20 text-[#8DC99C] border-r-2 border-[#8DC99C]'
                    : 'text-gray-300 hover:bg-gray-800'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{item.label}</span>
              </Link>
            );
          })}

          <div className="text-xs uppercase text-gray-500 mt-8 mb-4">System</div>
          <Link
            href="/"
            target="_blank"
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-300 hover:bg-gray-800"
          >
            <Globe className="w-5 h-5" />
            <span>Se nettside</span>
          </Link>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-300 hover:bg-gray-800"
          >
            <LogOut className="w-5 h-5" />
            <span>Logg ut</span>
          </button>
        </nav>
      </aside>

      {/* Main content */}
      <main className="flex-1 ml-64">
        <header className="bg-white shadow-sm h-16 flex items-center justify-between px-8 sticky top-0 z-10">
          <h1 className="text-xl font-semibold text-gray-800">
            {navItems.find(i => i.href === pathname)?.label || 'Admin'}
          </h1>
          {user && (
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-[#8DC99C] rounded-full flex items-center justify-center text-white font-bold">
                {user.username.charAt(0).toUpperCase()}
              </div>
              <span className="text-gray-600">{user.username}</span>
            </div>
          )}
        </header>

        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
