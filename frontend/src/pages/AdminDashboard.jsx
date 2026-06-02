import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useToast } from '../context/ToastContext';
import { Package, ClipboardList, Plus, Edit2, Trash2, Upload, AlertCircle, RefreshCw, X } from 'lucide-react';

const AdminDashboard = () => {
  const showToast = useToast();
  const [activeTab, setActiveTab] = useState('products'); // products, orders
  
  // Products states
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [isEditingProduct, setIsEditingProduct] = useState(false);
  const [currentProduct, setCurrentProduct] = useState({
    id: null,
    name: '',
    slug: '',
    description: '',
    price: '',
    stock_quantity: '',
    category_id: '',
    image_url: ''
  });
  const [showProductModal, setShowProductModal] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  // Orders states
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);

  // Fetch initial data
  const fetchProducts = async () => {
    setLoadingProducts(true);
    try {
      // Get all products (let's query with a large page size for simplicity in dashboard)
      const response = await api.get('/products', { params: { size: 100 } });
      setProducts(response.data.items);
    } catch (error) {
      showToast('Failed to load products list', 'error');
    } finally {
      setLoadingProducts(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await api.get('/categories');
      setCategories(response.data);
    } catch (error) {
      console.error('Failed to load categories', error);
    }
  };

  const fetchOrders = async () => {
    setLoadingOrders(true);
    try {
      const response = await api.get('/orders/admin/all');
      setOrders(response.data);
    } catch (error) {
      showToast('Failed to load orders list', 'error');
    } finally {
      setLoadingOrders(false);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchCategories();
    fetchOrders();
  }, []);

  // Generate slug automatically when name changes (only for new products)
  const handleNameChange = (e) => {
    const name = e.target.value;
    const updates = { name };
    if (!isEditingProduct) {
      updates.slug = name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');
    }
    setCurrentProduct(prev => ({ ...prev, ...updates }));
  };

  // Image upload handler
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    setUploadingImage(true);
    try {
      const response = await api.post('/products/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setCurrentProduct(prev => ({ ...prev, image_url: response.data.image_url }));
      showToast('Image uploaded successfully!', 'success');
    } catch (error) {
      const errMsg = error.response?.data?.detail || 'Failed to upload image';
      showToast(errMsg, 'error');
    } finally {
      setUploadingImage(false);
    }
  };

  // Save Product (Create or Update)
  const handleSaveProduct = async (e) => {
    e.preventDefault();
    if (!currentProduct.name || !currentProduct.slug || !currentProduct.price) {
      showToast('Please fill in required fields', 'error');
      return;
    }

    const payload = {
      name: currentProduct.name,
      slug: currentProduct.slug,
      description: currentProduct.description,
      price: parseFloat(currentProduct.price),
      stock_quantity: parseInt(currentProduct.stock_quantity) || 0,
      category_id: currentProduct.category_id ? parseInt(currentProduct.category_id) : null,
      image_url: currentProduct.image_url || null
    };

    try {
      if (isEditingProduct) {
        await api.put(`/products/${currentProduct.id}`, payload);
        showToast('Product updated successfully!', 'success');
      } else {
        await api.post('/products', payload);
        showToast('Product created successfully!', 'success');
      }
      setShowProductModal(false);
      fetchProducts();
    } catch (error) {
      const errMsg = error.response?.data?.detail || 'Failed to save product';
      showToast(errMsg, 'error');
    }
  };

  // Delete Product
  const handleDeleteProduct = async (productId) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    try {
      await api.delete(`/products/${productId}`);
      showToast('Product deleted', 'info');
      fetchProducts();
    } catch (error) {
      showToast('Failed to delete product', 'error');
    }
  };

  // Update Order Status
  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      await api.put(`/orders/${orderId}/status`, { status: newStatus });
      showToast(`Order status updated to ${newStatus}`, 'success');
      fetchOrders();
    } catch (error) {
      showToast('Failed to update status', 'error');
    }
  };

  const openNewProductModal = () => {
    setIsEditingProduct(false);
    setCurrentProduct({
      id: null,
      name: '',
      slug: '',
      description: '',
      price: '',
      stock_quantity: '',
      category_id: categories[0]?.id || '',
      image_url: ''
    });
    setShowProductModal(true);
  };

  const openEditProductModal = (product) => {
    setIsEditingProduct(true);
    setCurrentProduct({
      id: product.id,
      name: product.name,
      slug: product.slug,
      description: product.description,
      price: product.price,
      stock_quantity: product.stock_quantity,
      category_id: product.category_id || '',
      image_url: product.image_url || ''
    });
    setShowProductModal(true);
  };

  const getOrderStatusStyle = (status) => {
    switch (status.toUpperCase()) {
      case 'PENDING': return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'PAID': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'SHIPPED': return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case 'DELIVERED': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'CANCELLED': return 'bg-rose-50 text-rose-700 border-rose-200';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
  const STATIC_BASE = API_BASE.replace('/api', '');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Title */}
      <div className="md:flex md:items-center md:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
            Admin Management Portal
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Catalog inventory administration and sales order status updates
          </p>
        </div>
      </div>

      {/* Tabs Menu */}
      <div className="flex border-b border-gray-200 gap-6 mb-6">
        <button
          onClick={() => setActiveTab('products')}
          className={`flex items-center gap-2 pb-4 font-bold text-sm border-b-2 transition-colors ${
            activeTab === 'products'
              ? 'border-primary-600 text-primary-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <Package className="w-4 h-4" />
          Manage Products
        </button>
        <button
          onClick={() => setActiveTab('orders')}
          className={`flex items-center gap-2 pb-4 font-bold text-sm border-b-2 transition-colors ${
            activeTab === 'orders'
              ? 'border-primary-600 text-primary-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <ClipboardList className="w-4 h-4" />
          Manage Orders
        </button>
      </div>

      {/* Tab Content: Products */}
      {activeTab === 'products' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
            <span className="text-sm font-semibold text-gray-500">
              {products.length} Products configured
            </span>
            <button
              onClick={openNewProductModal}
              className="bg-primary-600 hover:bg-primary-700 text-white font-bold text-sm px-4 py-2 rounded-xl shadow-md shadow-primary-100 hover:shadow-none transition-all flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              Add Product
            </button>
          </div>

          {loadingProducts ? (
            <div className="flex justify-center py-12">
              <RefreshCw className="w-8 h-8 text-primary-600 animate-spin" />
            </div>
          ) : (
            <div className="bg-white border border-gray-100 rounded-3xl overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-100 text-sm text-left">
                  <thead className="bg-gray-50/50 text-gray-500 font-bold uppercase text-xs tracking-wider">
                    <tr>
                      <th className="px-6 py-4">Product Info</th>
                      <th className="px-6 py-4">Category</th>
                      <th className="px-6 py-4">Price</th>
                      <th className="px-6 py-4">Stock</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 font-medium text-gray-700">
                    {products.map((product) => (
                      <tr key={product.id} className="hover:bg-gray-50/30 transition-colors">
                        <td className="px-6 py-4 flex items-center gap-3">
                          <div className="w-10 h-10 bg-gray-50 rounded-lg overflow-hidden shrink-0 flex items-center justify-center border border-gray-100">
                            {product.image_url ? (
                              <img
                                src={`${STATIC_BASE}${product.image_url}`}
                                alt=""
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <Package className="w-5 h-5 text-gray-400" />
                            )}
                          </div>
                          <div className="min-w-0">
                            <span className="font-bold text-gray-900 block truncate max-w-xs">{product.name}</span>
                            <span className="text-xs text-gray-400 block truncate max-w-xs">slug: {product.slug}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-gray-500">{product.category?.name || 'Unassigned'}</td>
                        <td className="px-6 py-4 font-bold text-gray-900">${product.price.toFixed(2)}</td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 rounded-lg text-xs font-bold border ${
                            product.stock_quantity === 0
                              ? 'bg-rose-50 text-rose-700 border-rose-100'
                              : 'bg-emerald-50 text-emerald-700 border-emerald-100'
                          }`}>
                            {product.stock_quantity} available
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right space-x-2">
                          <button
                            onClick={() => openEditProductModal(product)}
                            className="p-1.5 text-gray-400 hover:text-primary-600 hover:bg-gray-50 rounded-lg transition-colors inline-flex"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(product.id)}
                            className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-gray-50 rounded-lg transition-colors inline-flex"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab Content: Orders */}
      {activeTab === 'orders' && (
        <div className="space-y-6">
          {loadingOrders ? (
            <div className="flex justify-center py-12">
              <RefreshCw className="w-8 h-8 text-primary-600 animate-spin" />
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-3xl border border-gray-100 shadow-sm">
              <ClipboardList className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-gray-900">No orders placed yet</h3>
            </div>
          ) : (
            <div className="bg-white border border-gray-100 rounded-3xl overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-100 text-sm text-left">
                  <thead className="bg-gray-50/50 text-gray-500 font-bold uppercase text-xs tracking-wider">
                    <tr>
                      <th className="px-6 py-4">Order ID</th>
                      <th className="px-6 py-4">User</th>
                      <th className="px-6 py-4">Amount</th>
                      <th className="px-6 py-4">Shipping details</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4 text-right">Moderation</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 font-medium text-gray-700">
                    {orders.map((order) => (
                      <tr key={order.id} className="hover:bg-gray-50/30 transition-colors">
                        <td className="px-6 py-4 font-bold text-gray-900">#{order.id}</td>
                        <td className="px-6 py-4">
                          <span className="font-semibold block">{order.user?.full_name || 'Guest User'}</span>
                          <span className="text-xs text-gray-400 block">{order.user?.email || 'N/A'}</span>
                        </td>
                        <td className="px-6 py-4 font-bold text-primary-600">${order.total_amount.toFixed(2)}</td>
                        <td className="px-6 py-4 max-w-xs truncate" title={order.shipping_address}>
                          <span className="block truncate">{order.shipping_address}</span>
                          <span className="text-xs text-gray-400 block">Phone: {order.phone}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2.5 py-1 text-xs border rounded-full font-bold ${getOrderStatusStyle(order.status)}`}>
                            {order.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <select
                            value={order.status}
                            onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value)}
                            className="bg-gray-50 border border-gray-300 rounded-lg text-xs font-semibold px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-primary-500"
                          >
                            <option value="PENDING">PENDING</option>
                            <option value="PAID">PAID</option>
                            <option value="SHIPPED">SHIPPED</option>
                            <option value="DELIVERED">DELIVERED</option>
                            <option value="CANCELLED">CANCELLED</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Product Form Modal */}
      {showProductModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-gray-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-gray-100 flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="px-6 py-5 border-b border-gray-50 flex items-center justify-between">
              <h3 className="font-extrabold text-gray-900 text-lg">
                {isEditingProduct ? 'Modify Product Details' : 'Add New Product'}
              </h3>
              <button
                onClick={() => setShowProductModal(false)}
                className="p-1 rounded-lg text-gray-400 hover:bg-gray-50 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form Body */}
            <form onSubmit={handleSaveProduct} className="p-6 overflow-y-auto space-y-4 flex-grow">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
                    Product Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={currentProduct.name}
                    onChange={handleNameChange}
                    className="block w-full border border-gray-300 rounded-xl px-3 py-2 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                    placeholder="e.g. Wireless Headset"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
                    URL Slug (lowercase) *
                  </label>
                  <input
                    type="text"
                    required
                    value={currentProduct.slug}
                    onChange={(e) => setCurrentProduct({ ...currentProduct, slug: e.target.value.toLowerCase() })}
                    className="block w-full border border-gray-300 rounded-xl px-3 py-2 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                    placeholder="e.g. wireless-headset"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
                    Price ($) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={currentProduct.price}
                    onChange={(e) => setCurrentProduct({ ...currentProduct, price: e.target.value })}
                    className="block w-full border border-gray-300 rounded-xl px-3 py-2 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                    placeholder="19.99"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
                    Stock Quantity *
                  </label>
                  <input
                    type="number"
                    required
                    value={currentProduct.stock_quantity}
                    onChange={(e) => setCurrentProduct({ ...currentProduct, stock_quantity: e.target.value })}
                    className="block w-full border border-gray-300 rounded-xl px-3 py-2 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                    placeholder="50"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
                    Product Category
                  </label>
                  <select
                    value={currentProduct.category_id}
                    onChange={(e) => setCurrentProduct({ ...currentProduct, category_id: e.target.value })}
                    className="block w-full border border-gray-300 rounded-xl px-3 py-2.5 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                  >
                    <option value="">Choose category...</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div className="col-span-2">
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
                    Description
                  </label>
                  <textarea
                    rows="3"
                    value={currentProduct.description}
                    onChange={(e) => setCurrentProduct({ ...currentProduct, description: e.target.value })}
                    className="block w-full border border-gray-300 rounded-xl px-3 py-2 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                    placeholder="Enter item description details..."
                  />
                </div>

                {/* Local Photo Uploader */}
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
                    Product Image (Local Upload)
                  </label>
                  <div className="flex gap-4 items-center">
                    <div className="w-16 h-16 bg-gray-50 rounded-xl border border-gray-200 overflow-hidden flex items-center justify-center shrink-0">
                      {currentProduct.image_url ? (
                        <img
                          src={`${STATIC_BASE}${currentProduct.image_url}`}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Upload className="w-6 h-6 text-gray-400" />
                      )}
                    </div>

                    <div className="flex-grow">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                        id="modal-image-file"
                      />
                      <label
                        htmlFor="modal-image-file"
                        className="inline-flex items-center gap-1.5 border border-gray-300 rounded-xl px-4 py-2 text-sm font-semibold text-gray-700 bg-white hover:bg-gray-50 transition-colors cursor-pointer shadow-sm"
                      >
                        {uploadingImage ? (
                          <>
                            <RefreshCw className="w-4 h-4 text-primary-500 animate-spin" />
                            Uploading...
                          </>
                        ) : (
                          <>
                            <Upload className="w-4 h-4" />
                            Upload Image File
                          </>
                        )}
                      </label>
                      <span className="block text-xs text-gray-400 mt-1">
                        PNG, JPG, JPEG, or WEBP up to 5MB
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-6 border-t border-gray-50 flex gap-3 justify-end shrink-0">
                <button
                  type="button"
                  onClick={() => setShowProductModal(false)}
                  className="border border-gray-300 rounded-xl px-5 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-primary-600 hover:bg-primary-700 text-white font-bold text-sm px-6 py-2.5 rounded-xl shadow-md shadow-primary-100 hover:shadow-none transition-all"
                >
                  Save Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
