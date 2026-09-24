import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import API from '../utils/api';
import { Mail, Lock, Store, ArrowRight, Eye, EyeOff } from 'lucide-react';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const { email, password } = formData;

  const onChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await API.post('/auth/login', formData);
      localStorage.setItem('userInfo', JSON.stringify(res.data));
      if (res.data.role === 'vendor') {
        navigate('/vendor/dashboard');
      } else {
        navigate('/');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid email or password');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] relative flex items-center justify-center p-4 sm:p-6 lg:p-12 font-sans overflow-hidden">
      
      {/* Background Image with Dark & Warm Gradient Overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center z-0 scale-105 filter blur-[2px]"
        style={{ 
          backgroundImage: `url('https://images.unsplash.com/photo-1513694203232-719a280e022f?q=80&w=2000&auto=format&fit=crop')` 
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-br from-[#1A1A1A]/85 via-[#1A1A1A]/75 to-[#0A0A0A]/90 z-0" />

      {/* Main Login Card */}
      <div className="max-w-4xl w-full bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-[#D4C5B9]/40 overflow-hidden flex flex-col md:flex-row relative z-10">
        
        {/* Left Side: Minimalist Editorial Box */}
        <div className="md:w-5/12 bg-[#F5F1E9] p-8 sm:p-10 flex flex-col justify-between border-b md:border-b-0 md:border-r border-[#D4C5B9]/30">
          <div>
            <div className="flex items-center gap-2 mb-6">
              <Store className="w-6 h-6 text-[#C5A059]" />
              <span className="font-serif tracking-widest text-[#1A1A1A] uppercase text-sm font-semibold">ShopSphere</span>
            </div>
            <h3 className="font-serif font-light text-2xl text-[#1A1A1A] leading-snug mb-3">
              An Elevated Marketplace Experience.
            </h3>
            <p className="text-xs text-[#1A1A1A]/60 font-light leading-relaxed">
              Discover independent designers, curated collections, and artisan-crafted goods seamlessly in one place.
            </p>
          </div>
        </div>

        {/* Right Side: Clean Form */}
        <div className="md:w-7/12 p-8 sm:p-10 flex flex-col justify-center bg-white">
          <div className="mb-6">
            <h2 className="text-xl sm:text-2xl font-serif font-light text-[#1A1A1A] tracking-wide mb-1">Sign In</h2>
            <p className="text-[#1A1A1A]/60 text-xs tracking-wider uppercase">Sign in to manage your store and orders</p>
          </div>

          {error && (
            <div className="bg-[#1A1A1A] text-white border border-red-500/40 p-3 rounded-xl mb-5 text-xs tracking-wider uppercase">
              {error}
            </div>
          )}

          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <label className="block text-[11px] font-semibold text-[#1A1A1A] uppercase tracking-widest mb-1.5">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#C5A059] absolute left-4 top-3.5" />
                <input
                  type="email"
                  name="email"
                  value={email}
                  onChange={onChange}
                  required
                  className="w-full pl-11 pr-4 py-3 rounded-xl border border-[#D4C5B9]/60 bg-[#F9F6F0]/40 text-[#1A1A1A] focus:outline-none focus:border-[#C5A059] focus:bg-white text-xs tracking-wider placeholder:text-[#1A1A1A]/30 transition-all"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-[#1A1A1A] uppercase tracking-widest mb-1.5">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#C5A059] absolute left-4 top-3.5" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={password}
                  onChange={onChange}
                  required
                  className="w-full pl-11 pr-11 py-3 rounded-xl border border-[#D4C5B9]/60 bg-[#F9F6F0]/40 text-[#1A1A1A] focus:outline-none focus:border-[#C5A059] focus:bg-white text-xs tracking-wider placeholder:text-[#1A1A1A]/30 transition-all"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-3.5 text-[#1A1A1A]/40 hover:text-[#C5A059] transition-colors focus:outline-none"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#1A1A1A] hover:bg-[#C5A059] text-[#F9F6F0] hover:text-[#1A1A1A] font-medium py-3.5 rounded-xl transition-all shadow-sm text-xs tracking-widest uppercase cursor-pointer flex items-center justify-center gap-2 group border border-transparent hover:border-[#C5A059] mt-2"
            >
              <span>{loading ? 'Authenticating...' : 'Sign In'}</span>
              {!loading && <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />}
            </button>
          </form>

          <p className="text-center text-xs text-[#1A1A1A]/70 mt-6 tracking-wide font-light">
            No account yet?{' '}
            <Link to="/register" className="text-[#C5A059] hover:text-[#1A1A1A] font-medium tracking-widest uppercase ml-1 transition">
              create account
            </Link>
          </p>
        </div>

      </div>
    </div>
  );
};

export default Login;