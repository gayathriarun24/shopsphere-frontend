import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import API from '../utils/api';
import { ShoppingCart, Trash2, ArrowRight, CheckCircle, Heart, CreditCard, ShieldCheck, Sparkles, Package } from 'lucide-react';

const Cart = () => {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);
  const [shippingAddress, setShippingAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Card');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const getUserToken = () => {
    try {
      const userInfo = localStorage.getItem('userInfo');
      if (userInfo) {
        const parsed = JSON.parse(userInfo);
        return parsed.token || null;
      }
    } catch (e) {
      return null;
    }
    return null;
  };

  const isLoggedIn = Boolean(getUserToken());

  useEffect(() => {
    const items = JSON.parse(localStorage.getItem('cartItems')) || [];
    setCartItems(items);
  }, []);

  const saveAndSyncCart = (updatedItems) => {
    setCartItems(updatedItems);
    localStorage.setItem('cartItems', JSON.stringify(updatedItems));
    
    const newTotalCount = updatedItems.reduce((acc, item) => acc + (Number(item.quantity) || 1), 0);
    
    window.dispatchEvent(new CustomEvent('cartUpdated', { detail: newTotalCount }));
    window.dispatchEvent(new Event('storage'));
  };

  const updateQuantity = (item, newQty) => {
    const targetId = item._id || item.id;
    if (newQty <= 0) {
      removeItem(item);
      return;
    }

    const updated = cartItems.map((cartItem) => {
      const currentId = cartItem._id || cartItem.id;
      return currentId === targetId ? { ...cartItem, quantity: Number(newQty) } : cartItem;
    });
    saveAndSyncCart(updated);
  };

  const removeItem = (item) => {
    const targetId = item._id || item.id;
    const updated = cartItems.filter((cartItem) => {
      const currentId = cartItem._id || cartItem.id;
      return currentId !== targetId;
    });
    saveAndSyncCart(updated);
    setToastMessage(`Removed "${item.title}" from bag.`);
    setTimeout(() => setToastMessage(''), 3000);
  };

  const saveForLater = (item) => {
    try {
      const userInfo = JSON.parse(localStorage.getItem('userInfo'));
      const userId = userInfo?._id || userInfo?.id || 'guest';
      const wishlistStorageKey = `wishlistItems_${userId}`;

      const wishlist = JSON.parse(localStorage.getItem(wishlistStorageKey)) || [];
      const targetId = item._id || item.id;
      
      const exists = wishlist.some(wItem => (wItem._id || wItem.id) === targetId);
      if (!exists) {
        wishlist.push(item);
        localStorage.setItem(wishlistStorageKey, JSON.stringify(wishlist));
      }

      removeItem(item);
      setToastMessage(`Moved "${item.title}" to your wishlist!`);
      setTimeout(() => setToastMessage(''), 3000);
    } catch (err) {
      setError('Failed to save item for later.');
    }
  };

  const totalItemCount = cartItems.reduce((acc, item) => acc + (Number(item.quantity) || 1), 0);
  const subtotal = cartItems.reduce((acc, item) => acc + (Number(item.price) || 0) * (Number(item.quantity) || 1), 0);

  const handleCheckout = async (e) => {
    e.preventDefault();
    
    if (!isLoggedIn) {
      setError('You must be logged in to place an order.');
      setTimeout(() => navigate('/login'), 1500);
      return;
    }

    if (!shippingAddress.trim()) {
      setError('Please provide a shipping address.');
      return;
    }

    try {
      setLoading(true);
      setError('');

      const orderPayload = {
        orderItems: cartItems.map(item => ({
          product: item._id || item.id,
          quantity: Number(item.quantity) || 1,
          price: item.price
        })),
        shippingAddress,
        totalPrice: subtotal,
        paymentMethod
      };

      await API.post('/orders', orderPayload);
      
      setSuccess(true);
      localStorage.removeItem('cartItems');
      setCartItems([]);
      window.dispatchEvent(new CustomEvent('cartUpdated', { detail: 0 }));

      setTimeout(() => {
        navigate('/orders');
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to place order. Please try again.');
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-[#F9F6F0] text-[#1A1A1A] flex items-center justify-center px-4 font-sans">
        <div className="bg-white border border-[#D4C5B9]/60 p-10 rounded-3xl shadow-sm text-center max-w-lg w-full">
          <div className="w-16 h-16 bg-[#F9F6F0] rounded-full flex items-center justify-center mx-auto mb-5 border border-[#D4C5B9]/40">
            <CheckCircle className="w-8 h-8 text-[#C5A059]" />
          </div>
          <h2 className="text-2xl font-serif font-light text-[#1A1A1A] mb-2 tracking-wide">Order Placed Successfully</h2>
          <p className="text-[#1A1A1A]/70 mb-4 font-light text-xs sm:text-sm">Your secure transaction has been processed.</p>
          <div className="bg-[#F9F6F0] p-4 rounded-2xl border border-[#D4C5B9]/30 text-[11px] text-[#1A1A1A]/60 tracking-wider uppercase">
            Redirecting to your orders dashboard...
          </div>
        </div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-[#F9F6F0] text-[#1A1A1A] flex items-center justify-center px-4 font-sans">
        <div className="bg-white p-12 rounded-3xl shadow-sm border border-dashed border-[#D4C5B9] text-center max-w-lg w-full">
          <div className="w-20 h-20 bg-[#F9F6F0] rounded-full flex items-center justify-center mx-auto mb-5 border border-[#D4C5B9]/40">
            <ShoppingCart className="w-8 h-8 text-[#C5A059]" />
          </div>
          <h2 className="text-2xl font-serif font-light text-[#1A1A1A] mb-2 tracking-wide">Your Shopping Bag is Empty</h2>
          <p className="text-[#1A1A1A]/60 mb-8 font-light text-xs sm:text-sm">
            Explore our catalog and curate your selection.
          </p>
          <Link to="/" className="inline-flex items-center gap-2 bg-[#1A1A1A] hover:bg-[#C5A059] text-[#F9F6F0] hover:text-[#1A1A1A] px-7 py-3.5 rounded-xl font-medium transition shadow-sm text-xs tracking-widest uppercase">
            Start Shopping <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F9F6F0] text-[#1A1A1A] max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 font-sans relative">
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 bg-[#1A1A1A] text-[#F9F6F0] border border-[#C5A059] px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-2 text-xs tracking-wider uppercase">
          <CheckCircle className="w-4 h-4 text-[#C5A059]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {error && (
        <div className="fixed top-6 right-6 z-50 bg-[#1A1A1A] text-white border border-red-500 px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-2 text-xs tracking-wider uppercase">
          <span className="text-red-400 font-bold">Error:</span> {error}
        </div>
      )}

      {/* Top Minimalist Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-[#D4C5B9]/40 pb-6 mb-8 gap-4">
        <div>
          <span className="text-[10px] uppercase tracking-[0.2em] text-[#C5A059] font-semibold">Review & Checkout</span>
          <h1 className="text-3xl font-serif font-light text-[#1A1A1A] mt-1">Your Shopping Bag</h1>
        </div>
        <div className="text-xs text-[#1A1A1A]/70 tracking-wider flex items-center gap-2">
          <Package className="w-4 h-4 text-[#C5A059]" />
          <span>{totalItemCount} {totalItemCount === 1 ? 'item' : 'items'} in bag</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Left Column: Cart Items List */}
        <div className="lg:col-span-7 space-y-4">
          {cartItems.map((item, index) => {
            const itemQty = Number(item.quantity) || 1;
            const uniqueKey = item._id || item.id || index;
            const itemTotal = (Number(item.price) || 0) * itemQty;

            return (
              <div 
                key={uniqueKey} 
                className="bg-white p-5 sm:p-6 rounded-3xl border border-[#D4C5B9]/60 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 transition hover:shadow-md"
              >
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 sm:w-24 sm:h-24 bg-[#F9F6F0] rounded-2xl overflow-hidden flex-shrink-0 border border-[#D4C5B9]/40">
                    {item.images && item.images.length > 0 ? (
                      <img src={item.images[0]} alt={item.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[10px] text-[#1A1A1A]/40 uppercase">No Image</div>
                    )}
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase tracking-widest text-[#C5A059] font-semibold">{item.category || 'Collection'}</span>
                    <h3 className="font-serif font-medium text-[#1A1A1A] text-sm line-clamp-1">{item.title}</h3>
                    <div className="text-xs text-[#1A1A1A]/60 font-light">Unit Price: ${(Number(item.price) || 0).toFixed(2)}</div>
                    <div className="text-sm font-serif font-medium text-[#1A1A1A] pt-1">Total: ${itemTotal.toFixed(2)}</div>
                  </div>
                </div>

                <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-3 pt-4 sm:pt-0 border-t sm:border-t-0 border-[#F9F6F0]">
                  {/* Quantity Stepper Pill */}
                  <div className="flex items-center border border-[#1A1A1A]/20 rounded-full overflow-hidden bg-[#F9F6F0] px-2 py-0.5">
                    <button
                      type="button"
                      onClick={() => updateQuantity(item, itemQty - 1)}
                      className="w-7 h-7 flex items-center justify-center text-[#1A1A1A] hover:bg-[#D4C5B9]/40 rounded-full transition text-xs cursor-pointer font-bold"
                    >
                      -
                    </button>
                    <span className="px-3 text-xs font-semibold text-[#1A1A1A]">{itemQty}</span>
                    <button
                      type="button"
                      onClick={() => updateQuantity(item, itemQty + 1)}
                      className="w-7 h-7 flex items-center justify-center text-[#1A1A1A] hover:bg-[#D4C5B9]/40 rounded-full transition text-xs cursor-pointer font-bold"
                    >
                      +
                    </button>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => saveForLater(item)}
                      title="Move to Wishlist"
                      className="p-2 text-[#1A1A1A]/70 hover:text-[#C5A059] bg-[#F9F6F0] hover:bg-white rounded-xl border border-[#D4C5B9]/40 transition cursor-pointer flex items-center gap-1 text-[11px] uppercase tracking-wider px-3"
                    >
                      <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500/20" />
                      <span className="hidden md:inline">Save</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => removeItem(item)}
                      title="Remove Item"
                      className="p-2 text-red-400 hover:text-red-600 bg-red-50/50 hover:bg-red-50 rounded-xl border border-red-200/40 transition cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Column: Checkout Panel */}
        <div className="lg:col-span-5 bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-[#D4C5B9]/60 space-y-6 sticky top-8">
          <div className="flex items-center justify-between border-b border-[#F9F6F0] pb-4">
            <h2 className="text-lg font-serif font-medium text-[#1A1A1A] tracking-wide">Checkout Summary</h2>
            <Sparkles className="w-4 h-4 text-[#C5A059]" />
          </div>
          
          <div className="space-y-3 text-xs tracking-wider">
            <div className="flex justify-between text-[#1A1A1A]/70">
              <span>Bag Subtotal</span>
              <span className="font-semibold text-[#1A1A1A]">${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-[#1A1A1A]/70">
              <span>Shipping & Handling</span>
              <span className="font-semibold text-[#C5A059] uppercase">Complimentary</span>
            </div>
            <div className="border-t border-[#F9F6F0] pt-4 flex justify-between text-base font-serif font-medium text-[#1A1A1A]">
              <span>Grand Total</span>
              <span className="text-[#C5A059]">${subtotal.toFixed(2)}</span>
            </div>
          </div>

          {isLoggedIn ? (
            <form onSubmit={handleCheckout} className="space-y-4 pt-2">
              <div>
                <label className="block text-[11px] font-semibold text-[#1A1A1A] uppercase tracking-widest mb-1.5">Shipping Address</label>
                <textarea
                  rows="3"
                  placeholder="Enter full street address, city, pin code..."
                  value={shippingAddress}
                  onChange={(e) => setShippingAddress(e.target.value)}
                  className="w-full px-4 py-3 text-xs rounded-2xl border border-[#D4C5B9]/60 bg-[#F9F6F0] text-[#1A1A1A] focus:outline-none focus:ring-2 focus:ring-[#C5A059] placeholder:text-[#1A1A1A]/40 tracking-wider resize-none"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#1A1A1A] uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                  <CreditCard className="w-3.5 h-3.5 text-[#C5A059]" /> Payment Method
                </label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full px-4 py-3 text-xs rounded-2xl border border-[#D4C5B9]/60 bg-[#F9F6F0] text-[#1A1A1A] focus:outline-none focus:ring-2 focus:ring-[#C5A059] tracking-wider cursor-pointer"
                >
                  <option value="Card">Mock Credit / Debit Card (Simulated)</option>
                  <option value="UPI">Mock UPI / Wallet (Simulated)</option>
                  <option value="COD">Cash on Delivery</option>
                </select>
               
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#1A1A1A] hover:bg-[#C5A059] text-[#F9F6F0] hover:text-[#1A1A1A] py-4 rounded-2xl text-xs font-medium tracking-widest uppercase transition shadow-sm flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                {loading ? 'Processing Payment...' : <>Proceed to Secure Payment <ArrowRight className="w-4 h-4" /></>}
              </button>
            </form>
          ) : (
            <div className="text-center bg-[#F9F6F0] p-6 rounded-2xl border border-[#D4C5B9]/40 space-y-3">
              <p className="text-xs text-[#1A1A1A]/70 font-light tracking-wide">Please log in to enter your shipping address and complete your order.</p>
              <Link to="/login" className="inline-block w-full bg-[#1A1A1A] hover:bg-[#C5A059] text-[#F9F6F0] hover:text-[#1A1A1A] py-3 rounded-xl text-xs font-medium tracking-widest uppercase transition shadow-sm">
                Log In to Checkout
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Cart;