import React, { useState, useEffect } from 'react';
import API from '../utils/api';
import { ShieldAlert, CheckCircle, Store, Users, Check } from 'lucide-react';

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchUsers = async () => {
    try {
      const res = await API.get('/users/admin/users');
      setUsers(res.data);
      setLoading(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load users. Make sure you have admin rights.');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const approveVendor = async (userId) => {
    try {
      await API.put(`/users/admin/approve/${userId}`);
      fetchUsers();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to approve vendor');
    }
  };

  return (
    <div className="min-h-screen bg-[#F9F6F0] text-[#1A1A1A] max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 font-sans">
      <h1 className="text-2xl md:text-3xl font-serif font-light text-[#1A1A1A] mb-6 flex items-center gap-3 tracking-wide">
        <ShieldAlert className="w-6 h-6 text-[#C5A059]" /> Admin Dashboard - Vendor Management
      </h1>

      {error && (
        <div className="bg-[#1A1A1A] text-white border border-red-500/50 p-4 rounded-xl mb-6 text-xs uppercase tracking-wider">
          {error}
        </div>
      )}

      {loading ? (
        <p className="text-[#1A1A1A]/60 text-xs tracking-wider uppercase py-10 text-center">Loading users...</p>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-[#D4C5B9]/50 overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-[#D4C5B9]/30 bg-[#F9F6F0] font-serif font-medium text-[#1A1A1A] text-sm flex items-center gap-2 tracking-wide">
            <Users className="w-4 h-4 text-[#C5A059]" /> Registered Users & Vendors ({users.length})
          </div>

          <div className="divide-y divide-[#F9F6F0]">
            {users.map((user) => (
              <div key={user._id} className="p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:bg-[#F9F6F0]/40 transition">
                <div>
                  <div className="flex items-center gap-2.5">
                    <span className="font-serif font-medium text-[#1A1A1A] text-base tracking-wide">{user.name}</span>
                    <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-semibold uppercase tracking-widest ${
                      user.role === 'vendor' 
                        ? 'bg-[#C5A059]/15 text-[#C5A059] border border-[#C5A059]/30' 
                        : 'bg-[#1A1A1A]/5 text-[#1A1A1A]/70 border border-[#D4C5B9]/40'
                    }`}>
                      {user.role}
                    </span>
                  </div>
                  <p className="text-[#1A1A1A]/60 text-xs tracking-wider mt-1">{user.email}</p>
                  {user.role === 'vendor' && user.storeName && (
                    <p className="text-xs text-[#C5A059] font-medium flex items-center gap-1.5 mt-1.5 tracking-wider">
                      <Store className="w-3.5 h-3.5" /> Store: <strong className="text-[#1A1A1A]">{user.storeName}</strong>
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-4">
                  {user.role === 'vendor' && (
                    <div>
                      {user.isApproved ? (
                        <span className="flex items-center gap-1.5 text-emerald-700 text-[10px] font-semibold bg-emerald-50 px-3.5 py-1.5 rounded-full border border-emerald-200 uppercase tracking-widest">
                          <CheckCircle className="w-3.5 h-3.5 text-emerald-600" /> Approved
                        </span>
                      ) : (
                        <button
                          onClick={() => approveVendor(user._id)}
                          className="bg-[#1A1A1A] hover:bg-[#C5A059] text-[#F9F6F0] hover:text-[#1A1A1A] text-xs font-semibold px-5 py-2.5 rounded-xl transition flex items-center gap-1.5 shadow-sm cursor-pointer border border-transparent hover:border-[#C5A059] uppercase tracking-wider"
                        >
                          <Check className="w-3.5 h-3.5 text-[#C5A059] group-hover:text-[#1A1A1A]" /> Approve Vendor
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;