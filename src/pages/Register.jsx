import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import API from '../utils/api';
import { Store, User, Lock, Mail, FileText, ArrowRight } from 'lucide-react';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'customer',
    storeName: '',
    storeDescription: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const { name, email, password, role, storeName, storeDescription } = formData;

  const onChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await API.post('/auth/register', formData);
      localStorage.setItem('userInfo', JSON.stringify(res.data));
      if (res.data.role === 'vendor') {
        navigate('/vendor/dashboard');
      } else {
        navigate('/');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
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

      {/* Main Register Card */}
      <div className="max-w-5xl w-full rounded-2xl shadow-2xl border border-[#D4C5B9]/40 overflow-hidden flex flex-col md:flex-row relative z-10 my-auto">
        
        {/* Left Side: Solid Minimalist Editorial Box */}
        <div className="md:w-5/12 bg-[#F3EDE2] p-8 sm:p-10 flex flex-col justify-between border-b md:border-b-0 md:border-r border-[#D4C5B9]/40">
          <div>
            <div className="flex items-center gap-2 mb-6">
              <Store className="w-6 h-6 text-[#C5A059]" />
              <span className="font-serif tracking-widest text-[#1A1A1A] uppercase text-sm font-semibold">ShopSphere</span>
            </div>
            <h3 className="font-serif font-light text-2xl text-[#1A1A1A] leading-snug mb-3">
              Join Our Curated Ecosystem.
            </h3>
            <p className="text-xs text-[#1A1A1A]/70 font-light leading-relaxed mb-6">
              Whether you are looking to discover unique collections or open your own digital storefront as a vendor, ShopSphere connects quality with craftsmanship.
            </p>
          </div>

          <div className="pt-8 mt-8 border-t border-[#D4C5B9]/40">
            <p className="text-[10px] uppercase tracking-widest text-[#C5A059] font-medium">
              Secure Membership Registry
            </p>
          </div>
        </div>

        {/* Right Side: Clean Form */}
        <div className="md:w-7/12 p-8 sm:p-10 flex flex-col justify-center bg-white max-h-[85vh] overflow-y-auto">
          <div className="mb-6">
            <h2 className="text-xl sm:text-2xl font-serif font-light text-[#1A1A1A] tracking-wide mb-1">Create Account</h2>
            <p className="text-[#1A1A1A]/60 text-xs tracking-wider uppercase">Fill in your details to get started</p>
          </div>

          {error && (
            <div className="bg-[#1A1A1A] text-white border border-red-500/40 p-3 rounded-xl mb-5 text-xs tracking-wider uppercase">
              {error}
            </div>
          )}

          <form onSubmit={onSubmit} className="space-y-3.5">
            <div>
              <label className="block text-[11px] font-semibold text-[#1A1A1A] uppercase tracking-widest mb-1">Full Name</label>
              <div className="relative">
                <User className="w-4 h-4 text-[#C5A059] absolute left-4 top-3.5" />
                <input
                  type="text"
                  name="name"
                  value={name}
                  onChange={onChange}
                  required
                  className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-[#D4C5B9]/60 bg-[#F9F6F0]/40 text-[#1A1A1A] focus:outline-none focus:border-[#C5A059] focus:bg-white text-xs tracking-wider placeholder:text-[#1A1A1A]/30 transition-all"
                  placeholder="John Doe"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-[#1A1A1A] uppercase tracking-widest mb-1">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#C5A059] absolute left-4 top-3.5" />
                <input
                  type="email"
                  name="email"
                  value={email}
                  onChange={onChange}
                  required
                  className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-[#D4C5B9]/60 bg-[#F9F6F0]/40 text-[#1A1A1A] focus:outline-none focus:border-[#C5A059] focus:bg-white text-xs tracking-wider placeholder:text-[#1A1A1A]/30 transition-all"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-[#1A1A1A] uppercase tracking-widest mb-1">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#C5A059] absolute left-4 top-3.5" />
                <input
                  type="password"
                  name="password"
                  value={password}
                  onChange={onChange}
                  required
                  className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-[#D4C5B9]/60 bg-[#F9F6F0]/40 text-[#1A1A1A] focus:outline-none focus:border-[#C5A059] focus:bg-white text-xs tracking-wider placeholder:text-[#1A1A1A]/30 transition-all"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-[#1A1A1A] uppercase tracking-widest mb-1">Register As</label>
              <select
                name="role"
                value={role}
                onChange={onChange}
                className="w-full px-4 py-2.5 rounded-xl border border-[#D4C5B9]/60 bg-[#F9F6F0]/40 text-[#1A1A1A] focus:outline-none focus:border-[#C5A059] focus:bg-white text-xs tracking-wider cursor-pointer transition-all"
              >
                <option value="customer">Customer</option>
                <option value="vendor">Store Vendor</option>
              </select>
            </div>

            {role === 'vendor' && (
              <div className="space-y-3.5 pt-1 animate-fadeIn">
                <div>
                  <label className="block text-[11px] font-semibold text-[#1A1A1A] uppercase tracking-widest mb-1">Store Name</label>
                  <div className="relative">
                    <Store className="w-4 h-4 text-[#C5A059] absolute left-4 top-3.5" />
                    <input
                      type="text"
                      name="storeName"
                      value={storeName}
                      onChange={onChange}
                      required
                      className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-[#D4C5B9]/60 bg-[#F9F6F0]/40 text-[#1A1A1A] focus:outline-none focus:border-[#C5A059] focus:bg-white text-xs tracking-wider placeholder:text-[#1A1A1A]/30 transition-all"
                      placeholder="My Awesome Shop"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-[#1A1A1A] uppercase tracking-widest mb-1">Store Description</label>
                  <div className="relative">
                    <FileText className="w-4 h-4 text-[#C5A059] absolute left-4 top-3.5" />
                    <textarea
                      name="storeDescription"
                      value={storeDescription}
                      onChange={onChange}
                      rows="2"
                      className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-[#D4C5B9]/60 bg-[#F9F6F0]/40 text-[#1A1A1A] focus:outline-none focus:border-[#C5A059] focus:bg-white text-xs tracking-wider placeholder:text-[#1A1A1A]/30 transition-all resize-none"
                      placeholder="Tell customers about your products..."
                    ></textarea>
                  </div>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#1A1A1A] hover:bg-[#C5A059] text-[#F9F6F0] hover:text-[#1A1A1A] font-medium py-3.5 rounded-xl transition-all shadow-sm text-xs tracking-widest uppercase cursor-pointer flex items-center justify-center gap-2 group border border-transparent hover:border-[#C5A059] mt-3"
            >
              <span>{loading ? 'Creating Account...' : 'Sign Up'}</span>
              {!loading && <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />}
            </button>
          </form>

          <p className="text-center text-xs text-[#1A1A1A]/70 mt-5 tracking-wide font-light">
            Already have an account?{' '}
            <Link to="/login" className="text-[#C5A059] hover:text-[#1A1A1A] font-medium tracking-widest uppercase ml-1 transition">
              Login here
            </Link>
          </p>
        </div>

      </div>
    </div>
  );
};

export default Register;