'use client';

import { useEffect, useState } from 'react';
import { DollarSign, CheckCircle, Clock, Package, AlertTriangle } from 'lucide-react';

interface Analytics {
  totalSales: number;
  ordersByStatus: { order_status: string; count: number }[];
  paymentMethods: { payment_method: string; count: number; total: number }[];
  recentOrders: { id: number; order_number: string; customer_name: string; total_nok: number; payment_status: string; created_at: string }[];
  topProducts: { name: string; total_sold: number; revenue: number }[];
  lowStock: { id: number; name: string; stock: number }[];
}

export default function AdminDashboard() {
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [productCount, setProductCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/api/admin/analytics').then(r => r.json()),
      fetch('/api/admin/products').then(r => r.json())
    ]).then(([analyticsData, products]) => {
      setAnalytics(analyticsData);
      setProductCount(products.length || 0);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const formatNOK = (amount: number) => 
    new Intl.NumberFormat('nb-NO', { style: 'currency', currency: 'NOK', minimumFractionDigits: 0 }).format(amount);

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString('nb-NO', { day: 'numeric', month: 'short' });

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-800',
      completed: 'bg-green-100 text-green-800',
      failed: 'bg-red-100 text-red-800',
    };
    const labels: Record<string, string> = {
      pending: 'Venter',
      completed: 'Betalt',
      failed: 'Feilet',
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status] || 'bg-gray-100 text-gray-800'}`}>
        {labels[status] || status}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#8DC99C] border-t-transparent"></div>
      </div>
    );
  }

  const completedOrders = analytics?.ordersByStatus?.find(s => s.order_status === 'delivered')?.count || 0;
  const pendingOrders = analytics?.ordersByStatus?.find(s => s.order_status === 'pending')?.count || 0;

  return (
    <div className="space-y-8">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border-l-4 border-[#8DC99C]">
          <div className="w-12 h-12 bg-[#8DC99C]/10 rounded-lg flex items-center justify-center mb-3">
            <DollarSign className="w-6 h-6 text-[#8DC99C]" />
          </div>
          <div className="text-2xl font-bold text-gray-800">{formatNOK(analytics?.totalSales || 0)}</div>
          <div className="text-gray-500 text-sm">Total omsetning</div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border-l-4 border-green-500">
          <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center mb-3">
            <CheckCircle className="w-6 h-6 text-green-500" />
          </div>
          <div className="text-2xl font-bold text-gray-800">{completedOrders}</div>
          <div className="text-gray-500 text-sm">Fullførte ordrer</div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border-l-4 border-yellow-500">
          <div className="w-12 h-12 bg-yellow-50 rounded-lg flex items-center justify-center mb-3">
            <Clock className="w-6 h-6 text-yellow-500" />
          </div>
          <div className="text-2xl font-bold text-gray-800">{pendingOrders}</div>
          <div className="text-gray-500 text-sm">Ventende ordrer</div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border-l-4 border-blue-500">
          <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center mb-3">
            <Package className="w-6 h-6 text-blue-500" />
          </div>
          <div className="text-2xl font-bold text-gray-800">{productCount}</div>
          <div className="text-gray-500 text-sm">Tjenester</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Orders */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm">
          <div className="p-6 border-b flex justify-between items-center">
            <h2 className="font-semibold text-gray-800">Siste ordrer</h2>
            <a href="/admin/orders" className="text-sm text-[#8DC99C] hover:underline">Se alle →</a>
          </div>
          <div className="p-6">
            {analytics?.recentOrders?.length ? (
              <table className="w-full">
                <thead>
                  <tr className="text-left text-xs text-gray-500 uppercase">
                    <th className="pb-3">Ordre</th>
                    <th className="pb-3">Kunde</th>
                    <th className="pb-3">Beløp</th>
                    <th className="pb-3">Status</th>
                    <th className="pb-3">Dato</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {analytics.recentOrders.slice(0, 5).map(order => (
                    <tr key={order.id} className="hover:bg-gray-50">
                      <td className="py-3 font-medium">{order.order_number}</td>
                      <td className="py-3 text-gray-600">{order.customer_name}</td>
                      <td className="py-3">{formatNOK(order.total_nok)}</td>
                      <td className="py-3">{getStatusBadge(order.payment_status)}</td>
                      <td className="py-3 text-gray-500">{formatDate(order.created_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="text-gray-500 text-center py-8">Ingen ordrer ennå</p>
            )}
          </div>
        </div>

        {/* Low Stock */}
        <div className="bg-white rounded-xl shadow-sm">
          <div className="p-6 border-b flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-yellow-500" />
            <h2 className="font-semibold text-gray-800">Lav lagerbeholdning</h2>
          </div>
          <div className="p-6">
            {analytics?.lowStock?.length ? (
              <div className="space-y-4">
                {analytics.lowStock.map(product => (
                  <div key={product.id} className="flex justify-between items-center">
                    <span className="text-gray-700">{product.name}</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      product.stock === 0 ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {product.stock} stk
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">Alle produkter har god beholdning 👍</p>
            )}
          </div>
        </div>
      </div>

      {/* Payment Methods & Top Products */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm">
          <div className="p-6 border-b">
            <h2 className="font-semibold text-gray-800">Betalingsmetoder</h2>
          </div>
          <div className="p-6">
            {analytics?.paymentMethods?.length ? (
              <div className="space-y-4">
                {analytics.paymentMethods.map(pm => (
                  <div key={pm.payment_method} className="flex justify-between items-center">
                    <span className="text-gray-700">
                      {pm.payment_method === 'vipps' ? '📱 Vipps' : pm.payment_method === 'crypto' ? '₿ Krypto' : pm.payment_method}
                    </span>
                    <span className="text-gray-600">
                      <strong>{pm.count}</strong> ordrer · {formatNOK(pm.total)}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">Ingen betalinger ennå</p>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm">
          <div className="p-6 border-b">
            <h2 className="font-semibold text-gray-800">Topp produkter</h2>
          </div>
          <div className="p-6">
            {analytics?.topProducts?.length ? (
              <div className="space-y-4">
                {analytics.topProducts.slice(0, 5).map((product, i) => (
                  <div key={product.name} className="flex justify-between items-center">
                    <span className="text-gray-700">
                      <strong>#{i + 1}</strong> {product.name}
                    </span>
                    <span className="text-gray-600 text-sm">
                      {product.total_sold} solgt · {formatNOK(product.revenue)}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">Ingen salg ennå</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
