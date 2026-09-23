import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, Store, ShieldAlert, LogOut, Package, Heart, User, ChevronDown } from 'lucide-react';

const Navbar = ({ onOpenCart }) => {
  const navigate = useNavigate();
  const userInfo = JSON.parse(localStorage.getItem('userInfo'));
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    const calculateCount = (e) => {
      if (e && e.detail !== undefined) {
        setCartCount(e.detail);
        return;
      }
      try {
        const cartItems = JSON.parse(localStorage.getItem('cartItems')) || [];
        const total = cartItems.reduce((acc, item) => acc + (Number(item.quantity) || 1), 0);
        setCartCount(total);
      } catch {
        setCartCount(0);
      }
    };

    calculateCount();

    window.addEventListener('storage', calculateCount);
    window.addEventListener('cartUpdated', calculateCount);

    return () => {
      window.removeEventListener('storage', calculateCount);
      window.removeEventListener('cartUpdated', calculateCount);
    };
  }, []);

  const logoutHandler = () => {
    localStorage.removeItem('userInfo');
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-50 px-4 sm:px-6 lg:px-8 py-3 bg-[#1A1A1A]/95 backdrop-blur-md border-b border-[#D4C5B9]/20 font-sans text-[#F9F6F0]">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        
        {/* Brand Logo */}
        <Link 
          to="/" 
          className="flex items-center gap-2.5 text-xl font-serif font-light tracking-widest text-[#C5A059] hover:opacity-90 transition group"
        >
          <div className="w-9 h-9 rounded-xl bg-[#C5A059]/10 border border-[#C5A059]/30 flex items-center justify-center group-hover:bg-[#C5A059] group-hover:text-[#1A1A1A] transition-all duration-300">
            <Store className="w-5 h-5" />
          </div>
          <span className="tracking-wider uppercase text-sm font-semibold text-[#F9F6F0]">Shop<span className="text-[#C5A059]">Sphere</span></span>
        </Link>

        {/* Central Navigation Links */}
        <nav className="hidden md:flex items-center gap-8 text-xs uppercase tracking-widest text-[#F9F6F0]/80">
          <Link to="/" className="hover:text-[#C5A059] transition-colors py-1 relative group">
            Home
            <span className="absolute bottom-0 left-0 w-0 h-[1.5px] bg-[#C5A059] transition-all duration-300 group-hover:w-full"></span>
          </Link>

          {userInfo && (
            <Link to="/wishlist" className="hover:text-[#C5A059] transition-colors flex items-center gap-1.5 py-1 relative group">
              <Heart className="w-3.5 h-3.5 text-[#C5A059]" /> Wishlist
              <span className="absolute bottom-0 left-0 w-0 h-[1.5px] bg-[#C5A059] transition-all duration-300 group-hover:w-full"></span>
            </Link>
          )}

          {userInfo && userInfo?.role !== 'admin' && (
            <Link to="/cart" className="hover:text-[#C5A059] transition-colors flex items-center gap-1.5 py-1 relative group">
              <ShoppingBag className="w-3.5 h-3.5 text-[#C5A059]" /> Cart
              {cartCount > 0 && (
                <span className="bg-[#C5A059] text-[#1A1A1A] text-[10px] font-bold px-1.5 py-0.2 rounded-full">
                  {cartCount}
                </span>
              )}
              <span className="absolute bottom-0 left-0 w-0 h-[1.5px] bg-[#C5A059] transition-all duration-300 group-hover:w-full"></span>
            </Link>
          )}

          {userInfo?.role === 'vendor' && (
            <Link to="/vendor/dashboard" className="hover:text-[#C5A059] transition-colors flex items-center gap-1.5 py-1 relative group">
              <Package className="w-3.5 h-3.5 text-[#C5A059]" /> Vendor Hub
              <span className="absolute bottom-0 left-0 w-0 h-[1.5px] bg-[#C5A059] transition-all duration-300 group-hover:w-full"></span>
            </Link>
          )}

          {userInfo?.role === 'admin' && (
            <Link to="/admin/dashboard" className="hover:text-[#C5A059] transition-colors flex items-center gap-1.5 py-1 relative group">
              <ShieldAlert className="w-3.5 h-3.5 text-[#C5A059]" /> Admin
              <span className="absolute bottom-0 left-0 w-0 h-[1.5px] bg-[#C5A059] transition-all duration-300 group-hover:w-full"></span>
            </Link>
          )}
        </nav>

        {/* User Account Controls */}
        <div className="flex items-center gap-4">
          {userInfo ? (
            <div className="flex items-center gap-3">
              <Link 
                to="/profile" 
                className="flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-[#D4C5B9]/20 px-3 py-1.5 rounded-full transition text-xs"
              >
                <div className="w-5 h-5 rounded-full bg-[#C5A059] text-[#1A1A1A] flex items-center justify-center font-bold text-[10px]">
                  {userInfo.name?.[0]?.toUpperCase()}
                </div>
                <span className="text-[#F9F6F0] tracking-wider font-medium">{userInfo.name}</span>
              </Link>

              <button
                onClick={logoutHandler}
                title="Logout"
                className="p-2 rounded-full bg-white/5 hover:bg-red-500/20 hover:text-red-400 border border-[#D4C5B9]/20 text-[#F9F6F0]/80 transition cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3 text-xs tracking-wider uppercase font-medium">
              <Link to="/login" className="px-4 py-2 hover:text-[#C5A059] transition">
                Sign In
              </Link>
              <Link 
                to="/register" 
                className="bg-[#C5A059] hover:bg-[#b08d4b] text-[#1A1A1A] px-5 py-2 rounded-full font-semibold transition shadow-sm"
              >
                Get Started
              </Link>
            </div>
          )}
        </div>

      </div>
    </header>
  );
};

export default Navbar;