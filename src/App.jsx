import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import CartDrawer from './components/CartDrawer';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import VendorDashboard from './pages/VendorDashboard';
import Cart from './pages/cart';
import OrderHistory from './pages/OrderHistory';
import AdminDashboard from './pages/AdminDashboard';
import ProductDetails from './pages/ProductDetails';
import Wishlist from './pages/Wishlist';
import Profile from './pages/Profile';

function App() {
  const [isCartOpen, setIsCartOpen] = useState(false);

  return (
    <Router>
      <div className="min-h-screen bg-slate-50 text-slate-900">
        <Navbar onOpenCart={() => setIsCartOpen(true)} />
        <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/vendor/dashboard" element={<VendorDashboard />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/orders" element={<OrderHistory />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/product/:id" element={<ProductDetails />} />
          <Route path="/wishlist" element={<Wishlist />} />
          <Route path="/profile" element={<Profile />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;