import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  FiHome,
  FiPlusCircle,
  FiClock,
  FiSettings,
  FiUser,
  FiShield,
  FiCpu,
  FiCompass,
} from 'react-icons/fi';
import { TbGridDots, TbScale } from 'react-icons/tb';

const Sidebar = ({ isOpen, onClose }) => {
  const { isGuest, isAuthenticated } = useAuth();

  const navLinks = [
    { to: '/dashboard', label: 'Dashboard', icon: FiHome },
    { to: '/decisions/new', label: 'Create Decision', icon: FiPlusCircle, highlight: true },
    { to: '/compare', label: 'Compare Options', icon: TbScale },
    { to: '/history', label: 'Decision History', icon: FiClock },
    { to: '/profile', label: 'Profile & Priorities', icon: FiUser },
    { to: '/settings', label: 'AI & System Config', icon: FiSettings },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-64 border-r border-base-content/10 bg-base-200/90 backdrop-blur-xl transition-transform duration-300 ease-in-out flex flex-col justify-between p-4 lg:static lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div>
          {/* Brand header */}
          <div className="flex items-center gap-3 px-2 py-4 mb-4 border-b border-base-content/10">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-cyan-500/20">
              <TbGridDots className="w-5 h-5" />
            </div>
            <div>
              <div className="font-extrabold tracking-wider text-base text-base-content">
                DECISION<span className="text-cyan-400">MATRIX</span>
              </div>
              <p className="text-[10px] text-base-content/50 uppercase tracking-widest">
                v1.0 • Multi-Criteria
              </p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1">
            <div className="px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-base-content/40">
              Navigation
            </div>
            {navLinks.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={onClose}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                      isActive
                        ? 'bg-primary text-primary-content shadow-sm shadow-primary/30 font-semibold'
                        : item.highlight
                        ? 'text-cyan-400 hover:bg-base-300/80'
                        : 'text-base-content/70 hover:bg-base-300/60 hover:text-base-content'
                    }`
                  }
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                  {item.highlight && (
                    <span className="ml-auto text-[10px] bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 px-1.5 py-0.5 rounded-md uppercase font-bold">
                      New
                    </span>
                  )}
                </NavLink>
              );
            })}
          </nav>

          {/* 14 Multi-Dimensional Criteria Badge Box */}
          <div className="mt-6 mx-1 p-3 rounded-xl bg-base-300/40 border border-base-content/5 text-xs">
            <div className="flex items-center gap-1.5 font-semibold text-cyan-400 mb-1">
              <FiShield className="w-3.5 h-3.5" />
              <span>14 Evaluation Dimensions</span>
            </div>
            <p className="text-[11px] text-base-content/60 leading-relaxed">
              Evaluating ethics, logic, facts, long-term impact, financial feasibility, and human welfare.
            </p>
          </div>
        </div>

        {/* Footer / Guest Alert */}
        <div className="pt-4 border-t border-base-content/10">
          {isGuest && (
            <div className="p-3 mb-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs">
              <div className="font-semibold text-amber-400 flex items-center gap-1">
                <FiCompass className="w-3.5 h-3.5" /> Guest Mode Active
              </div>
              <p className="text-[11px] text-base-content/60 mt-1">
                Decisions saved to this session. Sign up to sync across devices.
              </p>
              <Link
                to="/register"
                className="btn btn-warning btn-xs w-full mt-2 rounded-lg"
              >
                Create Account
              </Link>
            </div>
          )}

          <div className="flex items-center justify-between px-2 text-[11px] text-base-content/50">
            <span className="flex items-center gap-1">
              <FiCpu className="w-3 h-3 text-cyan-400" /> AI Engine Online
            </span>
            <span>Zero-Bias Active</span>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
