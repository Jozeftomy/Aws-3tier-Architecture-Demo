import React, { useState } from 'react';
import { useNavigate, Navigate, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import api from '../services/api';
import { Truck, Phone, MapPin, CreditCard, ArrowLeft, CheckCircle } from 'lucide-react';

const Checkout = () => {
  const { cartItems, totalAmount, fetchCart } = useCart();
  const showToast = useToast();
  const navigate = useNavigate();

  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);

  // If cart is empty, redirect to home page
  if (cartItems.length === 0 && !loading) {
    return <Navigate to="/" replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!address || !phone) {
      showToast('Please fill in shipping address and phone number', 'error');
      return;
    }

    setLoading(true);
    try {
      await api.post('/orders', {
        shipping_address: address,
        phone: phone
      });
      showToast('Order placed successfully!', 'success');
      await fetchCart(); // Sync empty cart
      navigate('/orders');
    } catch (err) {
      const errMsg = err.response?.data?.detail || 'Failed to place order';
      showToast(errMsg, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Link
        to="/cart"
        className="inline-flex items-center gap-2 text-gray-500 hover:text-primary-600 font-medium text-sm transition-colors mb-8"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Cart
      </Link>

      <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight mb-8">
        Complete Checkout
      </h1>

      <div className="lg:grid lg:grid-cols-12 lg:gap-8">
        {/* Left Column: Form */}
        <div className="lg:col-span-7 bg-white rounded-3xl border border-gray-100 p-6 sm:p-8 shadow-sm">
          <h2 className="text-lg font-bold text-gray-900 border-b border-gray-50 pb-4 mb-6">
            Shipping Information
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">
                Delivery Address
              </label>
              <div className="relative">
                <div className="absolute top-3 left-3 pointer-events-none">
                  <MapPin className="h-5 w-5 text-gray-400" />
                </div>
                <textarea
                  id="address"
                  required
                  rows="3"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="pl-10 block w-full border border-gray-300 rounded-xl px-3 py-2.5 bg-gray-50 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm"
                  placeholder="Street address, City, ZIP code"
                />
              </div>
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Phone className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="phone"
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="pl-10 block w-full border border-gray-300 rounded-xl px-3 py-2.5 bg-gray-50 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm"
                  placeholder="+1 (555) 000-0000"
                />
              </div>
            </div>

            <div className="bg-primary-50 border border-primary-100 rounded-2xl p-4 flex items-start gap-3 mt-8">
              <CreditCard className="w-5 h-5 text-primary-600 mt-0.5 shrink-0" />
              <div>
                <h4 className="text-sm font-bold text-primary-800">Mock Payment Enabled</h4>
                <p className="text-xs text-primary-600 mt-1 leading-relaxed">
                  We have configured a mock gateway. No real credit card details are needed. Just press the checkout button to mock buy the items.
                </p>
              </div>
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary-600 hover:bg-primary-700 text-white font-bold py-3.5 px-6 rounded-2xl shadow-lg shadow-primary-100 hover:shadow-none transition-all flex items-center justify-center gap-2 text-sm sm:text-base disabled:bg-primary-400"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    <CheckCircle className="w-5 h-5" />
                    Place Order (${totalAmount.toFixed(2)})
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Right Column: Order Summary Preview */}
        <div className="lg:col-span-5 mt-8 lg:mt-0 bg-white rounded-3xl border border-gray-100 p-6 sm:p-8 shadow-sm">
          <h2 className="text-lg font-bold text-gray-900 border-b border-gray-50 pb-4 mb-4">
            Items to Purchase
          </h2>
          <div className="divide-y divide-gray-100 max-h-[300px] overflow-y-auto pr-2">
            {cartItems.map((item) => (
              <div key={item.id} className="py-4 flex justify-between gap-4">
                <div className="min-w-0">
                  <h4 className="text-sm font-bold text-gray-900 truncate">
                    {item.product.name}
                  </h4>
                  <span className="text-xs text-gray-500 font-medium">
                    Qty: {item.quantity} &times; ${item.product.price.toFixed(2)}
                  </span>
                </div>
                <span className="text-sm font-extrabold text-gray-900 shrink-0">
                  ${(item.product.price * item.quantity).toFixed(2)}
                </span>
              </div>
            ))}
          </div>

          <div className="h-px bg-gray-100 my-4" />

          <div className="space-y-3 mt-4">
            <div className="flex items-center justify-between text-sm text-gray-500 font-medium">
              <span>Subtotal</span>
              <span className="text-gray-900">${totalAmount.toFixed(2)}</span>
            </div>
            <div className="flex items-center justify-between text-sm text-gray-500 font-medium">
              <span>Shipping</span>
              <span className="text-emerald-600 font-semibold">FREE</span>
            </div>
            <div className="h-px bg-gray-100 my-2" />
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-gray-900 font-extrabold">Grand Total</span>
              <span className="text-lg font-extrabold text-primary-600">
                ${totalAmount.toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
