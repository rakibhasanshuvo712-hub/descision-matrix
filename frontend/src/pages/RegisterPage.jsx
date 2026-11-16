import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiUser, FiMail, FiLock, FiArrowRight, FiAlertCircle, FiCheck } from 'react-icons/fi';
import { TbGridDots } from 'react-icons/tb';

const RegisterPage = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { register, isGuest } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      return setError('Passwords do not match.');
    }

    if (password.length < 6) {
      return setError('Password must be at least 6 characters long.');
    }

    setSubmitting(true);
    try {
      await register(name, email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-md mx-auto my-8 md:my-16">
      <div className="glass-panel p-6 sm:p-8">
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center text-white mx-auto shadow-md shadow-cyan-500/20 mb-3">
            <TbGridDots className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-bold">Create Account</h2>
          <p className="text-xs text-base-content/60 mt-1">
            {isGuest
              ? 'Upgrade your guest session to keep your decisions forever'
              : 'Join DECISION MATRIX for advanced decision intelligence'}
          </p>
        </div>

        {error && (
          <div className="alert alert-error text-xs p-3 rounded-xl mb-4 flex items-center gap-2">
            <FiAlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-base-content/70 mb-1.5">
              Full Name
            </label>
            <div className="relative">
              <FiUser className="w-4 h-4 absolute left-3.5 top-3.5 text-base-content/40" />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Dr. Evelyn Vance"
                className="input input-bordered w-full pl-10 text-sm rounded-xl focus:border-cyan-400"
              />
            </div>
          </div>

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
                placeholder="evelyn@domain.com"
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
                placeholder="Minimum 6 characters"
                className="input input-bordered w-full pl-10 text-sm rounded-xl focus:border-cyan-400"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-base-content/70 mb-1.5">
              Confirm Password
            </label>
            <div className="relative">
              <FiLock className="w-4 h-4 absolute left-3.5 top-3.5 text-base-content/40" />
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repeat password"
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
                <span>Create Free Account</span>
                <FiArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <p className="text-center text-xs text-base-content/60 mt-6">
          Already registered?{' '}
          <Link to="/login" className="text-cyan-400 hover:underline font-semibold">
            Sign In here
          </Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
