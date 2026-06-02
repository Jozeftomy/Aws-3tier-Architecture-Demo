import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useToast } from '../context/ToastContext';
import { ShoppingBag, ChevronDown, ChevronUp, Clock, MapPin, Phone, Package } from 'lucide-react';

const Orders = () => {
  const showToast = useToast();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrderId, setExpandedOrderId] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await api.get('/orders');
        setOrders(response.data);
      } catch (error) {
        console.error('Error fetching orders:', error);
        showToast('Failed to load orders history', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const toggleExpand = (orderId) => {
    setExpandedOrderId(expandedOrderId === orderId ? null : orderId);
  };

  const getStatusStyle = (status) => {
    switch (status.toUpperCase()) {
      case 'PENDING':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'PAID':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'SHIPPED':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case 'DELIVERED':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'CANCELLED':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="min-h-[85vh] flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
  const STATIC_BASE = API_BASE.replace('/api', '');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight mb-8">
        Your Order History
      </h1>

      {orders.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-gray-100 shadow-sm max-w-xl mx-auto">
          <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
            <Package className="w-8 h-8 stroke-[1.2]" />
          </div>
          <h3 className="text-lg font-bold text-gray-900">No orders yet</h3>
          <p className="mt-1 text-sm text-gray-500">
            You haven't placed any orders on this account yet.
          </p>
          <div className="mt-6">
            <a
              href="/"
              className="inline-flex items-center justify-center bg-primary-600 hover:bg-primary-700 text-white font-semibold px-6 py-2.5 rounded-xl shadow-sm hover:shadow-none transition-all text-sm"
            >
              Browse Catalog
            </a>
          </div>
        </div>
      ) : (
        <div className="space-y-6 max-w-4xl mx-auto">
          {orders.map((order) => {
            const isExpanded = expandedOrderId === order.id;
            const formattedDate = new Date(order.created_at).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            });

            return (
              <div
                key={order.id}
                className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-md transition-shadow"
              >
                {/* Header Summary */}
                <div
                  onClick={() => toggleExpand(order.id)}
                  className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer hover:bg-gray-50/50 transition-colors"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-extrabold text-gray-900">
                        Order #{order.id}
                      </span>
                      <span className={`text-xs font-bold border px-2.5 py-1 rounded-full ${getStatusStyle(order.status)}`}>
                        {order.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-gray-400 font-medium">
                      <Clock className="w-3.5 h-3.5" />
                      {formattedDate}
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-6">
                    <div className="text-left sm:text-right">
                      <span className="text-xs text-gray-400 block font-medium">Total Amount</span>
                      <span className="text-base font-extrabold text-primary-600">
                        ${order.total_amount.toFixed(2)}
                      </span>
                    </div>
                    <div className="text-gray-400">
                      {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                    </div>
                  </div>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="px-6 pb-6 border-t border-gray-50 pt-6 space-y-6 bg-gray-50/20">
                    {/* Items Grid */}
                    <div className="space-y-3">
                      <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider">
                        Ordered Items
                      </h4>
                      <div className="bg-white rounded-xl border border-gray-100 divide-y divide-gray-50 overflow-hidden">
                        {order.items.map((item) => (
                          <div key={item.id} className="p-4 flex items-center justify-between gap-4">
                            <div className="min-w-0">
                              <h5 className="text-sm font-bold text-gray-900 truncate">
                                {item.product?.name || 'Deleted Product'}
                              </h5>
                              <span className="text-xs text-gray-500 font-medium">
                                Qty: {item.quantity} &times; ${item.price.toFixed(2)}
                              </span>
                            </div>
                            <span className="text-sm font-extrabold text-gray-900 shrink-0">
                              ${(item.price * item.quantity).toFixed(2)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Delivery & Contact Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-100">
                      <div className="space-y-1">
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block">
                          Delivery Address
                        </span>
                        <div className="flex items-start gap-2 text-sm text-gray-600 font-medium">
                          <MapPin className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
                          <span>{order.shipping_address}</span>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block">
                          Contact Phone
                        </span>
                        <div className="flex items-center gap-2 text-sm text-gray-600 font-medium">
                          <Phone className="w-4 h-4 text-gray-400 shrink-0" />
                          <span>{order.phone}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Orders;
