import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ShoppingBag, ArrowLeft, Star, ShieldCheck, Truck, MessageSquare, Send, Store, AlertCircle, Heart } from 'lucide-react';
import API from '../utils/api';

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Cart & version tracker to sync instantly with navbar & local storage
  const [cartVersion, setCartVersion] = useState(0);
  const [wishlistVersion, setWishlistVersion] = useState(0);

  // Review form states
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewError, setReviewError] = useState('');
  const [reviewSuccess, setReviewSuccess] = useState('');

  const fetchProductDetails = async () => {
    try {
      const res = await API.get(`/products/${id}`);
      setProduct(res.data);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching product:", err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProductDetails();
  }, [id]);

  // Auth & Wishlist Helper Functions
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

  const getUserId = () => {
    try {
      const userInfo = JSON.parse(localStorage.getItem('userInfo'));
      return userInfo?._id || userInfo?.id || 'guest';
    } catch {
      return 'guest';
    }
  };

  const getWishlistItems = () => {
    try {
      const userId = getUserId();
      return JSON.parse(localStorage.getItem(`wishlistItems_${userId}`)) || [];
    } catch {
      return [];
    }
  };

  const isProductInWishlist = (productId) => {
    const wishlist = getWishlistItems();
    return wishlist.some(item => (item._id || item.id) === productId);
  };

  const toggleWishlist = (productItem) => {
    if (!isLoggedIn()) {
      navigate('/login');
      return;
    }

    let wishlist = getWishlistItems();
    const targetId = productItem._id || productItem.id;
    const index = wishlist.findIndex(item => (item._id || item.id) === targetId);

    if (index > -1) {
      wishlist.splice(index, 1);
    } else {
      wishlist.push(productItem);
    }

    const userId = getUserId();
    localStorage.setItem(`wishlistItems_${userId}`, JSON.stringify(wishlist));
    setWishlistVersion(v => v + 1);
  };

  // Cart Helper Functions
  const getCartItems = () => {
    try {
      return JSON.parse(localStorage.getItem('cartItems')) || [];
    } catch {
      return [];
    }
  };

  const getProductQtyInCart = (productId) => {
    const cart = getCartItems();
    const item = cart.find(i => (i._id || i.id) === productId);
    return item ? Number(item.quantity) || 1 : 0;
  };

  const updateCartQuantity = (newQty) => {
    if (!product) return;
    const maxStock = product.stock || 99;
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
    window.dispatchEvent(new Event('cartUpdated'));
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    setReviewError('');
    setReviewSuccess('');

    const userInfo = JSON.parse(localStorage.getItem('userInfo'));
    if (!userInfo || !userInfo.token) {
      setReviewError('You must be logged in to submit a review.');
      return;
    }

    if (!comment.trim()) {
      setReviewError('Please write a comment for your review.');
      return;
    }

    setSubmittingReview(true);
    try {
      await API.post(`/products/${id}/reviews`, { rating, comment }, {
        headers: { Authorization: `Bearer ${userInfo.token}` }
      });
      setReviewSuccess('Review submitted successfully!');
      setComment('');
      setRating(5);
      fetchProductDetails();
    } catch (err) {
      setReviewError(err.response?.data?.message || 'Failed to submit review.');
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) return <div className="min-h-screen bg-[#F9F6F0] text-center py-20 text-[#1A1A1A]/60 text-xs tracking-wider uppercase">Loading product details...</div>;
  if (!product) return <div className="min-h-screen bg-[#F9F6F0] text-center py-20 text-[#1A1A1A]/60 text-xs tracking-wider uppercase">Product not found.</div>;

  const reviews = product.reviews || [];
  const averageRating = reviews.length > 0 
    ? (reviews.reduce((acc, item) => acc + item.rating, 0) / reviews.length).toFixed(1) 
    : 'No ratings yet';

  const productId = product._id || product.id;
  const qtyInCart = getProductQtyInCart(productId);
  const isOutOfStock = product.stock === 0;
  const inWishlist = isProductInWishlist(productId);

  // Extract vendor name safely if it's populated as an object or string
  const vendorName = typeof product.vendor === 'object' && product.vendor !== null
    ? (product.vendor.name || product.vendor.storeName || 'ShopSphere Vendor')
    : 'ShopSphere Official Store';

  return (
    <div className="min-h-screen bg-[#F9F6F0] text-[#1A1A1A] max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 font-sans">
      <button 
        onClick={() => navigate(-1)} 
        className="flex items-center gap-2 text-xs uppercase tracking-wider text-[#1A1A1A]/70 hover:text-[#C5A059] mb-6 transition cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Products
      </button>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 bg-white p-8 md:p-10 rounded-2xl shadow-sm border border-[#D4C5B9]/50">
        {/* Product Image */}
        <div className="flex items-center justify-center bg-[#F9F6F0] rounded-xl overflow-hidden border border-[#D4C5B9]/30 p-6 relative">
          <img 
            src={product.images?.[0] || 'https://via.placeholder.com/400'} 
            alt={product.title} 
            className="max-h-96 object-contain rounded-lg"
          />
        </div>

        {/* Product Info */}
        <div className="flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-semibold uppercase tracking-widest text-[#C5A059] bg-[#F9F6F0] px-3 py-1 rounded-full border border-[#D4C5B9]/30">
                {product.category || 'Marketplace'}
              </span>
              
              {/* Stock Urgency Badge */}
              {product.stock > 0 && product.stock <= 10 ? (
                <span className="text-[10px] font-medium text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full flex items-center gap-1 uppercase tracking-wider border border-amber-200/50">
                  <AlertCircle className="w-3.5 h-3.5" /> Only {product.stock} stock left!
                </span>
              ) : product.stock > 10 ? (
                <span className="text-[10px] font-medium text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full uppercase tracking-wider border border-emerald-200/50">
                  In Stock
                </span>
              ) : (
                <span className="text-[10px] font-medium text-red-700 bg-red-50 px-2.5 py-1 rounded-full uppercase tracking-wider border border-red-200/50">
                  Out of Stock
                </span>
              )}
            </div>

            <h1 className="text-2xl md:text-3xl font-serif font-light text-[#1A1A1A] mt-4 tracking-wide">{product.title}</h1>
            
            {/* Vendor Information Card Snippet */}
            <div className="flex items-center gap-1.5 text-xs text-[#1A1A1A]/60 mt-2 tracking-wider">
              <Store className="w-4 h-4 text-[#C5A059]" />
              <span>Sold by: <strong className="text-[#1A1A1A] font-medium">{vendorName}</strong></span>
            </div>
            
            <div className="flex items-center gap-2 mt-4">
              <div className="flex text-[#C5A059]">
                {[...Array(5)].map((_, i) => (
                  <Star 
                    key={i} 
                    className={`w-4 h-4 ${i < Math.round(Number(averageRating) || 0) ? 'fill-current' : 'text-[#D4C5B9]/40'}`} 
                  />
                ))}
              </div>
              <span className="text-xs font-medium text-[#1A1A1A]/80 tracking-wider">
                {averageRating} {reviews.length > 0 && `(${reviews.length} reviews)`}
              </span>
            </div>

            <div className="text-2xl md:text-3xl font-serif font-medium text-[#C5A059] mt-4">
              ${Number(product.price).toFixed(2)}
            </div>

            <p className="text-[#1A1A1A]/70 mt-4 leading-relaxed text-sm">
              {product.description || 'No description available for this item.'}
            </p>
          </div>

          <div className="mt-8 pt-6 border-t border-[#F9F6F0] space-y-4">
            {/* Cart & Wishlist Controls Row */}
            <div className="flex items-center gap-3">
              {/* Cart Button or Stepper */}
              {isOutOfStock ? (
                <button disabled className="flex-1 py-3.5 rounded-xl text-xs font-semibold uppercase tracking-widest bg-[#D4C5B9]/30 text-[#1A1A1A]/45 cursor-not-allowed">
                  Out of Stock
                </button>
              ) : qtyInCart === 0 ? (
                <button 
                  onClick={() => updateCartQuantity(1)}
                  className="flex-1 bg-[#1A1A1A] hover:bg-[#C5A059] text-[#F9F6F0] hover:text-[#1A1A1A] py-3.5 rounded-xl text-xs uppercase tracking-widest font-semibold transition flex items-center justify-center gap-2 cursor-pointer shadow-sm border border-transparent hover:border-[#C5A059]"
                >
                  <ShoppingBag className="w-4 h-4 text-[#C5A059] group-hover:text-white" /> Add to Cart
                </button>
              ) : (
                <div className="flex-1 flex items-center justify-between border border-[#1A1A1A] rounded-xl overflow-hidden bg-[#F9F6F0] shadow-sm">
                  <button
                    onClick={() => updateCartQuantity(qtyInCart - 1)}
                    className="px-6 py-3 text-[#1A1A1A] hover:bg-[#D4C5B9]/30 transition text-sm font-bold cursor-pointer"
                  >
                    -
                  </button>
                  <span className="text-xs uppercase tracking-widest font-bold text-[#1A1A1A]">{qtyInCart} in cart</span>
                  <button
                    onClick={() => updateCartQuantity(qtyInCart + 1)}
                    className="px-6 py-3 text-[#1A1A1A] hover:bg-[#D4C5B9]/30 transition text-sm font-bold cursor-pointer"
                  >
                    +
                  </button>
                </div>
              )}

              {/* Wishlist Heart Button */}
              <button
                onClick={() => toggleWishlist(product)}
                title={inWishlist ? "Remove from Wishlist" : "Save to Wishlist"}
                className="p-3.5 bg-white hover:bg-[#F9F6F0] border border-[#D4C5B9]/60 rounded-xl transition shadow-sm cursor-pointer flex items-center justify-center group"
              >
                <Heart 
                  className={`w-5 h-5 transition-colors ${
                    inWishlist 
                      ? 'text-red-500 fill-red-500' 
                      : 'text-[#1A1A1A] group-hover:text-[#C5A059]'
                  }`} 
                />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-2 text-[10px] uppercase tracking-widest text-[#1A1A1A]/60">
              <div className="flex items-center gap-2">
                <Truck className="w-4 h-4 text-[#C5A059]" /> Fast Delivery Available
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#C5A059]" /> Secure Checkout & Protection
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Customer Reviews Section */}
      <div className="mt-10 bg-white p-8 md:p-10 rounded-2xl shadow-sm border border-[#D4C5B9]/50">
        <h2 className="text-xl md:text-2xl font-serif font-light text-[#1A1A1A] mb-6 flex items-center gap-3 tracking-wide">
          <MessageSquare className="w-5 h-5 text-[#C5A059]" /> Customer Reviews ({reviews.length})
        </h2>

        {/* Existing Reviews List */}
        <div className="space-y-6 mb-10 divide-y divide-[#F9F6F0]">
          {reviews.length === 0 ? (
            <p className="text-[#1A1A1A]/60 text-xs tracking-wider uppercase pt-2">No reviews yet. Be the first to review this product!</p>
          ) : (
            reviews.map((rev, index) => (
              <div key={index} className="pt-6 first:pt-0">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-serif font-medium text-[#1A1A1A] text-sm tracking-wide">{rev.name || 'Verified Customer'}</span>
                  <span className="text-[10px] text-[#1A1A1A]/40 uppercase tracking-widest">
                    {rev.createdAt ? new Date(rev.createdAt).toLocaleDateString() : 'Recent'}
                  </span>
                </div>
                <div className="flex text-[#C5A059] mb-2">
                  {[...Array(5)].map((_, i) => (
                    <Star 
                      key={i} 
                      className={`w-3.5 h-3.5 ${i < rev.rating ? 'fill-current' : 'text-[#D4C5B9]/40'}`} 
                    />
                  ))}
                </div>
                <p className="text-[#1A1A1A]/70 text-sm leading-relaxed">{rev.comment}</p>
              </div>
            ))
          )}
        </div>

        {/* Write a Review Form */}
        <div className="bg-[#F9F6F0] p-6 md:p-8 rounded-xl border border-[#D4C5B9]/40">
          <h3 className="text-base font-serif font-medium text-[#1A1A1A] mb-4 tracking-wide">Write a Customer Review</h3>
          
          {reviewError && <div className="mb-4 text-xs tracking-wider uppercase text-white bg-[#1A1A1A] border border-red-500 p-3.5 rounded-xl">{reviewError}</div>}
          {reviewSuccess && <div className="mb-4 text-xs tracking-wider uppercase text-[#1A1A1A] bg-emerald-50 border border-emerald-200 p-3.5 rounded-xl">{reviewSuccess}</div>}

          <form onSubmit={handleReviewSubmit} className="space-y-4">
            <div>
              <label className="block text-[10px] font-semibold text-[#1A1A1A]/60 uppercase tracking-widest mb-1.5">Rating</label>
              <select 
                value={rating} 
                onChange={(e) => setRating(Number(e.target.value))}
                className="w-full sm:w-48 bg-white border border-[#D4C5B9]/60 rounded-xl p-3 text-xs uppercase tracking-wider text-[#1A1A1A] focus:ring-1 focus:ring-[#C5A059] focus:outline-none"
              >
                <option value="5">5 - Excellent</option>
                <option value="4">4 - Good</option>
                <option value="3">3 - Average</option>
                <option value="2">2 - Poor</option>
                <option value="1">1 - Terrible</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-semibold text-[#1A1A1A]/60 uppercase tracking-widest mb-1.5">Comment</label>
              <textarea 
                rows="3"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="What did you like or dislike about this product?"
                className="w-full bg-white border border-[#D4C5B9]/60 rounded-xl p-3 text-sm text-[#1A1A1A] focus:ring-1 focus:ring-[#C5A059] focus:outline-none placeholder:text-[#1A1A1A]/30"
              ></textarea>
            </div>

            <button 
              type="submit"
              disabled={submittingReview}
              className="bg-[#1A1A1A] hover:bg-[#C5A059] text-[#F9F6F0] font-semibold px-6 py-3 rounded-xl text-xs uppercase tracking-widest transition flex items-center gap-2 cursor-pointer shadow-sm disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5 text-[#C5A059] group-hover:text-white" /> {submittingReview ? 'Submitting...' : 'Submit Review'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;