'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Customer {
  id: number;
  name: string;
  email: string;
  phone?: string;
  created_at: string;
}

interface Order {
  id: number;
  order_number: string;
  total_nok: number;
  status: string;
  payment_status: string;
  created_at: string;
}

export default function MinSidePage() {
  const router = useRouter();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const res = await fetch('/api/auth/me');
      const data = await res.json();

      if (!data.authenticated) {
        router.push('/logg-inn');
        return;
      }

      setCustomer(data.customer);
      loadOrders();
    } catch {
      router.push('/logg-inn');
    } finally {
      setLoading(false);
    }
  };

  const loadOrders = async () => {
    try {
      const res = await fetch('/api/customer/orders', { credentials: 'include' });
      const data = await res.json();
      setOrders(data.orders || []);
    } catch (error) {
      console.error('Failed to load orders:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include'
      });
      router.push('/');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { text: string; color: string }> = {
      'pending': { text: 'Venter', color: 'bg-yellow-100 text-yellow-800' },
      'processing': { text: 'Behandles', color: 'bg-blue-100 text-blue-800' },
      'completed': { text: 'Fullført', color: 'bg-green-100 text-green-800' },
      'cancelled': { text: 'Kansellert', color: 'bg-red-100 text-red-800' }
    };
    const s = statusMap[status] || { text: status, color: 'bg-gray-100 text-gray-800' };
    return <span className={`px-2 py-1 rounded-full text-xs font-medium ${s.color}`}>{s.text}</span>;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('nb-NO', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-8 py-16 text-center">
        <div className="loading-spinner"></div>
        <p className="text-gray-500">Laster...</p>
      </div>
    );
  }

  if (!customer) {
    return null;
  }

  return (
    <div className="max-w-4xl mx-auto px-8 py-12">
      {/* Header */}
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Min side</h1>
          <p className="text-gray-500 mt-1">Velkommen tilbake, {customer.name}!</p>
        </div>
        <button
          onClick={handleLogout}
          className="px-4 py-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors"
        >
          Logg ut
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Profile Card */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="text-center mb-6">
            <div className="w-20 h-20 bg-gradient-to-br from-[#8DC99C] to-[#6ab57a] rounded-full flex items-center justify-center text-white text-3xl font-bold mx-auto mb-4">
              {customer.name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()}
            </div>
            <h2 className="text-xl font-bold text-gray-800">{customer.name}</h2>
            <p className="text-gray-500 text-sm">{customer.email}</p>
          </div>

          <div className="space-y-3 text-sm">
            {customer.phone && (
              <div className="flex justify-between">
                <span className="text-gray-500">Telefon:</span>
                <span className="text-gray-800">{customer.phone}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-gray-500">Kunde siden:</span>
              <span className="text-gray-800">{formatDate(customer.created_at)}</span>
            </div>
          </div>
        </div>

        {/* Orders */}
        <div className="md:col-span-2">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Mine bestillinger</h2>

          {orders.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm p-8 text-center">
              <span className="text-4xl mb-4 block">📭</span>
              <p className="text-gray-500 mb-4">Du har ingen bestillinger ennå.</p>
              <Link href="/" className="btn-primary inline-block">
                Utforsk produkter
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <div key={order.id} className="bg-white rounded-xl shadow-sm p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <p className="font-bold text-gray-800">#{order.order_number}</p>
                      <p className="text-sm text-gray-500">{formatDate(order.created_at)}</p>
                    </div>
                    {getStatusBadge(order.status)}
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500">Total:</span>
                    <span className="text-xl font-bold text-gray-800">
                      {order.total_nok.toLocaleString('nb-NO')} kr
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
