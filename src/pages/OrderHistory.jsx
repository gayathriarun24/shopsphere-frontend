import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../utils/api';
import { Package, Clock, MapPin, CheckCircle, Truck, Box, AlertCircle, FileText, Calendar, Filter } from 'lucide-react';

const OrderHistory = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [dateFilter, setDateFilter] = useState('all');

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await API.get('/orders/myorders');
        setOrders(res.data);
        setLoading(false);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load order history');
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const getStepDetails = (status) => {
    const steps = ['Pending', 'Processing', 'Shipped', 'Delivered'];
    if (status === 'Cancelled') return { currentIndex: -1, isCancelled: true };
    const index = steps.indexOf(status);
    return { currentIndex: index !== -1 ? index : 0, isCancelled: false };
  };

  const filteredOrders = orders.filter((order) => {
    if (dateFilter === 'all') return true;

    const orderDate = new Date(order.createdAt);
    const now = new Date();
    
    if (dateFilter === '1month') {
      const oneMonthAgo = new Date();
      oneMonthAgo.setMonth(now.getMonth() - 1);
      return orderDate >= oneMonthAgo;
    }
    if (dateFilter === '3months') {
      const threeMonthsAgo = new Date();
      threeMonthsAgo.setMonth(now.getMonth() - 3);
      return orderDate >= threeMonthsAgo;
    }
    if (dateFilter === '1year') {
      const oneYearAgo = new Date();
      oneYearAgo.setFullYear(now.getFullYear() - 1);
      return orderDate >= oneYearAgo;
    }
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 bg-[#F9F6F0] min-h-screen text-[#1A1A1A] font-sans">
      {/* Header with Date Filter */}
      <div className="mb-8 border-b border-[#D4C5B9]/40 pb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <span className="text-[10px] uppercase tracking-[0.2em] text-[#C5A059] font-semibold">Ledger & Logistics</span>
          <h1 className="text-3xl font-serif font-light text-[#1A1A1A] mt-1 flex items-center gap-3">
            <FileText className="w-6 h-6 text-[#C5A059]" /> Order Terminal
          </h1>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-white px-3.5 py-2 rounded-2xl border border-[#D4C5B9]/60 shadow-sm">
            <Filter className="w-3.5 h-3.5 text-[#C5A059]" />
            <span className="text-[10px] uppercase tracking-wider text-[#1A1A1A]/60 font-medium">Timeline:</span>
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="bg-transparent text-xs font-medium text-[#1A1A1A] focus:outline-none cursor-pointer"
            >
              <option value="all">All Time</option>
              <option value="1month">Past 1 Month</option>
              <option value="3months">Past 3 Months</option>
              <option value="1year">Past 1 Year</option>
            </select>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-[#1A1A1A] text-white border border-red-500 p-4 rounded-2xl mb-6 text-xs tracking-wider uppercase flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div className="bg-white p-12 rounded-3xl text-center border border-[#D4C5B9]/60">
          <p className="text-[#1A1A1A]/60 text-xs tracking-widest uppercase animate-pulse">Syncing order ledger...</p>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl shadow-sm border border-[#D4C5B9]/60 p-8 max-w-lg mx-auto">
          <Package className="w-8 h-8 text-[#C5A059] mx-auto mb-3" />
          <p className="text-[#1A1A1A] font-serif text-lg tracking-wide mb-1">No orders found for this timeframe.</p>
          <p className="text-[#1A1A1A]/60 text-xs tracking-wider uppercase mb-6">Try selecting a broader timeline or explore the catalog.</p>
          <button
            onClick={() => navigate('/')}
            className="bg-[#1A1A1A] hover:bg-[#C5A059] text-[#F9F6F0] hover:text-[#1A1A1A] text-xs font-medium px-6 py-3 rounded-2xl transition tracking-widest uppercase cursor-pointer"
          >
            Start Shopping
          </button>
        </div>
      ) : (
        <div className="space-y-8">
          {filteredOrders.map((order) => (
            <div key={order._id} className="bg-white rounded-3xl shadow-sm border border-[#D4C5B9]/60 overflow-hidden grid grid-cols-1 lg:grid-cols-12">
              
              {/* Left Column: Invoice Metadata Panel (4 Cols) */}
              <div className="lg:col-span-4 bg-[#F9F6F0]/80 p-6 sm:p-8 border-b lg:border-b-0 lg:border-r border-[#D4C5B9]/40 flex flex-col justify-between space-y-6">
                <div className="space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[10px] text-[#1A1A1A]/40 uppercase tracking-widest block">Reference ID</span>
                      <span className="font-serif font-medium text-sm text-[#1A1A1A]">#{order._id.slice(-8).toUpperCase()}</span>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-[#D4C5B9]/30 space-y-2">
                    <div className="flex items-center gap-2 text-xs text-[#1A1A1A]/70">
                      <Calendar className="w-3.5 h-3.5 text-[#C5A059]" />
                      <span>{new Date(order.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                    </div>
                    <div className="flex items-start gap-2 text-xs text-[#1A1A1A]/70">
                      <MapPin className="w-3.5 h-3.5 text-[#C5A059] shrink-0 mt-0.5" />
                      <span className="line-clamp-2">
                        {typeof order.shippingAddress === 'object'
                          ? `${order.shippingAddress?.address || ''}, ${order.shippingAddress?.city || ''} - ${order.shippingAddress?.postalCode || ''}`
                          : order.shippingAddress}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="pt-6 border-t border-[#D4C5B9]/30 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-[#1A1A1A]/40 uppercase tracking-widest block">Total Capital</span>
                    <span className="text-xl font-serif font-medium text-[#C5A059]">${(order.totalAmount || 0).toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Right Column: Interactive Itemized Tracking Feed (8 Cols) */}
              <div className="lg:col-span-8 p-6 sm:p-8 divide-y divide-[#F9F6F0]">
                {order.orderItems.map((item, idx) => {
                  const status = item.itemStatus || 'Pending';
                  const { currentIndex, isCancelled } = getStepDetails(status);
                  const steps = [
                    { label: 'Pending', icon: Clock },
                    { label: 'Processing', icon: Box },
                    { label: 'Shipped', icon: Truck },
                    { label: 'Delivered', icon: CheckCircle },
                  ];

                  return (
                    <div key={item._id || idx} className="py-6 first:pt-0 last:pb-0 space-y-5">
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div className="flex items-center gap-4">
                          {item.product?.images?.[0] && (
                            <img 
                              src={item.product.images[0]} 
                              alt={item.product.title} 
                              className="w-14 h-14 object-cover rounded-2xl border border-[#D4C5B9]/40 bg-[#F9F6F0]"
                            />
                          )}
                          <div>
                            <h3 className="font-serif font-medium text-[#1A1A1A] text-sm">{item.product?.title || 'Boutique Product Item'}</h3>
                            <p className="text-xs text-[#1A1A1A]/60 mt-0.5 tracking-wider">
                              Qty: <strong className="text-[#1A1A1A]">{item.quantity}</strong> • Unit: <strong className="text-[#1A1A1A]">${(item.price || 0).toFixed(2)}</strong>
                            </p>
                          </div>
                        </div>

                        <span className={`px-3 py-1 rounded-full text-[10px] font-semibold uppercase tracking-widest border ${
                          status === 'Delivered' 
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
                            : status === 'Cancelled'
                            ? 'bg-red-50 text-red-700 border-red-200'
                            : 'bg-[#F9F6F0] text-[#C5A059] border-[#D4C5B9]/60'
                        }`}>
                          {status}
                        </span>
                      </div>

                      {/* Tracker */}
                      {isCancelled ? (
                        <div className="bg-[#1A1A1A] text-white border border-red-500 p-3.5 rounded-2xl flex items-center gap-2 text-xs uppercase tracking-wider">
                          <AlertCircle className="w-4 h-4 text-red-400" /> Item cancelled.
                        </div>
                      ) : (
                        <div className="bg-[#F9F6F0]/60 p-4 rounded-2xl border border-[#D4C5B9]/30">
                          <div className="relative flex items-center justify-between max-w-lg mx-auto my-1">
                            <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-0.5 bg-[#D4C5B9]/40 z-0"></div>
                            <div 
                              className="absolute left-0 top-1/2 -translate-y-1/2 h-0.5 bg-[#C5A059] transition-all duration-500 z-0"
                              style={{ width: `${(currentIndex / (steps.length - 1)) * 100}%` }}
                            ></div>

                            {steps.map((step, sIdx) => {
                              const isCompleted = sIdx <= currentIndex;
                              const StepIcon = step.icon;

                              return (
                                <div key={step.label} className="relative z-10 flex flex-col items-center">
                                  <div className={`w-7 h-7 rounded-full flex items-center justify-center transition-all ${
                                    isCompleted 
                                      ? 'bg-[#1A1A1A] text-[#F9F6F0] border border-[#C5A059]' 
                                      : 'bg-white text-[#1A1A1A]/30 border border-[#D4C5B9]/60'
                                  }`}>
                                    <StepIcon className="w-3 h-3" />
                                  </div>
                                  <span className={`text-[9px] mt-1.5 font-medium tracking-wider uppercase ${
                                    isCompleted ? 'text-[#1A1A1A] font-semibold' : 'text-[#1A1A1A]/40'
                                  }`}>
                                    {step.label}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OrderHistory;