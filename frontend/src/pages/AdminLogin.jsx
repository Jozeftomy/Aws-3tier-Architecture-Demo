import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Mail, Lock, ShieldAlert, ArrowRight } from 'lucide-react';

const AdminLogin = () => {
  const { adminLogin } = useAuth();
  const showToast = useToast();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      showToast('Please fill in all fields', 'error');
      return;
    }

    setLoading(true);
    try {
      await adminLogin(email, password);
      showToast('Admin access granted. Welcome to the dashboard.', 'success');
      navigate('/admin');
    } catch (err) {
      const errMsg = err.response?.data?.detail || 'Incorrect email or password';
      showToast(errMsg, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12 sm:px-6 lg:px-8 bg-slate-900 text-slate-100">
      <div className="max-w-md w-full space-y-8 bg-slate-800 p-8 rounded-3xl shadow-2xl border border-slate-700/50">
        <div className="text-center">
          <div className="mx-auto h-14 w-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 mb-4 animate-pulse">
            <ShieldAlert className="w-7 h-7" />
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight text-white">
            Admin Console
          </h2>
          <p className="mt-2 text-sm text-slate-400">
            Authorized administrator credentials required
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="admin-email" className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                Admin Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-slate-500" />
                </div>
                <input
                  id="admin-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 block w-full border border-slate-700 rounded-xl px-3 py-2.5 bg-slate-900/50 text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent text-sm"
                  placeholder="admin@ecommerce.com"
                />
              </div>
            </div>

            <div>
              <label htmlFor="admin-password" className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                Security Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-slate-500" />
                </div>
                <input
                  id="admin-password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 block w-full border border-slate-700 rounded-xl px-3 py-2.5 bg-slate-900/50 text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent text-sm"
                  placeholder="••••••••"
                />
              </div>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-3.5 px-4 border border-transparent text-sm font-bold rounded-xl text-slate-950 bg-amber-500 hover:bg-amber-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 disabled:bg-slate-700 disabled:text-slate-500 transition-colors shadow-lg shadow-amber-500/10 hover:shadow-none"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  Access Console
                  <ArrowRight className="ml-2 w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </form>

        <div className="text-center mt-4">
          <a
            href="/"
            className="text-xs text-slate-500 hover:text-slate-400 transition-colors font-semibold"
          >
            &larr; Back to Client Shop
          </a>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
