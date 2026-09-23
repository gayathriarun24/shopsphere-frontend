import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Heart, ArrowRight, CheckCircle, Sparkles } from 'lucide-react';

const Wishlist = () => {
  const navigate = useNavigate();
  const [wishlistItems, setWishlistItems] = useState([]);
  const [toastMessage, setToastMessage] = useState('');

  // Helper to get current user ID or fallback to 'guest'
  const getUserId = () => {
    try {
      const userInfo = JSON.parse(localStorage.getItem('userInfo'));
      return userInfo?._id || userInfo?.id || 'guest';
    } catch {
      return 'guest';
    }
  };

  const userId = getUserId();
  const wishlistStorageKey = `wishlistItems_${userId}`;

  // Check login status based on token presence
  const isLoggedIn = () => {
    try {
      const userInfo = localStorage.getItem('userInfo');
      if (userInfo) {
        const parsed = JSON.parse(userInfo);
        return Boolean(parsed.token);
      }
    } catch {
      return false;
    }
    return false;
  };

  useEffect(() => {
    try {
      const items = JSON.parse(localStorage.getItem(wishlistStorageKey)) || [];
      setWishlistItems(items);
    } catch {
      setWishlistItems([]);
    }
  }, [wishlistStorageKey]);

  const saveAndSyncWishlist = (updatedItems) => {
    setWishlistItems(updatedItems);
    localStorage.setItem(wishlistStorageKey, JSON.stringify(updatedItems));
  };

  const removeWishlistItem = (item) => {
    const targetId = item._id || item.id;
    const updated = wishlistItems.filter((wItem) => {
      const currentId = wItem._id || wItem.id;
      return currentId !== targetId;
    });
    saveAndSyncWishlist(updated);
    setToastMessage(`Removed "${item.title}" from wishlist.`);
    setTimeout(() => setToastMessage(''), 3000);
  };

  const clearWishlist = () => {
    if (window.confirm('Are you sure you want to clear your entire wishlist?')) {
      saveAndSyncWishlist([]);
      setToastMessage('Wishlist cleared successfully.');
      setTimeout(() => setToastMessage(''), 3000);
    }
  };

  const moveAllToCart = () => {
    if (!isLoggedIn()) {
      navigate('/login');
      return;
    }

    try {
      const cart = JSON.parse(localStorage.getItem('cartItems')) || [];
      const availableItems = wishlistItems.filter(item => item.stock !== 0);

      if (availableItems.length === 0) {
        setToastMessage('No in-stock items available to move.');
        setTimeout(() => setToastMessage(''), 3000);
        return;
      }

      availableItems.forEach(item => {
        const targetId = item._id || item.id;
        const itemIndex = cart.findIndex(cItem => (cItem._id || cItem.id) === targetId);

        if (itemIndex > -1) {
          cart[itemIndex].quantity = (Number(cart[itemIndex].quantity) || 1) + 1;
        } else {
          cart.push({ ...item, quantity: 1 });
        }
      });

      localStorage.setItem('cartItems', JSON.stringify(cart));
      const totalCount = cart.reduce((acc, cItem) => acc + (Number(cItem.quantity) || 1), 0);

      window.dispatchEvent(new CustomEvent('cartUpdated', { detail: totalCount }));
      window.dispatchEvent(new Event('storage'));

      const remainingItems = wishlistItems.filter(item => item.stock === 0);
      saveAndSyncWishlist(remainingItems);

      setToastMessage('Moved all available items to your cart!');
      setTimeout(() => setToastMessage(''), 3000);
    } catch (err) {
      console.error('Failed to move items to cart', err);
    }
  };

  const moveToCart = (item) => {
    if (!isLoggedIn()) {
      navigate('/login');
      return;
    }

    try {
      const cart = JSON.parse(localStorage.getItem('cartItems')) || [];
      const targetId = item._id || item.id;
      const itemIndex = cart.findIndex(cItem => (cItem._id || cItem.id) === targetId);

      if (itemIndex > -1) {
        cart[itemIndex].quantity = (Number(cart[itemIndex].quantity) || 1) + 1;
      } else {
        cart.push({ ...item, quantity: 1 });
      }

      localStorage.setItem('cartItems', JSON.stringify(cart));
      const totalCount = cart.reduce((acc, cItem) => acc + (Number(cItem.quantity) || 1), 0);

      window.dispatchEvent(new CustomEvent('cartUpdated', { detail: totalCount }));
      window.dispatchEvent(new Event('storage'));

      removeWishlistItem(item);
      
      setToastMessage(`Moved "${item.title}" to your cart!`);
      setTimeout(() => setToastMessage(''), 3000);
    } catch (err) {
      console.error('Failed to move item to cart', err);
    }
  };

  if (wishlistItems.length === 0) {
    return (
      <div className="min-h-screen bg-[#F9F6F0] text-[#1A1A1A] max-w-4xl mx-auto px-4 py-20 text-center font-sans">
        <div className="bg-white p-12 rounded-3xl shadow-sm border border-dashed border-[#D4C5B9]">
          <div className="w-20 h-20 bg-[#F9F6F0] rounded-full flex items-center justify-center mx-auto mb-5 border border-[#D4C5B9]/40">
            <Sparkles className="w-8 h-8 text-[#C5A059]" />
          </div>
          <h2 className="text-2xl font-serif font-light text-[#1A1A1A] mb-2 tracking-wide">Your Curated Collection is Empty</h2>
          <p className="text-[#1A1A1A]/60 mb-8 font-light tracking-wide text-xs sm:text-sm max-w-md mx-auto">
            Discover exquisite pieces across our store and save them here for your future orders.
          </p>
          <Link to="/" className="inline-flex items-center gap-2 bg-[#1A1A1A] hover:bg-[#C5A059] text-[#F9F6F0] hover:text-[#1A1A1A] px-7 py-3.5 rounded-xl font-medium transition shadow-sm text-xs tracking-widest uppercase">
            Browse Marketplace <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F9F6F0] text-[#1A1A1A] max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 relative font-sans space-y-8">
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 bg-[#1A1A1A] text-[#F9F6F0] border border-[#C5A059] px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-2 text-xs tracking-wider uppercase">
          <CheckCircle className="w-4 h-4 text-[#C5A059]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Banner Header with Actions */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#D4C5B9]/60 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-1">
          <span className="text-[10px] uppercase tracking-[0.2em] text-[#C5A059] font-semibold">Personal Vault</span>
          <h1 className="text-2xl sm:text-3xl font-serif font-light text-[#1A1A1A]">My Wishlist</h1>
          <p className="text-xs text-[#1A1A1A]/60 tracking-wider">
            {wishlistItems.length} {wishlistItems.length === 1 ? 'item' : 'items'} saved in your collection
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <button
            onClick={moveAllToCart}
            className="flex-1 md:flex-none bg-[#1A1A1A] hover:bg-[#C5A059] text-[#F9F6F0] hover:text-[#1A1A1A] px-6 py-3.5 rounded-xl text-xs font-medium uppercase tracking-widest transition shadow-sm cursor-pointer flex items-center justify-center gap-2"
          >
            <ShoppingCart className="w-4 h-4" /> Move All to Cart
          </button>
          <button
            onClick={clearWishlist}
            className="flex-1 md:flex-none bg-[#F9F6F0] hover:bg-red-50 text-[#1A1A1A]/70 hover:text-red-600 border border-[#D4C5B9]/60 px-6 py-3.5 rounded-xl text-xs font-medium uppercase tracking-widest transition cursor-pointer flex items-center justify-center gap-2"
          >
            <Heart className="w-4 h-4 fill-current text-red-500" /> Clear Wishlist
          </button>
        </div>
      </div>

      {/* Main Product Grid spanning full width cleanly */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {wishlistItems.map((item, index) => {
          const uniqueKey = item._id || item.id || index;
          const isOutOfStock = item.stock === 0;

          return (
            <div 
              key={uniqueKey} 
              className="bg-white rounded-3xl border border-[#D4C5B9]/60 shadow-sm overflow-hidden flex flex-col justify-between group hover:shadow-md transition"
            >
              <div>
                <div className="h-56 bg-[#F9F6F0] overflow-hidden relative">
                  {item.images && item.images.length > 0 ? (
                    <img 
                      src={item.images[0]} 
                      alt={item.title} 
                      className="w-full h-full object-cover transition duration-700 group-hover:scale-105 cursor-pointer"
                      onClick={() => navigate(`/product/${uniqueKey}`)}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[#1A1A1A]/40 text-xs uppercase">No Image</div>
                  )}

                  <span className="absolute top-3 left-3 bg-white/90 backdrop-blur-md text-[#1A1A1A] text-[10px] font-medium px-2.5 py-1 rounded-full uppercase tracking-widest border border-[#D4C5B9]/40">
                    {item.category || 'Item'}
                  </span>
                </div>

                <div className="p-5 space-y-2">
                  <div className="flex justify-between items-start gap-2">
                    <h3 
                      onClick={() => navigate(`/product/${uniqueKey}`)}
                      className="font-serif font-medium text-[#1A1A1A] text-sm line-clamp-1 hover:text-[#C5A059] transition cursor-pointer"
                    >
                      {item.title}
                    </h3>
                  </div>

                  <p className="text-[#1A1A1A]/60 text-xs line-clamp-2 font-light leading-relaxed">
                    {item.description}
                  </p>

                  <div className="text-base font-serif font-medium text-[#1A1A1A] pt-1">
                    ${(Number(item.price) || 0).toFixed(2)}
                  </div>
                </div>
              </div>

              <div className="p-5 pt-0 border-t border-[#F9F6F0] mt-auto">
                <div className="flex items-center gap-2 pt-4">
                  <button
                    onClick={() => moveToCart(item)}
                    disabled={isOutOfStock}
                    className={`flex-1 py-2.5 rounded-xl text-[11px] font-medium tracking-widest uppercase transition shadow-sm flex items-center justify-center gap-1.5 ${
                      isOutOfStock 
                        ? 'bg-[#F9F6F0] text-[#1A1A1A]/40 cursor-not-allowed border border-[#D4C5B9]/40' 
                        : 'bg-[#1A1A1A] hover:bg-[#C5A059] text-[#F9F6F0] hover:text-[#1A1A1A] cursor-pointer'
                    }`}
                  >
                    <ShoppingCart className="w-3.5 h-3.5" /> {isOutOfStock ? 'Out of Stock' : 'Move to Cart'}
                  </button>

                  <button
                    onClick={() => removeWishlistItem(item)}
                    title="Remove from Wishlist"
                    className="p-2.5 text-red-500 hover:text-red-600 bg-red-50 hover:bg-red-100 rounded-xl border border-red-200/60 transition cursor-pointer"
                  >
                    <Heart className="w-4 h-4 fill-current" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Wishlist;