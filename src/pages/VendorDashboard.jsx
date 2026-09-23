import React, { useState, useEffect } from 'react';
import API from '../utils/api';
import { Package, Plus, Trash2, Edit3, Clock, MapPin, User, X, DollarSign, AlertTriangle, Layers, ShoppingBag, CheckCircle, Search } from 'lucide-react';

const VendorDashboard = () => {
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('products'); // 'products' or 'orders'
  const [showProductModal, setShowProductModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Form state for creating / editing products
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');
  const [category, setCategory] = useState('');
  const [images, setImages] = useState('');
  const [editingProductId, setEditingProductId] = useState(null);
  
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchVendorData = async () => {
    try {
      const [prodRes, orderRes] = await Promise.all([
        API.get('/products/vendor/mystore'),
        API.get('/orders/vendor/orders')
      ]);
      setProducts(prodRes.data);
      setOrders(orderRes.data);
      setLoading(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load dashboard data');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVendorData();
  }, []);

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    try {
      const imageArray = images ? images.split(',').map((img) => img.trim()) : ['https://images.unsplash.com/photo-1523275335684-37898b6baf30'];
      const productData = {
        title,
        description,
        price: Number(price),
        stock: Number(stock),
        category,
        images: imageArray
      };

      if (editingProductId) {
        await API.put(`/products/${editingProductId}`, productData);
        setSuccess('Product updated successfully!');
      } else {
        await API.post('/products', productData);
        setSuccess('Product published successfully!');
      }

      resetForm();
      setShowProductModal(false);
      fetchVendorData();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save product');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleEditClick = (prod) => {
    setEditingProductId(prod._id);
    setTitle(prod.title);
    setDescription(prod.description);
    setPrice(prod.price);
    setStock(prod.stock);
    setCategory(prod.category);
    setImages(prod.images ? prod.images.join(', ') : '');
    setShowProductModal(true);
  };

  const resetForm = () => {
    setEditingProductId(null);
    setTitle('');
    setDescription('');
    setPrice('');
    setStock('');
    setCategory('');
    setImages('');
  };

  const handleDeleteProduct = async (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await API.delete(`/products/${id}`);
        fetchVendorData();
      } catch (err) {
        alert(err.response?.data?.message || 'Failed to delete product');
      }
    }
  };

  const handleUpdateItemStatus = async (orderId, itemId, newStatus) => {
    try {
      await API.put(`/orders/${orderId}/item/${itemId}/status`, { itemStatus: newStatus });
      fetchVendorData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update item status');
    }
  };

  // Calculate metrics
  const totalRevenue = orders.reduce((acc, order) => {
    const orderSum = order.orderItems.reduce((sum, item) => sum + ((item.price || 0) * (item.quantity || 1)), 0);
    return acc + orderSum;
  }, 0);

  // Updated threshold: count products with stock less than 10
  const lowStockCount = products.filter(p => p.stock < 10).length;

  const filteredProducts = products.filter(p => 
    p.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    p.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 bg-[#F9F6F0] min-h-screen text-[#1A1A1A]">
      
      {/* Notifications */}
      {error && (
        <div className="bg-red-50 text-red-700 border border-red-200 px-4 py-3 rounded-xl text-xs uppercase tracking-wider flex justify-between items-center">
          <span>{error}</span>
          <button onClick={() => setError('')}><X className="w-4 h-4" /></button>
        </div>
      )}
      {success && (
        <div className="bg-emerald-50 text-emerald-800 border border-emerald-200 px-4 py-3 rounded-xl text-xs uppercase tracking-wider flex justify-between items-center">
          <span className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-emerald-600" /> {success}</span>
          <button onClick={() => setSuccess('')}><X className="w-4 h-4" /></button>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-[#1A1A1A] text-[#F9F6F0] p-8 rounded-3xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shadow-xl border border-[#D4C5B9]/30 relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 w-64 h-64 bg-[#C5A059]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="space-y-1 relative z-10">
          <div className="flex items-center gap-2">
            <span className="text-[10px] tracking-[0.2em] uppercase text-[#C5A059] font-semibold">Vendor Portal</span>
            <span className="text-white/40">•</span>
            <span className="text-[10px] tracking-wider uppercase text-white/70">Store Management</span>
          </div>
          <h1 className="text-3xl font-serif font-light tracking-wide">Vendor Dashboard</h1>
          <p className="text-[#F9F6F0]/70 text-xs sm:text-sm font-light max-w-xl">
            Monitor real-time inventory, manage product listings, and oversee customer order fulfillments.
          </p>
        </div>
        <button
          onClick={() => { resetForm(); setShowProductModal(true); }}
          className="relative z-10 bg-[#C5A059] hover:bg-white text-[#1A1A1A] px-6 py-3.5 rounded-xl font-medium text-xs tracking-widest uppercase transition shadow-lg cursor-pointer flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Add New Product
        </button>
      </div>

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="bg-white p-6 rounded-2xl border border-[#D4C5B9]/60 shadow-sm flex items-center gap-4">
          <div className="p-3.5 bg-[#F9F6F0] rounded-xl text-[#C5A059] border border-[#D4C5B9]/40">
            <Package className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-widest text-[#1A1A1A]/60 font-semibold">Total Products</p>
            <h3 className="text-2xl font-serif font-medium text-[#1A1A1A] mt-0.5">{products.length}</h3>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-[#D4C5B9]/60 shadow-sm flex items-center gap-4">
          <div className="p-3.5 bg-[#F9F6F0] rounded-xl text-amber-600 border border-[#D4C5B9]/40">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-widest text-[#1A1A1A]/60 font-semibold">Low Stock Alert</p>
            <h3 className="text-2xl font-serif font-medium text-[#1A1A1A] mt-0.5">{lowStockCount}</h3>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-[#D4C5B9]/60 shadow-sm flex items-center gap-4">
          <div className="p-3.5 bg-[#F9F6F0] rounded-xl text-blue-600 border border-[#D4C5B9]/40">
            <ShoppingBag className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-widest text-[#1A1A1A]/60 font-semibold">Customer Orders</p>
            <h3 className="text-2xl font-serif font-medium text-[#1A1A1A] mt-0.5">{orders.length}</h3>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-[#D4C5B9]/60 shadow-sm flex items-center gap-4">
          <div className="p-3.5 bg-[#F9F6F0] rounded-xl text-emerald-700 border border-[#D4C5B9]/40">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-widest text-[#1A1A1A]/60 font-semibold">Store Revenue</p>
            <h3 className="text-2xl font-serif font-medium text-[#1A1A1A] mt-0.5">${totalRevenue.toFixed(2)}</h3>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-[#D4C5B9]/60 gap-8">
        <button
          onClick={() => setActiveTab('products')}
          className={`pb-4 text-xs font-semibold uppercase tracking-widest transition cursor-pointer relative ${
            activeTab === 'products' ? 'text-[#1A1A1A]' : 'text-[#1A1A1A]/50 hover:text-[#1A1A1A]'
          }`}
        >
          Product Inventory ({products.length})
          {activeTab === 'products' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#C5A059]" />}
        </button>
        <button
          onClick={() => setActiveTab('orders')}
          className={`pb-4 text-xs font-semibold uppercase tracking-widest transition cursor-pointer relative ${
            activeTab === 'orders' ? 'text-[#1A1A1A]' : 'text-[#1A1A1A]/50 hover:text-[#1A1A1A]'
          }`}
        >
          Customer Orders ({orders.length})
          {activeTab === 'orders' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#C5A059]" />}
        </button>
      </div>

      {/* Tab Content: Products */}
      {activeTab === 'products' && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-[#D4C5B9]/60 space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <h2 className="text-lg font-serif font-medium text-[#1A1A1A] flex items-center gap-2">
              <Layers className="w-5 h-5 text-[#C5A059]" /> Catalog Inventory
            </h2>
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-[#1A1A1A]/40 absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder="Search inventory..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-[#F9F6F0] border border-[#D4C5B9] rounded-xl text-xs text-[#1A1A1A] focus:outline-none focus:ring-2 focus:ring-[#C5A059]"
              />
            </div>
          </div>

          {loading ? (
            <div className="text-center py-16 text-xs uppercase tracking-widest text-[#1A1A1A]/50">Loading inventory...</div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-16 border border-dashed border-[#D4C5B9] rounded-2xl">
              <p className="text-sm font-serif text-[#1A1A1A] mb-2">No products found.</p>
              <button
                onClick={() => { resetForm(); setShowProductModal(true); }}
                className="text-xs text-[#C5A059] font-medium uppercase tracking-widest hover:underline"
              >
                + Add your first product
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProducts.map((prod) => (
                <div key={prod._id} className="border border-[#D4C5B9]/60 rounded-2xl p-4 bg-[#F9F6F0]/30 flex flex-col justify-between gap-4 hover:shadow-md transition">
                  <div className="flex items-start gap-3">
                    <img
                      src={prod.images?.[0] || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30'}
                      alt={prod.title}
                      className="w-16 h-16 object-cover rounded-xl border border-[#D4C5B9]"
                    />
                    <div className="space-y-1 flex-1 min-w-0">
                      <span className="text-[10px] bg-[#1A1A1A] text-[#F9F6F0] px-2 py-0.5 rounded-full uppercase tracking-widest">{prod.category}</span>
                      <h4 className="font-serif font-medium text-[#1A1A1A] text-sm truncate">{prod.title}</h4>
                      <p className="text-xs font-semibold text-[#1A1A1A]">${prod.price.toFixed(2)}</p>
                    </div>
                  </div>

                  <div className="flex justify-between items-center pt-3 border-t border-[#D4C5B9]/40 text-xs">
                    {/* Updated threshold check for stock text highlight */}
                    <span className={`font-semibold uppercase tracking-wider ${prod.stock < 10 ? 'text-amber-600' : 'text-[#1A1A1A]/70'}`}>
                      Stock: {prod.stock} units
                    </span>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleEditClick(prod)}
                        className="p-2 text-[#1A1A1A]/60 hover:text-[#C5A059] transition cursor-pointer"
                        title="Edit"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteProduct(prod._id)}
                        className="p-2 text-[#1A1A1A]/60 hover:text-red-600 transition cursor-pointer"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab Content: Orders */}
      {activeTab === 'orders' && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-[#D4C5B9]/60 space-y-6">
          <h2 className="text-lg font-serif font-medium text-[#1A1A1A] flex items-center gap-2">
            <Clock className="w-5 h-5 text-[#C5A059]" /> Incoming Customer Orders
          </h2>

          {loading ? (
            <div className="text-center py-16 text-xs uppercase tracking-widest text-[#1A1A1A]/50">Loading orders...</div>
          ) : orders.length === 0 ? (
            <div className="text-center py-16 border border-dashed border-[#D4C5B9] rounded-2xl text-xs text-[#1A1A1A]/50 uppercase tracking-widest">
              No customer orders received yet.
            </div>
          ) : (
            <div className="space-y-6">
              {orders.map((order) => (
                <div key={order._id} className="p-5 border border-[#D4C5B9]/60 rounded-2xl bg-[#F9F6F0]/40 space-y-4">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center text-xs text-[#1A1A1A]/60 pb-3 border-b border-[#D4C5B9]/40 gap-2">
                    <span className="font-mono">Order ID: {order._id}</span>
                    <span className="bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full font-semibold uppercase tracking-wider text-[10px]">
                      {order.paymentStatus || 'Paid'}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div className="flex items-center gap-2 text-[#1A1A1A]/80">
                      <User className="w-4 h-4 text-[#C5A059]" />
                      <span>{order.customer?.name || 'Customer'} ({order.customer?.email || 'N/A'})</span>
                    </div>
                    <div className="flex items-center gap-2 text-[#1A1A1A]/80">
                      <MapPin className="w-4 h-4 text-[#C5A059]" />
                      <span>{typeof order.shippingAddress === 'object' ? `${order.shippingAddress?.address || ''}, ${order.shippingAddress?.city || ''}` : order.shippingAddress}</span>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-[#D4C5B9]/40 space-y-3">
                    <p className="text-xs font-bold uppercase tracking-wider text-[#1A1A1A]">Ordered Items & Fulfillment:</p>
                    {order.orderItems.map((item, idx) => (
                      <div key={item._id || idx} className="p-3 bg-white border border-[#D4C5B9]/60 rounded-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                        <div>
                          <p className="font-serif font-medium text-[#1A1A1A] text-xs">{item.product?.title || 'Product'} <span className="text-[#1A1A1A]/60 font-sans">(Qty: {item.quantity})</span></p>
                          <span className="text-[11px] text-[#C5A059] font-medium">Subtotal: ${((item.price || 0) * (item.quantity || 1)).toFixed(2)}</span>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="text-[11px] uppercase tracking-wider text-[#1A1A1A]/60 font-semibold">Status:</span>
                          <select
                            value={item.itemStatus || 'Pending'}
                            onChange={(e) => handleUpdateItemStatus(order._id, item._id, e.target.value)}
                            className="px-3 py-1.5 bg-[#F9F6F0] border border-[#D4C5B9] rounded-lg text-xs font-semibold text-[#1A1A1A] focus:outline-none focus:ring-2 focus:ring-[#C5A059]"
                          >
                            <option value="Pending">Pending</option>
                            <option value="Processing">Processing</option>
                            <option value="Shipped">Shipped</option>
                            <option value="Delivered">Delivered</option>
                            <option value="Cancelled">Cancelled</option>
                          </select>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Add / Edit Product Slide-over Modal */}
      {showProductModal && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white w-full max-w-lg h-full shadow-2xl p-6 sm:p-8 flex flex-col justify-between overflow-y-auto border-l border-[#D4C5B9]/50">
            <div>
              <div className="flex justify-between items-center pb-4 border-b border-[#F9F6F0] mb-6">
                <h3 className="font-serif font-medium text-lg text-[#1A1A1A] flex items-center gap-2">
                  {editingProductId ? <Edit3 className="w-5 h-5 text-[#C5A059]" /> : <Plus className="w-5 h-5 text-[#C5A059]" />}
                  {editingProductId ? 'Edit Product Listing' : 'Publish New Product'}
                </h3>
                <button onClick={() => setShowProductModal(false)} className="p-2 rounded-full hover:bg-[#F9F6F0] text-[#1A1A1A] transition cursor-pointer">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleFormSubmit} className="space-y-4">
                <div>
                  <label className="block text-[11px] font-semibold text-[#1A1A1A]/70 uppercase tracking-widest mb-1">Product Title</label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Handcrafted Ceramic Vase"
                    className="w-full px-3.5 py-2.5 bg-[#F9F6F0] border border-[#D4C5B9] rounded-xl text-xs text-[#1A1A1A] focus:ring-2 focus:ring-[#C5A059] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-[#1A1A1A]/70 uppercase tracking-widest mb-1">Description</label>
                  <textarea
                    required
                    rows="3"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe craftsmanship and materials..."
                    className="w-full px-3.5 py-2.5 bg-[#F9F6F0] border border-[#D4C5B9] rounded-xl text-xs text-[#1A1A1A] focus:ring-2 focus:ring-[#C5A059] outline-none"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-semibold text-[#1A1A1A]/70 uppercase tracking-widest mb-1">Price ($)</label>
                    <input
                      type="number"
                      required
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      placeholder="120.00"
                      className="w-full px-3.5 py-2.5 bg-[#F9F6F0] border border-[#D4C5B9] rounded-xl text-xs text-[#1A1A1A] focus:ring-2 focus:ring-[#C5A059] outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-[#1A1A1A]/70 uppercase tracking-widest mb-1">Stock Quantity</label>
                    <input
                      type="number"
                      required
                      value={stock}
                      onChange={(e) => setStock(e.target.value)}
                      placeholder="15"
                      className="w-full px-3.5 py-2.5 bg-[#F9F6F0] border border-[#D4C5B9] rounded-xl text-xs text-[#1A1A1A] focus:ring-2 focus:ring-[#C5A059] outline-none"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-[#1A1A1A]/70 uppercase tracking-widest mb-1">Category</label>
                  <input
                    type="text"
                    required
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    placeholder="Home & Living"
                    className="w-full px-3.5 py-2.5 bg-[#F9F6F0] border border-[#D4C5B9] rounded-xl text-xs text-[#1A1A1A] focus:ring-2 focus:ring-[#C5A059] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-[#1A1A1A]/70 uppercase tracking-widest mb-1">Image URLs (comma-separated)</label>
                  <input
                    type="text"
                    value={images}
                    onChange={(e) => setImages(e.target.value)}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full px-3.5 py-2.5 bg-[#F9F6F0] border border-[#D4C5B9] rounded-xl text-xs text-[#1A1A1A] focus:ring-2 focus:ring-[#C5A059] outline-none"
                  />
                </div>
                <div className="pt-4">
                  <button
                    type="submit"
                    className="w-full bg-[#1A1A1A] hover:bg-[#C5A059] text-[#F9F6F0] hover:text-[#1A1A1A] font-medium py-3 rounded-xl transition text-xs uppercase tracking-widest shadow-sm cursor-pointer border border-transparent"
                  >
                    {editingProductId ? 'Save Changes' : 'Publish Product'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default VendorDashboard;