import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import {
  FiPlus,
  FiSun,
  FiMoon,
  FiUser,
  FiLogOut,
  FiLogIn,
  FiMenu,
  FiSliders,
} from 'react-icons/fi';
import { TbGridDots } from 'react-icons/tb';

const Navbar = ({ onToggleSidebar }) => {
  const { user, isAuthenticated, isGuest, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-30 w-full border-b border-base-content/10 bg-base-100/80 backdrop-blur-md px-4 py-3">
      <div className="flex items-center justify-between">
        {/* Left: Mobile hamburger & Brand */}
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleSidebar}
            className="btn btn-ghost btn-sm btn-square lg:hidden"
            aria-label="Toggle Navigation"
          >
            <FiMenu className="w-5 h-5" />
          </button>

          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-cyan-500/20 group-hover:scale-105 transition-transform">
              <TbGridDots className="w-5 h-5" />
            </div>
            <div>
              <div className="font-extrabold tracking-wider text-base md:text-lg flex items-center gap-1.5">
                <span className="text-base-content">DECISION</span>
                <span className="text-cyan-400 font-black">MATRIX</span>
              </div>
              <p className="text-[10px] uppercase tracking-widest text-base-content/50 -mt-1 hidden sm:block">
                AI Decision Intelligence
              </p>
            </div>
          </Link>
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          <Link
            to="/decisions/new"
            className="btn btn-primary btn-sm rounded-xl gap-1.5 shadow-sm shadow-primary/30"
          >
            <FiPlus className="w-4 h-4" />
            <span className="hidden sm:inline">New Decision</span>
          </Link>

          {/* Theme Toggler */}
          <button
            onClick={toggleTheme}
            className="btn btn-ghost btn-sm btn-circle text-base-content/70 hover:text-base-content"
            title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} mode`}
          >
            {theme === 'dark' ? (
              <FiSun className="w-4 h-4 text-amber-300" />
            ) : (
              <FiMoon className="w-4 h-4 text-indigo-400" />
            )}
          </button>

          {/* User profile dropdown or Sign-in */}
          {isAuthenticated ? (
            <div className="dropdown dropdown-end">
              <div
                tabIndex={0}
                role="button"
                className="btn btn-ghost btn-sm gap-2 rounded-xl border border-base-content/10 px-2.5"
              >
                <div className="w-6 h-6 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center text-xs font-bold">
                  {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </div>
                <span className="text-xs font-medium max-w-[100px] truncate hidden md:inline">
                  {user?.name || 'User'}
                </span>
                {isGuest && (
                  <span className="badge badge-xs badge-warning uppercase tracking-wider font-semibold">
                    Guest
                  </span>
                )}
              </div>
              <ul
                tabIndex={0}
                className="dropdown-content menu p-2 shadow-2xl bg-base-200 border border-base-content/10 rounded-2xl w-52 mt-2 z-50 text-sm"
              >
                <li className="menu-title px-3 py-1 text-xs text-base-content/50 border-b border-base-content/10 pb-2 mb-1">
                  Signed in as <br />
                  <span className="font-semibold text-base-content truncate block">
                    {user?.email || 'Guest User'}
                  </span>
                </li>
                <li>
                  <Link to="/dashboard" className="gap-2">
                    <TbGridDots className="w-4 h-4 text-cyan-400" /> Dashboard
                  </Link>
                </li>
                <li>
                  <Link to="/history" className="gap-2">
                    <FiSliders className="w-4 h-4 text-indigo-400" /> Decision History
                  </Link>
                </li>
                <li>
                  <Link to="/profile" className="gap-2">
                    <FiUser className="w-4 h-4 text-emerald-400" /> User Profile
                  </Link>
                </li>
                <li className="border-t border-base-content/10 mt-1 pt-1">
                  <button
                    onClick={handleLogout}
                    className="text-rose-400 hover:text-rose-300 gap-2"
                  >
                    <FiLogOut className="w-4 h-4" /> Sign Out
                  </button>
                </li>
              </ul>
            </div>
          ) : (
            <div className="flex items-center gap-1.5">
              <Link to="/login" className="btn btn-ghost btn-sm rounded-xl">
                <FiLogIn className="w-4 h-4" />
                <span className="hidden sm:inline">Login</span>
              </Link>
              <Link
                to="/register"
                className="btn btn-outline btn-primary btn-sm rounded-xl hidden sm:inline-flex"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
