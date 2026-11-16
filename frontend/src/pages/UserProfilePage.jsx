import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import {
  FiUser,
  FiMail,
  FiSliders,
  FiShield,
  FiSave,
  FiCheckCircle,
} from 'react-icons/fi';

const CRITERIA_NAMES = [
  { id: 'moral_correctness', name: 'Moral Correctness', defaultVal: 8 },
  { id: 'ethical_responsibility', name: 'Ethical Responsibility', defaultVal: 8 },
  { id: 'logical_consistency', name: 'Logical Consistency', defaultVal: 8 },
  { id: 'evidence_support', name: 'Evidence & Factual Support', defaultVal: 7 },
  { id: 'long_term_benefits', name: 'Long-Term Benefits', defaultVal: 9 },
  { id: 'short_term_benefits', name: 'Short-Term Benefits', defaultVal: 6 },
  { id: 'risk_harm', name: 'Risk & Potential Harm (Safety)', defaultVal: 9 },
  { id: 'financial_feasibility', name: 'Financial Feasibility', defaultVal: 8 },
  { id: 'social_impact', name: 'Social Impact', defaultVal: 7 },
  { id: 'human_welfare', name: 'Human Welfare', defaultVal: 9 },
  { id: 'sustainability', name: 'Sustainability', defaultVal: 7 },
  { id: 'practical_feasibility', name: 'Practical Feasibility', defaultVal: 8 },
  { id: 'fairness_equality', name: 'Fairness & Equality', defaultVal: 8 },
  { id: 'personal_goal_alignment', name: 'Personal Goal Alignment', defaultVal: 10 },
];

const UserProfilePage = () => {
  const { user, isGuest, updateProfile } = useAuth();
  const { theme, setTheme } = useTheme();

  const [name, setName] = useState(user?.name || 'Guest Analyst');
  const [weights, setWeights] = useState({});
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user?.preferences?.defaultWeights) {
      setWeights(user.preferences.defaultWeights);
    } else {
      const initial = {};
      CRITERIA_NAMES.forEach((c) => (initial[c.id] = c.defaultVal));
      setWeights(initial);
    }
    if (user?.name) {
      setName(user.name);
    }
  }, [user]);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSaved(false);
    try {
      if (!isGuest) {
        await updateProfile({
          name,
          preferences: {
            theme,
            defaultWeights: weights,
          },
        });
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      alert('Failed to save profile: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 pb-16">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
          User Profile & <span className="text-cyan-400">Baseline Preferences</span>
        </h1>
        <p className="text-xs sm:text-sm text-base-content/60 mt-1">
          Configure your personal default weights for the 14 multi-criteria dimensions.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {saved && (
          <div className="alert alert-success text-xs p-3 rounded-xl flex items-center gap-2">
            <FiCheckCircle className="w-4 h-4 shrink-0" />
            <span>Profile and default weights saved successfully!</span>
          </div>
        )}

        {/* Profile Card */}
        <div className="glass-panel p-6 space-y-4">
          <h3 className="font-bold text-base flex items-center gap-2">
            <FiUser className="w-4 h-4 text-cyan-400" />
            <span>Identity Details</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-base-content/70 mb-1">
                Display Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="input input-bordered w-full rounded-xl text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-base-content/70 mb-1">
                Email
              </label>
              <input
                type="text"
                disabled
                value={user?.email || 'guest@matrix.local'}
                className="input input-bordered w-full rounded-xl text-sm opacity-70"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-base-content/70 mb-1">
              Active UI Theme
            </label>
            <div className="flex flex-wrap gap-2">
              {['dark', 'light', 'synthwave', 'night', 'corporate'].map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTheme(t)}
                  className={`btn btn-sm rounded-xl capitalize ${
                    theme === t ? 'btn-primary' : 'btn-ghost bg-base-300/40'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Default Weights Configuration */}
        <div className="glass-panel p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-base flex items-center gap-2">
              <FiSliders className="w-4 h-4 text-indigo-400" />
              <span>Default Multi-Dimensional Weights</span>
            </h3>
            <span className="text-xs text-base-content/50">Used when initiating new decisions</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {CRITERIA_NAMES.map((crit) => (
              <div key={crit.id} className="p-3 rounded-xl bg-base-300/30 space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="font-semibold">{crit.name}</span>
                  <span className="font-mono font-bold text-cyan-400">
                    {weights[crit.id] || crit.defaultVal}/10
                  </span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={weights[crit.id] || crit.defaultVal}
                  onChange={(e) =>
                    setWeights({
                      ...weights,
                      [crit.id]: Number(e.target.value),
                    })
                  }
                  className="range range-xs range-primary"
                />
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="btn btn-primary rounded-xl gap-2 font-bold px-6 shadow-md shadow-primary/20"
          >
            <FiSave className="w-4 h-4" />
            <span>{saving ? 'Saving...' : 'Save All Preferences'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default UserProfilePage;
