import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import API from '../utils/api';
import { User, Mail, Shield, Package, CheckCircle, AlertCircle, Edit2, Save, X, Lock, Eye, EyeOff, Heart, ShoppingBag, ArrowRight } from 'lucide-react';

const Profile = () => {
  const navigate = useNavigate();
  const [userInfo, setUserInfo] = useState(null);
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'security'
  
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  
  // Password change states
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Show/Hide password visibility toggles
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [error, setError] = useState('');

  // Quick stats counts
  const [wishlistCount, setWishlistCount] = useState(0);
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('userInfo');
      if (storedUser) {
        const parsed = JSON.parse(storedUser);
        setUserInfo(parsed);
        setName(parsed.name || '');
        setEmail(parsed.email || '');
      } else {
        navigate('/login');
      }

      const wishlist = JSON.parse(localStorage.getItem('wishlistItems')) || [];
      setWishlistCount(wishlist.length);

      const cart = JSON.parse(localStorage.getItem('cartItems')) || [];
      setCartCount(cart.reduce((acc, item) => acc + (Number(item.quantity) || 1), 0));
    } catch (err) {
      navigate('/login');
    }
  }, [navigate]);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccessMessage('');

    try {
      const { data } = await API.put('/users/profile', { name, email });
      const updatedUser = { ...userInfo, name: data.name || name, email: data.email || email };
      localStorage.setItem('userInfo', JSON.stringify(updatedUser));
      setUserInfo(updatedUser);
      
      setSuccessMessage('Profile updated successfully!');
      setIsEditing(false);
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile.');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setError('New passwords do not match.');
      return;
    }
    setLoading(true);
    setError('');
    setSuccessMessage('');

    try {
      await API.put('/users/profile', { currentPassword, password: newPassword });
      setSuccessMessage('Password updated successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update password. Check your backend route.');
    } finally {
      setLoading(false);
    }
  };

  if (!userInfo) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 relative bg-[#F9F6F0] min-h-screen text-[#1A1A1A] font-sans">
      {/* Toast Notifications */}
      {successMessage && (
        <div className="fixed top-6 right-6 z-50 bg-[#1A1A1A] text-[#F9F6F0] border border-[#C5A059] px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-2 text-xs tracking-wider uppercase">
          <CheckCircle className="w-4 h-4 text-[#C5A059]" />
          <span>{successMessage}</span>
        </div>
      )}

      {error && (
        <div className="fixed top-6 right-6 z-50 bg-[#1A1A1A] text-white border border-red-500 px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-2 text-xs tracking-wider uppercase">
          <AlertCircle className="w-4 h-4 text-red-400" />
          <span>{error}</span>
        </div>
      )}

      {/* Page Header Title */}
      <div className="mb-8 border-b border-[#D4C5B9]/40 pb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <span className="text-[10px] uppercase tracking-[0.2em] text-[#C5A059] font-semibold">User Dashboard</span>
          <h1 className="text-3xl font-serif font-light text-[#1A1A1A] mt-1">Account & Security</h1>
        </div>
        <div className="text-xs text-[#1A1A1A]/70 tracking-wider">
          Manage your personal information and credentials.
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Sidebar: Profile Card & Navigation */}
        <div className="lg:col-span-4 space-y-6">
          {/* Profile Overview Card */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-[#D4C5B9]/60 text-center relative overflow-hidden">
            <div className="w-20 h-20 bg-[#F9F6F0] text-[#C5A059] rounded-full flex items-center justify-center text-2xl font-serif font-bold mx-auto mb-4 border border-[#D4C5B9]/50 shadow-inner">
              {userInfo.name ? userInfo.name.charAt(0).toUpperCase() : 'U'}
            </div>
            
            <h2 className="font-serif font-medium text-lg text-[#1A1A1A]">{userInfo.name}</h2>
            <p className="text-xs text-[#1A1A1A]/60 font-light mt-0.5">{userInfo.email}</p>

            <div className="mt-4 inline-flex items-center gap-1.5 bg-[#F9F6F0] border border-[#D4C5B9]/40 px-3.5 py-1.5 rounded-full text-[11px] font-medium text-[#1A1A1A]/80 tracking-wider uppercase">
              <Shield className="w-3.5 h-3.5 text-[#C5A059]" />
              <span>{userInfo.role || 'Customer'}</span>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 gap-3 mt-6 pt-6 border-t border-[#F9F6F0]">
              <div className="bg-[#F9F6F0]/60 p-3 rounded-2xl border border-[#D4C5B9]/30 text-center">
                <span className="block font-serif font-medium text-base text-[#C5A059]">{wishlistCount}</span>
                <span className="text-[10px] text-[#1A1A1A]/60 uppercase tracking-widest flex items-center justify-center gap-1 mt-0.5">
                  <Heart className="w-3 h-3 text-red-500" /> Wishlist
                </span>
              </div>
              <div className="bg-[#F9F6F0]/60 p-3 rounded-2xl border border-[#D4C5B9]/30 text-center">
                <span className="block font-serif font-medium text-base text-[#C5A059]">{cartCount}</span>
                <span className="text-[10px] text-[#1A1A1A]/60 uppercase tracking-widest flex items-center justify-center gap-1 mt-0.5">
                  <ShoppingBag className="w-3 h-3 text-[#C5A059]" /> In Cart
                </span>
              </div>
            </div>
          </div>

          {/* Navigation Menu */}
          <div className="bg-white p-3 rounded-3xl shadow-sm border border-[#D4C5B9]/60 space-y-1">
            <button
              onClick={() => setActiveTab('overview')}
              className={`w-full text-left px-5 py-3.5 rounded-2xl text-xs font-medium tracking-wider uppercase transition flex items-center justify-between cursor-pointer ${
                activeTab === 'overview'
                  ? 'bg-[#1A1A1A] text-[#F9F6F0] shadow-sm'
                  : 'text-[#1A1A1A]/70 hover:bg-[#F9F6F0] hover:text-[#1A1A1A]'
              }`}
            >
              <span className="flex items-center gap-2.5">
                <User className={`w-4 h-4 ${activeTab === 'overview' ? 'text-[#C5A059]' : 'text-[#C5A059]'}`} /> Account Details
              </span>
              <ArrowRight className="w-3.5 h-3.5 opacity-60" />
            </button>

            <button
              onClick={() => setActiveTab('security')}
              className={`w-full text-left px-5 py-3.5 rounded-2xl text-xs font-medium tracking-wider uppercase transition flex items-center justify-between cursor-pointer ${
                activeTab === 'security'
                  ? 'bg-[#1A1A1A] text-[#F9F6F0] shadow-sm'
                  : 'text-[#1A1A1A]/70 hover:bg-[#F9F6F0] hover:text-[#1A1A1A]'
              }`}
            >
              <span className="flex items-center gap-2.5">
                <Lock className={`w-4 h-4 ${activeTab === 'security' ? 'text-[#C5A059]' : 'text-[#C5A059]'}`} /> Security & Password
              </span>
              <ArrowRight className="w-3.5 h-3.5 opacity-60" />
            </button>

            
          </div>
        </div>

        {/* Right Content Panel */}
        <div className="lg:col-span-8 bg-white p-6 sm:p-10 rounded-3xl shadow-sm border border-[#D4C5B9]/60">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center border-b border-[#F9F6F0] pb-4">
                <div>
                  <h2 className="text-lg font-serif font-medium text-[#1A1A1A]">Personal Information</h2>
                  <p className="text-xs text-[#1A1A1A]/60 font-light mt-0.5">Update your account details and contact info.</p>
                </div>
                {!isEditing ? (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="flex items-center gap-1.5 text-xs bg-[#F9F6F0] text-[#1A1A1A] border border-[#D4C5B9]/60 hover:bg-[#1A1A1A] hover:text-[#F9F6F0] px-4 py-2.5 rounded-xl font-medium transition cursor-pointer tracking-wider uppercase shadow-sm"
                  >
                    <Edit2 className="w-3.5 h-3.5 text-[#C5A059]" /> Edit Profile
                  </button>
                ) : (
                  <button
                    onClick={() => setIsEditing(false)}
                    className="flex items-center gap-1.5 text-xs bg-[#F9F6F0] text-[#1A1A1A] border border-[#D4C5B9]/60 hover:bg-red-50 hover:text-red-500 px-4 py-2.5 rounded-xl font-medium transition cursor-pointer tracking-wider uppercase shadow-sm"
                  >
                    <X className="w-3.5 h-3.5" /> Cancel
                  </button>
                )}
              </div>

              {!isEditing ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="bg-[#F9F6F0]/50 p-5 rounded-2xl border border-[#D4C5B9]/40 space-y-1">
                    <span className="block text-[10px] font-semibold text-[#1A1A1A]/50 uppercase tracking-widest">Full Name</span>
                    <span className="font-serif text-sm font-medium text-[#1A1A1A]">{userInfo.name}</span>
                  </div>
                  <div className="bg-[#F9F6F0]/50 p-5 rounded-2xl border border-[#D4C5B9]/40 space-y-1">
                    <span className="block text-[10px] font-semibold text-[#1A1A1A]/50 uppercase tracking-widest">Email Address</span>
                    <span className="font-serif text-sm font-medium text-[#1A1A1A]">{userInfo.email}</span>
                  </div>
                  <div className="bg-[#F9F6F0]/50 p-5 rounded-2xl border border-[#D4C5B9]/40 space-y-1">
                    <span className="block text-[10px] font-semibold text-[#1A1A1A]/50 uppercase tracking-widest">Account Type</span>
                    <span className="font-serif text-sm font-medium text-[#1A1A1A] capitalize">{userInfo.role || 'Customer'}</span>
                  </div>
                  <div className="bg-[#F9F6F0]/50 p-5 rounded-2xl border border-[#D4C5B9]/40 flex flex-col justify-center">
                    <Link to="/orders" className="text-[#1A1A1A] hover:text-[#C5A059] font-medium text-xs flex items-center justify-between transition tracking-wider uppercase">
                      <span className="flex items-center gap-2">
                        <Package className="w-4 h-4 text-[#C5A059]" /> View Order History
                      </span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleUpdateProfile} className="space-y-4 max-w-lg">
                  <div>
                    <label className="block text-[11px] font-semibold text-[#1A1A1A] uppercase tracking-widest mb-1.5">Full Name</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-4 py-3 text-xs rounded-2xl border border-[#D4C5B9]/60 bg-[#F9F6F0] text-[#1A1A1A] focus:outline-none focus:ring-2 focus:ring-[#C5A059] tracking-wider"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-[#1A1A1A] uppercase tracking-widest mb-1.5">Email Address</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-4 py-3 text-xs rounded-2xl border border-[#D4C5B9]/60 bg-[#F9F6F0] text-[#1A1A1A] focus:outline-none focus:ring-2 focus:ring-[#C5A059] tracking-wider"
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full sm:w-auto bg-[#1A1A1A] hover:bg-[#C5A059] text-[#F9F6F0] hover:text-[#1A1A1A] text-xs font-medium px-7 py-3.5 rounded-2xl transition shadow-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 tracking-widest uppercase"
                  >
                    <Save className="w-4 h-4 text-[#C5A059]" /> {loading ? 'Saving Changes...' : 'Save Profile Changes'}
                  </button>
                </form>
              )}
            </div>
          )}

          {activeTab === 'security' && (
            <div className="space-y-6 max-w-lg">
              <div className="border-b border-[#F9F6F0] pb-4">
                <h2 className="text-lg font-serif font-medium text-[#1A1A1A]">Change Password</h2>
                <p className="text-xs text-[#1A1A1A]/60 font-light mt-0.5">Ensure your account is secure by using a strong password.</p>
              </div>

              <form onSubmit={handlePasswordChange} className="space-y-4">
                {/* Current Password */}
                <div>
                  <label className="block text-[11px] font-semibold text-[#1A1A1A] uppercase tracking-widest mb-1.5">Current Password</label>
                  <div className="relative">
                    <input
                      type={showCurrent ? 'text' : 'password'}
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="w-full px-4 py-3 pr-10 text-xs rounded-2xl border border-[#D4C5B9]/60 bg-[#F9F6F0] text-[#1A1A1A] focus:outline-none focus:ring-2 focus:ring-[#C5A059] tracking-wider"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrent(!showCurrent)}
                      className="absolute right-3.5 top-3.5 text-[#1A1A1A]/50 hover:text-[#1A1A1A] cursor-pointer"
                    >
                      {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* New Password */}
                <div>
                  <label className="block text-[11px] font-semibold text-[#1A1A1A] uppercase tracking-widest mb-1.5">New Password</label>
                  <div className="relative">
                    <input
                      type={showNew ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full px-4 py-3 pr-10 text-xs rounded-2xl border border-[#D4C5B9]/60 bg-[#F9F6F0] text-[#1A1A1A] focus:outline-none focus:ring-2 focus:ring-[#C5A059] tracking-wider"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowNew(!showNew)}
                      className="absolute right-3.5 top-3.5 text-[#1A1A1A]/50 hover:text-[#1A1A1A] cursor-pointer"
                    >
                      {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Confirm New Password */}
                <div>
                  <label className="block text-[11px] font-semibold text-[#1A1A1A] uppercase tracking-widest mb-1.5">Confirm New Password</label>
                  <div className="relative">
                    <input
                      type={showConfirm ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full px-4 py-3 pr-10 text-xs rounded-2xl border border-[#D4C5B9]/60 bg-[#F9F6F0] text-[#1A1A1A] focus:outline-none focus:ring-2 focus:ring-[#C5A059] tracking-wider"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm(!showConfirm)}
                      className="absolute right-3.5 top-3.5 text-[#1A1A1A]/50 hover:text-[#1A1A1A] cursor-pointer"
                    >
                      {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full sm:w-auto bg-[#1A1A1A] hover:bg-[#C5A059] text-[#F9F6F0] hover:text-[#1A1A1A] text-xs font-medium px-7 py-3.5 rounded-2xl transition shadow-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 tracking-widest uppercase"
                >
                  <Lock className="w-4 h-4 text-[#C5A059]" /> {loading ? 'Updating Password...' : 'Update Password'}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;