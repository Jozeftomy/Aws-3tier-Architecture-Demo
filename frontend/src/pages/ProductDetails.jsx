import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import { ChevronLeft, ShoppingCart, Image as ImageIcon, ArrowLeft, ShieldCheck, Truck } from 'lucide-react';

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const showToast = useToast();

  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await api.get(`/products/${id}`);
        setProduct(response.data);
      } catch (error) {
        console.error('Error fetching product details:', error);
        showToast('Product not found', 'error');
        navigate('/');
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  const handleAddToCart = async () => {
    setAdding(true);
    try {
      await addToCart(product.id, quantity);
      showToast(`Added ${quantity} item(s) to your cart!`, 'success');
    } catch (err) {
      const errMsg = err.response?.data?.detail || err.message || 'Could not add to cart';
      showToast(errMsg, 'error');
    } finally {
      setAdding(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[85vh] flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!product) {
    return null;
  }

  const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
  const STATIC_BASE = API_BASE.replace('/api', '');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Back Link */}
      <Link
        to="/"
        className="inline-flex items-center gap-2 text-gray-500 hover:text-primary-600 font-medium text-sm transition-colors mb-8"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Products
      </Link>

      {/* Product Display Details */}
      <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-sm lg:grid lg:grid-cols-2 lg:gap-8">
        {/* Left Column: Image Area */}
        <div className="aspect-square lg:aspect-auto lg:h-[500px] bg-gray-50 flex items-center justify-center relative border-r border-gray-50">
          {product.image_url ? (
            <img
              src={`${STATIC_BASE}${product.image_url}`}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-tr from-gray-100 to-gray-50 flex items-center justify-center text-gray-400">
              <ImageIcon className="w-24 h-24 stroke-[1.2]" />
            </div>
          )}
        </div>

        {/* Right Column: Information */}
        <div className="p-8 sm:p-12 flex flex-col justify-center">
          <div>
            <span className="bg-primary-50 text-primary-700 text-xs font-bold px-3 py-1.5 rounded-full border border-primary-100 inline-block">
              {product.category?.name || 'Catalog Item'}
            </span>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight mt-4">
              {product.name}
            </h1>
            <div className="text-2xl font-extrabold text-primary-600 mt-4">
              ${product.price.toFixed(2)}
            </div>
          </div>

          <div className="h-px bg-gray-100 my-6" />

          {/* Description */}
          <div>
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-2">
              Description
            </h3>
            <p className="text-gray-600 text-sm leading-relaxed">
              {product.description}
            </p>
          </div>

          <div className="h-px bg-gray-100 my-6" />

          {/* Purchase Actions */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-gray-700">Availability:</span>
              {product.stock_quantity > 0 ? (
                <span className="text-sm font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 px-3 py-1.5 rounded-xl">
                  {product.stock_quantity} Units in Stock
                </span>
              ) : (
                <span className="text-sm font-bold text-rose-600 bg-rose-50 border border-rose-100 px-3 py-1.5 rounded-xl">
                  Out of Stock
                </span>
              )}
            </div>

            {product.stock_quantity > 0 && (
              <div className="flex items-center gap-4">
                <span className="text-sm font-semibold text-gray-700 shrink-0">Quantity:</span>
                <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden bg-gray-50">
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    disabled={quantity <= 1}
                    className="px-3 py-2 text-gray-600 hover:bg-gray-100 transition-colors disabled:opacity-50 text-sm font-bold"
                  >
                    -
                  </button>
                  <span className="px-4 py-2 font-bold text-sm text-gray-800 bg-white min-w-[40px] text-center border-x border-gray-100">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity((q) => Math.min(product.stock_quantity, q + 1))}
                    disabled={quantity >= product.stock_quantity}
                    className="px-3 py-2 text-gray-600 hover:bg-gray-100 transition-colors disabled:opacity-50 text-sm font-bold"
                  >
                    +
                  </button>
                </div>
              </div>
            )}

            {product.stock_quantity > 0 ? (
              <button
                onClick={handleAddToCart}
                disabled={adding}
                className="w-full bg-primary-600 hover:bg-primary-700 text-white font-bold py-3.5 px-6 rounded-2xl shadow-lg shadow-primary-100 flex items-center justify-center gap-2 hover:shadow-none transition-all disabled:bg-primary-400 text-sm sm:text-base"
              >
                {adding ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    <ShoppingCart className="w-5 h-5" />
                    Add to Cart
                  </>
                )}
              </button>
            ) : (
              <button
                disabled
                className="w-full bg-gray-100 text-gray-400 font-bold py-3.5 px-6 rounded-2xl cursor-not-allowed text-sm sm:text-base border border-gray-200"
              >
                Sold Out
              </button>
            )}
          </div>

          {/* Micro Trust badges */}
          <div className="grid grid-cols-2 gap-4 mt-8 pt-6 border-t border-gray-50 text-xs text-gray-400 font-medium">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-primary-500" />
              Secure checkout
            </div>
            <div className="flex items-center gap-2">
              <Truck className="w-4 h-4 text-primary-500" />
              Fast home delivery
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
