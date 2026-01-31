'use client';

import { useEffect, useState } from 'react';

interface Order {
  id: number;
  order_number: string;
  customer_name: string;
  customer_email: string;
  total_nok: number;
  payment_method: string;
  payment_status: string;
  order_status: string;
  created_at: string;
}

export default function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<any>(null);

  const loadOrders = () => {
    fetch('/api/admin/orders')
      .then(r => r.json())
      .then(data => {
        setOrders(data);
        setLoading(false);
      });
  };

  useEffect(() => { loadOrders(); }, []);

  const formatNOK = (amount: number) =>
    new Intl.NumberFormat('nb-NO', { style: 'currency', currency: 'NOK', minimumFractionDigits: 0 }).format(amount);

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString('nb-NO', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });

  const getPaymentBadge = (status: string) => {
    const styles: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-800',
      completed: 'bg-green-100 text-green-800',
      failed: 'bg-red-100 text-red-800',
      refunded: 'bg-gray-100 text-gray-600'
    };
    const labels: Record<string, string> = {
      pending: 'Venter',
      completed: 'Betalt',
      failed: 'Feilet',
      refunded: 'Refundert'
    };
    return <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status] || 'bg-gray-100'}`}>{labels[status] || status}</span>;
  };

  const getOrderBadge = (status: string) => {
    const styles: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-800',
      processing: 'bg-blue-100 text-blue-800',
      shipped: 'bg-purple-100 text-purple-800',
      delivered: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800'
    };
    const labels: Record<string, string> = {
      pending: 'Venter',
      processing: 'Behandles',
      shipped: 'Sendt',
      delivered: 'Levert',
      cancelled: 'Kansellert'
    };
    return <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status] || 'bg-gray-100'}`}>{labels[status] || status}</span>;
  };

  const getPaymentIcon = (method: string) => {
    const icons: Record<string, string> = { vipps: '📱', crypto: '₿', eth: '⟠', btc: '₿' };
    return icons[method] || '💳';
  };

  const viewOrder = async (id: number) => {
    const res = await fetch(`/api/admin/orders/${id}`);
    const data = await res.json();
    setSelectedOrder(data);
  };

  const updateStatus = async (id: number, currentStatus: string) => {
    const statuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
    const labels = ['Venter', 'Behandles', 'Sendt', 'Levert', 'Kansellert'];
    const currentIndex = statuses.indexOf(currentStatus);
    
    const choice = prompt(
      `Velg ny status:\n\n${statuses.map((s, i) => `${i + 1}. ${labels[i]}${s === currentStatus ? ' (nå)' : ''}`).join('\n')}\n\nSkriv nummer (1-5):`
    );
    
    if (!choice) return;
    const index = parseInt(choice) - 1;
    if (index < 0 || index >= statuses.length) return;

    await fetch(`/api/admin/orders/${id}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderStatus: statuses[index] })
    });
    loadOrders();
  };

  const filtered = orders.filter(o => {
    const matchesSearch = o.order_number.toLowerCase().includes(search.toLowerCase()) ||
                          o.customer_name.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = !statusFilter || o.order_status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#8DC99C] border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div>
      {/* Toolbar */}
      <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
        <input
          type="text"
          placeholder="🔍 Søk ordre/kunde..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="px-4 py-2 border rounded-lg w-72 focus:outline-none focus:border-[#8DC99C]"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 border rounded-lg focus:outline-none focus:border-[#8DC99C]"
        >
          <option value="">Alle statuser</option>
          <option value="pending">Venter</option>
          <option value="processing">Behandles</option>
          <option value="shipped">Sendt</option>
          <option value="delivered">Levert</option>
          <option value="cancelled">Kansellert</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr className="text-left text-xs text-gray-500 uppercase">
              <th className="p-4">Ordre</th>
              <th className="p-4">Kunde</th>
              <th className="p-4">Beløp</th>
              <th className="p-4">Betaling</th>
              <th className="p-4">Status</th>
              <th className="p-4">Dato</th>
              <th className="p-4 w-24">Handlinger</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {filtered.length ? filtered.map(o => (
              <tr key={o.id} className="hover:bg-gray-50">
                <td className="p-4 font-medium">{o.order_number}</td>
                <td className="p-4">
                  <div>{o.customer_name}</div>
                  <div className="text-sm text-gray-500">{o.customer_email}</div>
                </td>
                <td className="p-4">{formatNOK(o.total_nok)}</td>
                <td className="p-4">
                  <span className="mr-1">{getPaymentIcon(o.payment_method)}</span>
                  {getPaymentBadge(o.payment_status)}
                </td>
                <td className="p-4">{getOrderBadge(o.order_status)}</td>
                <td className="p-4 text-gray-500 text-sm">{formatDate(o.created_at)}</td>
                <td className="p-4">
                  <button onClick={() => viewOrder(o.id)} className="p-2 hover:bg-gray-100 rounded">👁️</button>
                  <button onClick={() => updateStatus(o.id, o.order_status)} className="p-2 hover:bg-gray-100 rounded">✏️</button>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan={7} className="p-8 text-center text-gray-500">
                  Ingen ordrer funnet
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b flex justify-between items-center">
              <h2 className="text-xl font-semibold">Ordre {selectedOrder.order?.order_number}</h2>
              <button onClick={() => setSelectedOrder(null)} className="text-2xl text-gray-400 hover:text-gray-600">&times;</button>
            </div>
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h3 className="font-medium mb-2">Kundeinformasjon</h3>
                  <p><strong>Navn:</strong> {selectedOrder.order?.customer_name}</p>
                  <p><strong>E-post:</strong> {selectedOrder.order?.customer_email}</p>
                  <p><strong>Telefon:</strong> {selectedOrder.order?.customer_phone || '-'}</p>
                </div>
                <div>
                  <h3 className="font-medium mb-2">Leveringsadresse</h3>
                  <p>{selectedOrder.order?.shipping_address || '-'}</p>
                  <p>{selectedOrder.order?.shipping_zip} {selectedOrder.order?.shipping_city}</p>
                </div>
              </div>

              <div>
                <h3 className="font-medium mb-2">Ordrelinjer</h3>
                <table className="w-full">
                  <thead>
                    <tr className="text-left text-sm text-gray-500 border-b">
                      <th className="pb-2">Produkt</th>
                      <th className="pb-2">Antall</th>
                      <th className="pb-2">Pris</th>
                      <th className="pb-2">Sum</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedOrder.items?.map((item: any) => (
                      <tr key={item.id} className="border-b">
                        <td className="py-2">{item.product_name}</td>
                        <td className="py-2">{item.quantity}</td>
                        <td className="py-2">{formatNOK(item.price_nok)}</td>
                        <td className="py-2">{formatNOK(item.quantity * item.price_nok)}</td>
                      </tr>
                    ))}
                    <tr className="font-bold">
                      <td colSpan={3} className="py-2 text-right">Total:</td>
                      <td className="py-2">{formatNOK(selectedOrder.order?.total_nok)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h3 className="font-medium mb-2">Betalingsstatus</h3>
                  <p><strong>Metode:</strong> {getPaymentIcon(selectedOrder.order?.payment_method)} {selectedOrder.order?.payment_method}</p>
                  <p><strong>Status:</strong> {getPaymentBadge(selectedOrder.order?.payment_status)}</p>
                </div>
                <div>
                  <h3 className="font-medium mb-2">Ordrestatus</h3>
                  <p>{getOrderBadge(selectedOrder.order?.order_status)}</p>
                  <p className="text-sm text-gray-500 mt-1">Opprettet: {formatDate(selectedOrder.order?.created_at)}</p>
                </div>
              </div>
            </div>
            <div className="p-6 border-t">
              <button onClick={() => setSelectedOrder(null)} className="px-6 py-2 border rounded-lg hover:bg-gray-50">
                Lukk
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
