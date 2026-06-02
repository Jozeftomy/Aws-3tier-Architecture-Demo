import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { ShoppingCart, LogOut, User as UserIcon, Shield, Menu, X } from 'lucide-react';

const Navbar = () => {
  const { user, logout, isAdmin } = useAuth();
  const { cartCount } = useCart();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-white border-b border-gray-100 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-primary-600 to-primary-400 flex items-center justify-center text-white shadow-md shadow-primary-200 group-hover:scale-105 transition-transform">
                <span className="font-bold text-lg">S</span>
              </div>
              <span className="font-bold text-xl text-gray-900 tracking-tight group-hover:text-primary-600 transition-colors">
                SwiftCart
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            <Link to="/" className="text-gray-600 hover:text-primary-600 font-medium text-sm transition-colors">
              Products
            </Link>
            
            {isAdmin && (
              <Link to="/admin" className="flex items-center gap-1.5 text-amber-700 hover:text-amber-800 font-medium text-sm transition-colors bg-amber-50 px-3 py-1.5 rounded-lg border border-amber-200">
                <Shield className="w-4 h-4" />
                Admin Dashboard
              </Link>
            )}

            <div className="h-6 w-px bg-gray-200" />

            {/* Cart Icon */}
            <Link to="/cart" className="relative p-2 text-gray-600 hover:text-primary-600 transition-colors rounded-xl hover:bg-gray-50">
              <ShoppingCart className="w-6 h-6" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full ring-2 ring-white animate-pulse">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* Auth Buttons / Profile */}
            {user ? (
              <div className="flex items-center gap-4">
                <Link to="/orders" className="flex items-center gap-1.5 text-gray-600 hover:text-primary-600 font-medium text-sm transition-colors">
                  <UserIcon className="w-4 h-4" />
                  My Orders
                </Link>
                <div className="text-sm font-medium text-gray-700 max-w-[120px] truncate">
                  {user.full_name}
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1.5 text-gray-500 hover:text-rose-600 font-medium text-sm transition-colors p-2 rounded-xl hover:bg-rose-50"
                  title="Sign Out"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="sr-only">Logout</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  to="/login"
                  className="text-gray-600 hover:text-primary-600 font-medium text-sm transition-colors px-3 py-2 rounded-lg"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="bg-primary-600 hover:bg-primary-700 text-white font-medium text-sm px-4 py-2 rounded-xl shadow-sm transition-all"
                >
                  Register
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center md:hidden gap-2">
            <Link to="/cart" className="relative p-2 text-gray-600">
              <ShoppingCart className="w-6 h-6" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full">
                  {cartCount}
                </span>
              )}
            </Link>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-gray-500 hover:bg-gray-50"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-gray-100 bg-white px-4 pt-2 pb-4 space-y-2">
          <Link
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-base font-medium text-gray-700 hover:bg-gray-50 hover:text-primary-600"
          >
            Products
          </Link>
          
          {isAdmin && (
            <Link
              to="/admin"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-base font-medium text-amber-800 bg-amber-50 hover:bg-amber-100"
            >
              <Shield className="w-5 h-5" />
              Admin Dashboard
            </Link>
          )}

          {user && (
            <Link
              to="/orders"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-base font-medium text-gray-700 hover:bg-gray-50 hover:text-primary-600"
            >
              My Orders
            </Link>
          )}

          <div className="h-px bg-gray-100 my-2" />

          {user ? (
            <div className="space-y-2">
              <div className="px-3 py-2 text-sm text-gray-500">
                Logged in as <span className="font-semibold text-gray-800">{user.full_name}</span>
              </div>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleLogout();
                }}
                className="w-full text-left flex items-center gap-2 px-3 py-2 rounded-lg text-base font-medium text-rose-600 hover:bg-rose-50"
              >
                <LogOut className="w-5 h-5" />
                Sign Out
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-2 pt-2">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-2 border border-gray-200 rounded-xl text-gray-700 font-medium hover:bg-gray-50"
              >
                Login
              </Link>
              <Link
                to="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-2 bg-primary-600 text-white font-medium rounded-xl hover:bg-primary-700"
              >
                Register
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
