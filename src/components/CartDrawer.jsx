import React, { useState, useEffect } from 'react';
import { X, ShoppingBag, Trash2, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const CartDrawer = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);

  const loadCart = () => {
    try {
      const items = JSON.parse(localStorage.getItem('cartItems')) || [];
      setCartItems(items);
    } catch {
      setCartItems([]);
    }
  };

  useEffect(() => {
    loadCart();
    window.addEventListener('storage', loadCart);
    window.addEventListener('cartUpdated', loadCart);
    return () => {
      window.removeEventListener('storage', loadCart);
      window.removeEventListener('cartUpdated', loadCart);
    };
  }, [isOpen]);

  const updateQty = (id, newQty) => {
    let items = [...cartItems];
    const index = items.findIndex(i => (i._id || i.id) === id);
    if (index > -1) {
      if (newQty <= 0) {
        items.splice(index, 1);
      } else {
        items[index].quantity = newQty;
      }
      setCartItems(items);
      localStorage.setItem('cartItems', JSON.stringify(items));
      window.dispatchEvent(new Event('storage'));
      window.dispatchEvent(new Event('cartUpdated'));
    }
  };

  const removeItem = (id) => {
    const items = cartItems.filter(i => (i._id || i.id) !== id);
    setCartItems(items);
    localStorage.setItem('cartItems', JSON.stringify(items));
    window.dispatchEvent(new Event('storage'));
    window.dispatchEvent(new Event('cartUpdated'));
  };

  const subtotal = cartItems.reduce((acc, item) => acc + (Number(item.price) * (Number(item.quantity) || 1)), 0);
  const freeShippingThreshold = 100;
  const progress = Math.min((subtotal / freeShippingThreshold) * 100, 100);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col">
          
          {/* Drawer Header */}
          <div className="p-6 bg-slate-900 text-white flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-indigo-400" />
              <h2 className="text-lg font-bold">Your Shopping Cart</h2>
            </div>
            <button 
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Free Shipping Progress Bar */}
          <div className="bg-indigo-50 p-4 border-b border-indigo-100">
            <div className="flex justify-between text-xs font-semibold text-indigo-900 mb-1.5">
              <span>{subtotal >= freeShippingThreshold ? "🎉 You've unlocked free shipping!" : `Add $${(freeShippingThreshold - subtotal).toFixed(2)} more for Free Shipping`}</span>
              <span>{progress.toFixed(0)}%</span>
            </div>
            <div className="w-full bg-indigo-200 h-2 rounded-full overflow-hidden">
              <div 
                className="bg-indigo-600 h-full transition-all duration-300 rounded-full" 
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {cartItems.length === 0 ? (
              <div className="text-center py-20 text-slate-400">
                <ShoppingBag className="w-12 h-12 mx-auto mb-3 stroke-1" />
                <p className="text-base font-medium text-slate-600">Your cart is empty</p>
                <p className="text-xs text-slate-400 mt-1">Explore our marketplace to add items!</p>
              </div>
            ) : (
              cartItems.map((item) => {
                const itemId = item._id || item.id;
                return (
                  <div key={itemId} className="flex gap-4 p-3 bg-slate-50 rounded-xl border border-slate-100 items-center">
                    <img 
                      src={item.images?.[0] || 'https://via.placeholder.com/80'} 
                      alt={item.title} 
                      className="w-16 h-16 object-cover rounded-lg border border-slate-200"
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-semibold text-slate-900 truncate">{item.title}</h3>
                      <p className="text-xs font-bold text-indigo-600 mt-0.5">${Number(item.price).toFixed(2)}</p>
                      
                      <div className="flex items-center gap-3 mt-2">
                        <div className="flex items-center border border-slate-300 rounded bg-white overflow-hidden">
                          <button 
                            onClick={() => updateQty(itemId, item.quantity - 1)}
                            className="px-2 py-0.5 text-slate-600 hover:bg-slate-100 text-xs font-bold"
                          >
                            -
                          </button>
                          <span className="px-2.5 text-xs font-semibold">{item.quantity}</span>
                          <button 
                            onClick={() => updateQty(itemId, item.quantity + 1)}
                            className="px-2 py-0.5 text-slate-600 hover:bg-slate-100 text-xs font-bold"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </div>

                    <button 
                      onClick={() => removeItem(itemId)}
                      className="text-slate-400 hover:text-red-600 p-2 transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                );
              })
            )}
          </div>

          {/* Drawer Footer */}
          {cartItems.length > 0 && (
            <div className="p-6 border-t border-slate-100 bg-white">
              <div className="flex justify-between items-center mb-4">
                <span className="text-slate-600 font-medium">Subtotal</span>
                <span className="text-xl font-extrabold text-slate-900">${subtotal.toFixed(2)}</span>
              </div>
              <button 
                onClick={() => {
                  onClose();
                  navigate('/cart');
                }}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-xl font-medium shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
              >
                Proceed to Checkout <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default CartDrawer;