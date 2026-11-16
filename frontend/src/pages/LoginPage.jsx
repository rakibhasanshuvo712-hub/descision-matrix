import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiLock, FiMail, FiArrowRight, FiZap, FiCompass, FiAlertCircle } from 'react-icons/fi';
import { TbGridDots } from 'react-icons/tb';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { login, startGuestSession } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Failed to authenticate. Please check your credentials.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDemoLogin = async () => {
    setEmail('demo@decisionmatrix.ai');
    setPassword('demo1234');
    setError('');
    setSubmitting(true);
    try {
      await login('demo@decisionmatrix.ai', 'demo1234');
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleGuestAccess = async () => {
    setError('');
    setSubmitting(true);
    try {
      await startGuestSession();
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-md mx-auto my-8 md:my-16">
      <div className="glass-panel p-6 sm:p-8">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center text-white mx-auto shadow-md shadow-cyan-500/20 mb-3">
            <TbGridDots className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-bold">Welcome Back</h2>
          <p className="text-xs text-base-content/60 mt-1">
            Access your decision logs and multi-dimensional evaluations
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="alert alert-error text-xs p-3 rounded-xl mb-4 flex items-center gap-2">
            <FiAlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-base-content/70 mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <FiMail className="w-4 h-4 absolute left-3.5 top-3.5 text-base-content/40" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="analyst@domain.com"
                className="input input-bordered w-full pl-10 text-sm rounded-xl focus:border-cyan-400"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-base-content/70 mb-1.5">
              Password
            </label>
            <div className="relative">
              <FiLock className="w-4 h-4 absolute left-3.5 top-3.5 text-base-content/40" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="input input-bordered w-full pl-10 text-sm rounded-xl focus:border-cyan-400"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="btn btn-primary w-full rounded-xl gap-2 font-bold shadow-md shadow-primary/20"
          >
            {submitting ? (
              <span className="loading loading-spinner loading-sm" />
            ) : (
              <>
                <span>Sign In</span>
                <FiArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Quick Demo Button */}
        <div className="mt-4 pt-4 border-t border-base-content/10 space-y-2">
          <button
            type="button"
            onClick={handleDemoLogin}
            disabled={submitting}
            className="btn btn-outline btn-accent btn-sm w-full rounded-xl gap-1.5 text-xs font-semibold"
          >
            <FiZap className="w-3.5 h-3.5" />
            <span>One-Click Demo Login</span>
          </button>

          <button
            type="button"
            onClick={handleGuestAccess}
            disabled={submitting}
            className="btn btn-ghost btn-sm w-full rounded-xl gap-1.5 text-xs text-base-content/70 hover:text-base-content"
          >
            <FiCompass className="w-3.5 h-3.5" />
            <span>Continue as Guest (No Login Required)</span>
          </button>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-base-content/60 mt-6">
          Don't have an account?{' '}
          <Link to="/register" className="text-cyan-400 hover:underline font-semibold">
            Create an Account
          </Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
