import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import { Trash2, ShoppingBag, ArrowRight, Image as ImageIcon } from 'lucide-react';

const Cart = () => {
  const { cartItems, totalAmount, updateQuantity, removeFromCart, loading } = useCart();
  const showToast = useToast();
  const navigate = useNavigate();

  const handleQuantityChange = async (itemId, currentQty, amount, stockQty) => {
    const newQty = currentQty + amount;
    if (newQty > stockQty) {
      showToast(`Cannot add more. Only ${stockQty} items in stock.`, 'error');
      return;
    }
    try {
      await updateQuantity(itemId, newQty);
    } catch (error) {
      showToast(error.response?.data?.detail || 'Failed to update quantity', 'error');
    }
  };

  const handleRemove = async (itemId) => {
    try {
      await removeFromCart(itemId);
      showToast('Item removed from cart', 'info');
    } catch (error) {
      showToast('Failed to remove item', 'error');
    }
  };

  if (loading && cartItems.length === 0) {
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
        Your Shopping Cart
      </h1>

      {cartItems.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-gray-100 shadow-sm max-w-xl mx-auto">
          <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
            <ShoppingBag className="w-8 h-8 stroke-[1.2]" />
          </div>
          <h3 className="text-lg font-bold text-gray-900">Your cart is empty</h3>
          <p className="mt-1 text-sm text-gray-500">
            Looks like you haven't added anything to your cart yet.
          </p>
          <div className="mt-6">
            <Link
              to="/"
              className="inline-flex items-center justify-center bg-primary-600 hover:bg-primary-700 text-white font-semibold px-6 py-2.5 rounded-xl shadow-sm hover:shadow-none transition-all text-sm"
            >
              Start Shopping
            </Link>
          </div>
        </div>
      ) : (
        <div className="lg:grid lg:grid-cols-12 lg:gap-8 lg:items-start">
          {/* Cart Items List */}
          <div className="lg:col-span-8 space-y-4">
            {cartItems.map((item) => {
              const product = item.product;
              if (!product) return null;

              return (
                <div
                  key={item.id}
                  className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-6 flex items-center gap-4 sm:gap-6 shadow-sm hover:shadow-md transition-shadow"
                >
                  {/* Product Thumbnail */}
                  <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gray-50 rounded-xl overflow-hidden shrink-0 flex items-center justify-center border border-gray-50">
                    {product.image_url ? (
                      <img
                        src={`${STATIC_BASE}${product.image_url}`}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <ImageIcon className="w-8 h-8 text-gray-400" />
                    )}
                  </div>

                  {/* Details */}
                  <div className="flex-grow min-w-0">
                    <h3 className="font-bold text-gray-900 text-sm sm:text-base hover:text-primary-600 transition-colors truncate">
                      <Link to={`/products/${product.id}`}>{product.name}</Link>
                    </h3>
                    <div className="text-xs text-gray-400 mt-1 font-medium">
                      Price: ${product.price.toFixed(2)}
                    </div>
                    
                    {/* Controls */}
                    <div className="flex items-center gap-4 mt-3">
                      <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden bg-gray-50 shrink-0">
                        <button
                          onClick={() => handleQuantityChange(item.id, item.quantity, -1, product.stock_quantity)}
                          className="px-2 py-1 text-gray-600 hover:bg-gray-100 transition-colors text-xs font-bold"
                        >
                          -
                        </button>
                        <span className="px-3 py-1 font-bold text-xs text-gray-800 bg-white min-w-[30px] text-center border-x border-gray-100">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => handleQuantityChange(item.id, item.quantity, 1, product.stock_quantity)}
                          className="px-2 py-1 text-gray-600 hover:bg-gray-100 transition-colors text-xs font-bold"
                        >
                          +
                        </button>
                      </div>
                      
                      <button
                        onClick={() => handleRemove(item.id)}
                        className="text-gray-400 hover:text-rose-600 transition-colors"
                        title="Remove Item"
                      >
                        <Trash2 className="w-5 h-5 stroke-[1.5]" />
                      </button>
                    </div>
                  </div>

                  {/* Price Sum */}
                  <div className="text-right shrink-0">
                    <span className="text-sm font-extrabold text-gray-950 block">
                      ${(product.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Order Summary Card */}
          <div className="mt-8 lg:mt-0 lg:col-span-4 bg-white rounded-3xl border border-gray-100 p-6 sm:p-8 shadow-sm">
            <h2 className="text-lg font-bold text-gray-900 border-b border-gray-50 pb-4">
              Order Summary
            </h2>
            <div className="mt-6 space-y-4">
              <div className="flex items-center justify-between text-sm text-gray-500 font-medium">
                <span>Subtotal</span>
                <span className="text-gray-900">${totalAmount.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between text-sm text-gray-500 font-medium">
                <span>Shipping</span>
                <span className="text-emerald-600 font-semibold bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-100">
                  FREE
                </span>
              </div>
              <div className="h-px bg-gray-100 my-4" />
              <div className="flex items-center justify-between">
                <span className="text-base font-bold text-gray-900">Total Price</span>
                <span className="text-xl font-extrabold text-primary-600">
                  ${totalAmount.toFixed(2)}
                </span>
              </div>
            </div>

            <div className="mt-8">
              <Link
                to="/checkout"
                className="w-full bg-primary-600 hover:bg-primary-700 text-white font-bold py-3.5 px-6 rounded-2xl shadow-lg shadow-primary-100 hover:shadow-none transition-all flex items-center justify-center gap-2 text-sm sm:text-base"
              >
                Proceed to Checkout
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
            
            <div className="mt-4 text-center">
              <Link
                to="/"
                className="text-xs text-gray-400 hover:text-primary-600 font-medium transition-colors"
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;
