import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import { Search, ShoppingCart, Image as ImageIcon, ChevronLeft, ChevronRight, Inbox } from 'lucide-react';

const Home = () => {
  const { addToCart } = useCart();
  const showToast = useToast();

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategorySlug, setSelectedCategorySlug] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [addingId, setAddingId] = useState(null);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setPage(1); // Reset page on new search
    }, 400);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Reset page when category changes
  useEffect(() => {
    setPage(1);
  }, [selectedCategorySlug]);

  // Fetch categories on mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await api.get('/categories');
        setCategories(response.data);
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };
    fetchCategories();
  }, []);

  // Fetch products when page, category, or search query changes
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const params = {
          page,
          size: 8,
          search: debouncedSearch || undefined,
          category_slug: selectedCategorySlug || undefined,
        };
        const response = await api.get('/products', { params });
        setProducts(response.data.items);
        setTotalPages(response.data.pages);
      } catch (error) {
        console.error('Error fetching products:', error);
        showToast('Failed to load products', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [page, selectedCategorySlug, debouncedSearch]);

  const handleAddToCart = async (e, productId) => {
    e.preventDefault(); // Stop navigation to details page
    setAddingId(productId);
    try {
      await addToCart(productId, 1);
      showToast('Added item to cart!', 'success');
    } catch (err) {
      const errMsg = err.response?.data?.detail || err.message || 'Could not add to cart';
      showToast(errMsg, 'error');
    } finally {
      setAddingId(null);
    }
  };

  const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
  const STATIC_BASE = API_BASE.replace('/api', '');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Hero Header */}
      <div className="mb-10 text-center md:text-left md:flex md:items-center md:justify-between bg-gradient-to-r from-primary-900 to-indigo-950 text-white rounded-3xl p-8 sm:p-12 shadow-xl shadow-indigo-100">
        <div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Discover Quality Products
          </h1>
          <p className="mt-3 text-indigo-200 max-w-md text-sm sm:text-base">
            Get the best tech, fashion, kitchen equipment, and guides delivered directly to your doorstep.
          </p>
        </div>
        <div className="mt-6 md:mt-0 max-w-md w-full relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-indigo-300" />
          </div>
          <input
            type="text"
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="block w-full pl-10 pr-4 py-3.5 border border-indigo-800 rounded-2xl bg-indigo-900/40 text-white placeholder-indigo-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm backdrop-blur-md"
          />
        </div>
      </div>

      {/* Main Grid: Filters & Product Catalog */}
      <div className="lg:grid lg:grid-cols-4 lg:gap-8">
        {/* Category Filter - Sidebar (Desktop) / Carousel (Mobile) */}
        <div className="lg:col-span-1 mb-6 lg:mb-0">
          <div className="bg-white p-6 rounded-2xl border border-gray-100 sticky top-24">
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4">
              Categories
            </h3>
            <div className="flex flex-row overflow-x-auto pb-3 gap-2 lg:flex-col lg:overflow-x-visible lg:pb-0">
              <button
                onClick={() => setSelectedCategorySlug('')}
                className={`px-4 py-2 text-sm font-semibold rounded-xl text-left whitespace-nowrap transition-all ${
                  selectedCategorySlug === ''
                    ? 'bg-primary-50 text-primary-700 shadow-sm'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                All Products
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategorySlug(cat.slug)}
                  className={`px-4 py-2 text-sm font-semibold rounded-xl text-left whitespace-nowrap transition-all ${
                    selectedCategorySlug === cat.slug
                      ? 'bg-primary-50 text-primary-700 shadow-sm'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Product Catalog */}
        <div className="lg:col-span-3">
          {loading ? (
            // Skeletons
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 animate-pulse">
              {[...Array(6)].map((_, idx) => (
                <div key={idx} className="bg-white rounded-2xl border border-gray-100 h-96" />
              ))}
            </div>
          ) : products.length === 0 ? (
            // Empty State
            <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
              <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
                <Inbox className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">No products found</h3>
              <p className="mt-1 text-sm text-gray-500">
                Try searching for something else or switching categories.
              </p>
            </div>
          ) : (
            <>
              {/* Product Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {products.map((product) => (
                  <Link
                    key={product.id}
                    to={`/products/${product.id}`}
                    className="group bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-xl hover:border-transparent transition-all flex flex-col h-full"
                  >
                    {/* Image Area */}
                    <div className="aspect-square bg-gray-50 relative overflow-hidden flex items-center justify-center shrink-0">
                      {product.image_url ? (
                        <img
                          src={`${STATIC_BASE}${product.image_url}`}
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-tr from-gray-100 to-gray-50 flex items-center justify-center text-gray-400 group-hover:scale-105 transition-transform duration-300">
                          <ImageIcon className="w-12 h-12 stroke-[1.2]" />
                        </div>
                      )}
                      <span className="absolute top-3 right-3 bg-white/80 backdrop-blur-md text-gray-800 text-xs font-bold px-2.5 py-1 rounded-full shadow-sm">
                        {product.category?.name || 'Item'}
                      </span>
                    </div>

                    {/* Content Area */}
                    <div className="p-5 flex flex-col flex-grow">
                      <h4 className="font-bold text-gray-900 group-hover:text-primary-600 transition-colors text-base line-clamp-1">
                        {product.name}
                      </h4>
                      <p className="text-gray-500 text-xs mt-1 line-clamp-2 leading-relaxed flex-grow">
                        {product.description}
                      </p>
                      
                      <div className="mt-4 flex items-center justify-between pt-3 border-t border-gray-50 shrink-0">
                        <div>
                          <span className="text-xs text-gray-400 block font-medium">Price</span>
                          <span className="text-lg font-extrabold text-gray-900">
                            ${product.price.toFixed(2)}
                          </span>
                        </div>

                        {product.stock_quantity > 0 ? (
                          <button
                            onClick={(e) => handleAddToCart(e, product.id)}
                            disabled={addingId === product.id}
                            className="bg-primary-600 hover:bg-primary-700 text-white p-2.5 rounded-xl shadow-md shadow-primary-100 hover:shadow-none transition-all flex items-center justify-center disabled:bg-primary-400"
                            title="Add to Cart"
                          >
                            {addingId === product.id ? (
                              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            ) : (
                              <ShoppingCart className="w-5 h-5" />
                            )}
                          </button>
                        ) : (
                          <span className="text-xs font-bold text-rose-600 bg-rose-50 px-2.5 py-1 rounded-lg">
                            Out of Stock
                          </span>
                        )}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-10">
                  <button
                    onClick={() => setPage((p) => Math.max(p - 1, 1))}
                    disabled={page === 1}
                    className="p-2 border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:hover:bg-transparent"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <span className="text-sm font-semibold text-gray-700 mx-2">
                    Page {page} of {totalPages}
                  </span>
                  <button
                    onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                    disabled={page === totalPages}
                    className="p-2 border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:hover:bg-transparent"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;
