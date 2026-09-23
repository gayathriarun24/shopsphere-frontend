import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import API from '../utils/api';
import { Store, ShoppingBag, Search, CheckCircle, AlertCircle, Heart, Filter, RotateCcw, Star, X, ChevronDown } from 'lucide-react';

const Home = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  
  const [cartVersion, setCartVersion] = useState(0);
  const [wishlistVersion, setWishlistVersion] = useState(0);

  // 10 Curated High-End Lifestyle Images for the Hero Slider
  const heroImages = [
    'https://images.unsplash.com/photo-1513694203232-719a280e022f?q=80&w=2000&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?q=80&w=2000&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?q=80&w=2000&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1524758631624-e2822e304c36?q=80&w=2000&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1538688525198-9b88f6f53126?q=80&w=2000&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?q=80&w=2000&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1507652313519-d4e9174996dd?q=80&w=2000&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?q=80&w=2000&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?q=80&w=2000&auto=format&fit=crop](https://images.unsplash.com/photo-1513519245088-0e12902e5a38?q=80&w=2000&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=2000&auto=format&fit=crop'
  ];
  const [currentSlide, setCurrentSlide] = useState(0);

  // Auto-slide effect every 5 seconds with smooth crossfade
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroImages.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [heroImages.length]);

  // Filter States
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [maxPrice, setMaxPrice] = useState(1000); 
  const [minRating, setMinRating] = useState(0);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [showFiltersModal, setShowFiltersModal] = useState(false);

  // Available Categories
  const [categories, setCategories] = useState(['All']);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await API.get('/products');
        setProducts(res.data);
        
        const uniqueCategories = ['All', ...new Set(res.data.map(p => p.category).filter(Boolean))];
        setCategories(uniqueCategories);
        setLoading(false);
      } catch (err) {
        setError('Failed to load marketplace products');
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

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

  const getCartItems = () => {
    try {
      return JSON.parse(localStorage.getItem('cartItems')) || [];
    } catch {
      return [];
    }
  };

  const getWishlistItems = () => {
    try {
      const userInfo = JSON.parse(localStorage.getItem('userInfo'));
      const userId = userInfo?._id || userInfo?.id || 'guest';
      return JSON.parse(localStorage.getItem(`wishlistItems_${userId}`)) || [];
    } catch {
      return [];
    }
  };

  const isProductInWishlist = (productId) => {
    const wishlist = getWishlistItems();
    return wishlist.some(item => (item._id || item.id) === productId);
  };

  const toggleWishlist = (product) => {
    if (!isLoggedIn()) {
      setError('Please log in or sign up to use your wishlist.');
      setTimeout(() => navigate('/login'), 1500);
      return;
    }

    let wishlist = getWishlistItems();
    const targetId = product._id || product.id;
    const index = wishlist.findIndex(item => (item._id || item.id) === targetId);

    if (index > -1) {
      wishlist.splice(index, 1);
      setSuccessMessage(`Removed "${product.title}" from wishlist.`);
    } else {
      wishlist.push(product);
      setSuccessMessage(`Added "${product.title}" to wishlist!`);
    }

    const userInfo = JSON.parse(localStorage.getItem('userInfo'));
    const userId = userInfo?._id || userInfo?.id || 'guest';

    localStorage.setItem(`wishlistItems_${userId}`, JSON.stringify(wishlist));
    setWishlistVersion(v => v + 1);
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  const getProductQtyInCart = (productId) => {
    const cart = getCartItems();
    const item = cart.find(i => (i._id || i.id) === productId);
    return item ? Number(item.quantity) || 1 : 0;
  };

  const updateCartQuantity = (product, newQty, maxStock) => {
    if (!isLoggedIn()) {
      setError('Please log in or sign up to add items to your cart.');
      setTimeout(() => {
        navigate('/login');
      }, 1500);
      return;
    }

    if (newQty < 0 || newQty > maxStock) return;

    let cart = getCartItems();
    const targetId = product._id || product.id;
    const itemIndex = cart.findIndex(item => (item._id || item.id) === targetId);

    if (newQty === 0) {
      if (itemIndex > -1) {
        cart.splice(itemIndex, 1);
      }
    } else {
      if (itemIndex > -1) {
        cart[itemIndex].quantity = newQty;
      } else {
        cart.push({ ...product, quantity: newQty });
      }
    }

    localStorage.setItem('cartItems', JSON.stringify(cart));
    setCartVersion(v => v + 1);
    window.dispatchEvent(new Event('storage'));
  };

  const handleAddToCartFirstTime = (product) => {
    updateCartQuantity(product, 1, product.stock);
    if (isLoggedIn()) {
      setSuccessMessage(`Added "${product.title}" to cart!`);
      setTimeout(() => setSuccessMessage(''), 3000);
    }
  };

  const resetFilters = () => {
    setSelectedCategory('All');
    setMaxPrice(1000);
    setMinRating(0);
    setInStockOnly(false);
    setSearchTerm('');
  };

  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          product.category.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;
    const matchesPrice = product.price <= maxPrice;
    const productRating = product.rating || 4; 
    const matchesRating = productRating >= minRating;
    const matchesStock = !inStockOnly || product.stock > 0;

    return matchesSearch && matchesCategory && matchesPrice && matchesRating && matchesStock;
  });

  return (
    <div className="min-h-screen bg-[#F9F6F0] text-[#1A1A1A] font-sans">
      
      {/* Toast Notifications */}
      {successMessage && (
        <div className="fixed top-6 right-6 z-50 bg-[#1A1A1A] text-[#F9F6F0] border border-[#C5A059] px-5 py-3 rounded-xl shadow-2xl flex items-center gap-2 text-xs tracking-wider uppercase animate-fadeIn">
          <CheckCircle className="w-4 h-4 text-[#C5A059]" />
          <span>{successMessage}</span>
        </div>
      )}

      {error && (
        <div className="fixed top-6 right-6 z-50 bg-[#1A1A1A] text-white border border-red-500 px-5 py-3 rounded-xl shadow-2xl flex items-center gap-2 text-xs tracking-wider uppercase animate-fadeIn">
          <AlertCircle className="w-4 h-4 text-red-400" />
          <span>{error}</span>
        </div>
      )}

      {/* Automatic 10-Image Sliding Hero Banner with Lighter Gradient Overlay */}
      <div className="relative bg-[#1A1A1A] text-[#F9F6F0] overflow-hidden">
        {/* Background Slider Images with Smooth Crossfade & Increased Opacity */}
        {heroImages.map((img, index) => (
          <div
            key={img}
            className={`absolute inset-0 bg-cover bg-center transition-all duration-1000 transform ${
              index === currentSlide 
                ? 'opacity-55 scale-100' 
                : 'opacity-0 scale-105 pointer-events-none'
            }`}
            style={{ backgroundImage: `url('${img}')` }}
          />
        ))}
        {/* Lighter gradient overlay for improved image clarity */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#1A1A1A]/85 via-[#1A1A1A]/55 to-transparent" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28 relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-7 space-y-6">
            <span className="text-[11px] font-medium tracking-[0.25em] text-[#C5A059] uppercase block">
              Curated Marketplace & Ecosystem
            </span>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif font-light leading-tight tracking-wide drop-shadow-md">
              Artisan Collections & Independent Vendors.
            </h1>
            <p className="text-[#E2D8CF] text-sm sm:text-base font-light max-w-xl leading-relaxed drop-shadow">
              Explore timeless designs, handcrafted goods, and exclusive multi-vendor inventories gathered in one refined space.
            </p>

            <div className="pt-2 max-w-md relative">
              <Search className="w-4 h-4 text-[#1A1A1A] absolute left-4 top-4.5" />
              <input
                type="text"
                placeholder="Search collections, pieces, or vendors..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-4 rounded-xl text-[#1A1A1A] bg-white focus:outline-none focus:ring-2 focus:ring-[#C5A059] shadow-2xl text-xs tracking-wider transition-all placeholder:text-slate-400"
              />
            </div>

            {/* Slide Indicators / Dots for all 10 images */}
            <div className="flex items-center gap-1.5 pt-3 overflow-x-auto max-w-full pb-2 scrollbar-none">
              {heroImages.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentSlide(idx)}
                  className={`h-1.5 rounded-full transition-all cursor-pointer ${
                    idx === currentSlide ? 'w-6 bg-[#C5A059]' : 'w-2 bg-white/50 hover:bg-white/80'
                  }`}
                  aria-label={`Go to slide ${idx + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Scalable Category & Filter Control Bar */}
      <div className="sticky top-0 z-30 bg-[#F9F6F0]/95 backdrop-blur-md border-b border-[#D4C5B9]/40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-col sm:flex-row justify-between items-center gap-4">
          
          {/* Professional Scalable Category Dropdown Selector */}
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <span className="text-[11px] uppercase tracking-widest text-[#1A1A1A]/60 font-medium hidden md:inline">Category:</span>
            <div className="relative w-full sm:w-72">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full appearance-none bg-white border border-[#D4C5B9]/70 hover:border-[#1A1A1A] text-[#1A1A1A] text-xs uppercase tracking-wider font-medium rounded-xl px-4 py-2.5 pr-10 focus:outline-none focus:ring-2 focus:ring-[#C5A059] transition cursor-pointer shadow-sm"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat === 'All' ? 'All Categories' : cat}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-[#1A1A1A]/50 absolute right-3.5 top-3 pointer-events-none" />
            </div>
          </div>

          {/* Filter Modal Trigger & Count Badge */}
          <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end border-t sm:border-t-0 pt-3 sm:pt-0 border-[#D4C5B9]/30">
            <span className="text-[11px] text-[#1A1A1A]/60 uppercase tracking-widest font-medium">
              Showing <strong className="text-[#1A1A1A]">{filteredProducts.length}</strong> items
            </span>
            <button
              onClick={() => setShowFiltersModal(true)}
              className="flex items-center gap-2 bg-white border border-[#D4C5B9]/70 hover:border-[#1A1A1A] px-4 py-2.5 rounded-xl text-xs uppercase tracking-widest font-medium transition cursor-pointer shadow-sm text-[#1A1A1A]"
            >
              <Filter className="w-3.5 h-3.5 text-[#C5A059]" />
              <span>Advanced Filters</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Product Grid Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {loading ? (
          <div className="text-center py-24 text-[#1A1A1A]/60 bg-white rounded-2xl border border-[#D4C5B9]/40 tracking-wider text-xs uppercase shadow-sm">
            Loading marketplace inventory...
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-24 bg-white rounded-2xl shadow-sm border border-[#D4C5B9]/40 p-8 max-w-md mx-auto">
            <p className="text-[#1A1A1A] font-serif text-lg mb-3">No pieces match your criteria.</p>
            <p className="text-xs text-[#1A1A1A]/60 mb-6 uppercase tracking-wider">Try resetting your filters or search term.</p>
            <button
              onClick={resetFilters}
              className="text-xs bg-[#1A1A1A] text-[#F9F6F0] border border-[#C5A059] px-6 py-3 rounded-xl font-medium hover:bg-[#C5A059] hover:text-[#1A1A1A] transition cursor-pointer uppercase tracking-widest shadow-sm"
            >
              Reset All Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            {filteredProducts.map((product) => {
              const qtyInCart = getProductQtyInCart(product._id);
              const isOutOfStock = product.stock === 0;
              const inWishlist = isProductInWishlist(product._id);

              return (
                <div 
                  key={product._id} 
                  className="bg-white rounded-2xl shadow-sm border border-[#D4C5B9]/40 overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 flex flex-col justify-between group"
                >
                  <div>
                    {/* Product Image Frame */}
                    <div className="block h-72 bg-[#F9F6F0] overflow-hidden relative">
                      <Link to={`/product/${product._id}`} className="block w-full h-full">
                        {product.images && product.images.length > 0 ? (
                          <img 
                            src={product.images[0]} 
                            alt={product.title} 
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-[#1A1A1A]/40 text-xs tracking-wider uppercase">No Image</div>
                        )}
                      </Link>
                      
                      {/* Wishlist Button */}
                      <button
                        onClick={() => toggleWishlist(product)}
                        className="absolute top-3 right-3 bg-white/90 hover:bg-white p-2.5 rounded-full shadow-md backdrop-blur-md transition cursor-pointer"
                        title={inWishlist ? "Remove from Wishlist" : "Save to Wishlist"}
                      >
                        <Heart className={`w-4 h-4 ${inWishlist ? 'text-red-500 fill-red-500' : 'text-[#1A1A1A]'}`} />
                      </button>

                      {/* Category Badge */}
                      <span className="absolute top-3 left-3 bg-[#1A1A1A]/80 text-[#F9F6F0] text-[10px] font-medium px-3 py-1 rounded-full backdrop-blur-md uppercase tracking-widest border border-[#D4C5B9]/20">
                        {product.category}
                      </span>
                    </div>

                    {/* Product Content Details */}
                    <div className="p-5">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-1.5 text-[10px] text-[#1A1A1A]/70 uppercase tracking-wider">
                          <Store className="w-3 h-3 text-[#C5A059]" />
                          <span>{product.vendor?.storeName || 'Store'}</span>
                        </div>
                        <span className={`text-[10px] font-bold uppercase tracking-wider ${isOutOfStock ? 'text-red-500' : product.stock <= 10 ? 'text-[#C5A059]' : 'text-transparent'}`}>
                          {isOutOfStock ? 'Sold Out' : product.stock <= 10 ? `Only ${product.stock} left` : '.'}
                        </span>
                      </div>

                      <Link to={`/product/${product._id}`}>
                        <h3 className="font-serif font-medium text-[#1A1A1A] text-sm mb-1.5 line-clamp-1 hover:text-[#C5A059] transition tracking-wide">{product.title}</h3>
                      </Link>
                      <p className="text-[#1A1A1A]/60 text-xs mb-3 line-clamp-2 font-light leading-relaxed">{product.description}</p>
                    </div>
                  </div>

                  {/* Card Footer / Actions */}
                  <div className="p-5 pt-0 border-t border-[#F9F6F0] mt-auto">
                    <div className="flex items-center justify-between mb-3 pt-3">
                      <span className="text-base font-serif font-medium text-[#1A1A1A]">${product.price.toFixed(2)}</span>
                    </div>

                    {isOutOfStock ? (
                      <button disabled className="w-full py-2.5 rounded-xl text-[11px] font-medium uppercase tracking-widest bg-[#F9F6F0] text-[#1A1A1A]/40 cursor-not-allowed border border-[#D4C5B9]/30">
                        Out of Stock
                      </button>
                    ) : qtyInCart === 0 ? (
                      <button
                        onClick={() => handleAddToCartFirstTime(product)}
                        className="w-full bg-[#1A1A1A] hover:bg-[#C5A059] text-[#F9F6F0] hover:text-[#1A1A1A] py-2.5 rounded-xl text-[11px] font-medium tracking-widest uppercase transition-all shadow-sm cursor-pointer border border-transparent hover:border-[#C5A059]"
                      >
                        Add to Cart
                      </button>
                    ) : (
                      <div className="flex items-center justify-between border border-[#1A1A1A] rounded-xl overflow-hidden bg-[#F9F6F0]">
                        <button
                          onClick={() => updateCartQuantity(product, qtyInCart - 1, product.stock)}
                          className="px-3 py-2 text-[#1A1A1A] hover:bg-[#D4C5B9]/40 transition text-sm font-medium cursor-pointer"
                        >
                          -
                        </button>
                        <span className="text-[11px] font-semibold text-[#1A1A1A] tracking-wider uppercase">{qtyInCart} in cart</span>
                        <button
                          onClick={() => updateCartQuantity(product, qtyInCart + 1, product.stock)}
                          className="px-3 py-2 text-[#1A1A1A] hover:bg-[#D4C5B9]/40 transition text-sm font-medium cursor-pointer"
                        >
                          +
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Slide-over Advanced Filters Modal */}
      {showFiltersModal && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white w-full max-w-md h-full shadow-2xl p-6 sm:p-8 flex flex-col justify-between overflow-y-auto border-l border-[#D4C5B9]/50">
            
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-[#F9F6F0] mb-6">
                <h3 className="font-serif font-medium text-lg text-[#1A1A1A] flex items-center gap-2 tracking-wide">
                  <Filter className="w-4 h-4 text-[#C5A059]" /> Refined Filters
                </h3>
                <button
                  onClick={() => setShowFiltersModal(false)}
                  className="p-2 rounded-full hover:bg-[#F9F6F0] text-[#1A1A1A] transition cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Price Range Slider */}
              <div className="mb-6">
                <div className="flex justify-between items-center mb-2">
                  <label className="text-[11px] font-semibold text-[#1A1A1A] uppercase tracking-widest">Max Price</label>
                  <span className="text-xs font-bold text-[#C5A059]">${maxPrice}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1000"
                  step="10"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(Number(e.target.value))}
                  className="w-full accent-[#C5A059] cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-[#1A1A1A]/50 mt-1 font-medium">
                  <span>$0</span>
                  <span>$500</span>
                  <span>$1000+</span>
                </div>
              </div>

              {/* Minimum Star Ratings */}
              <div className="mb-6 pt-6 border-t border-[#F9F6F0]">
                <label className="block text-[11px] font-semibold text-[#1A1A1A] uppercase tracking-widest mb-3">Minimum Rating</label>
                <div className="space-y-2.5">
                  {[4, 3, 2, 1, 0].map((rating) => (
                    <label key={rating} className="flex items-center gap-2 cursor-pointer text-xs text-[#1A1A1A]/80 hover:text-[#1A1A1A]">
                      <input
                        type="radio"
                        name="minRatingModal"
                        checked={minRating === rating}
                        onChange={() => setMinRating(rating)}
                        className="accent-[#C5A059] cursor-pointer"
                      />
                      <div className="flex items-center gap-1 text-amber-500 font-medium">
                        {rating === 0 ? (
                          <span className="text-[#1A1A1A]/70">All Ratings</span>
                        ) : (
                          <>
                            {[...Array(rating)].map((_, i) => (
                              <Star key={i} className="w-3.5 h-3.5 fill-[#C5A059] text-[#C5A059]" />
                            ))}
                            <span className="text-[#1A1A1A]/70 ml-1">& Up</span>
                          </>
                        )}
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Stock Status Filter */}
              <div className="pt-6 border-t border-[#F9F6F0]">
                <label className="flex items-center gap-3 cursor-pointer text-[11px] font-semibold text-[#1A1A1A] uppercase tracking-widest">
                  <input
                    type="checkbox"
                    checked={inStockOnly}
                    onChange={(e) => setInStockOnly(e.target.checked)}
                    className="w-4 h-4 accent-[#C5A059] rounded cursor-pointer"
                  />
                  In-Stock Items Only
                </label>
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="pt-6 border-t border-[#F9F6F0] flex gap-3">
              <button
                onClick={resetFilters}
                className="flex-1 bg-[#F9F6F0] text-[#1A1A1A] border border-[#D4C5B9] py-3 rounded-xl text-xs uppercase tracking-widest font-medium hover:bg-[#D4C5B9]/30 transition cursor-pointer flex items-center justify-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Reset
              </button>
              <button
                onClick={() => setShowFiltersModal(false)}
                className="flex-1 bg-[#1A1A1A] text-[#F9F6F0] py-3 rounded-xl text-xs uppercase tracking-widest font-medium hover:bg-[#C5A059] hover:text-[#1A1A1A] transition cursor-pointer shadow-sm"
              >
                Apply Filters
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default Home;