import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import ScoreBadge from '../components/common/ScoreBadge';
import {
  FiClock,
  FiSearch,
  FiTrash2,
  FiArrowRight,
  FiSliders,
  FiPlus,
  FiAlertCircle,
  FiCheckCircle,
} from 'react-icons/fi';

const DecisionHistoryPage = () => {
  const [decisions, setDecisions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    fetchDecisions();
  }, []);

  const fetchDecisions = async (query = '') => {
    try {
      setLoading(true);
      const url = query ? `/decisions?search=${encodeURIComponent(query)}` : '/decisions';
      const res = await api.get(url);
      setDecisions(res.data.decisions || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchDecisions(search);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this decision record?')) return;
    try {
      setDeletingId(id);
      await api.delete(`/decisions/${id}`);
      setDecisions((prev) => prev.filter((d) => (d._id || d.id) !== id));
    } catch (err) {
      alert('Failed to delete: ' + err.message);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            Decision <span className="text-cyan-400">History</span>
          </h1>
          <p className="text-xs sm:text-sm text-base-content/60 mt-1">
            Browse, re-open, compare, or export past evaluated decisions.
          </p>
        </div>

        <Link
          to="/decisions/new"
          className="btn btn-primary btn-sm rounded-xl gap-1.5 font-bold shadow-md shadow-primary/20 shrink-0"
        >
          <FiPlus className="w-4 h-4" />
          <span>New Decision</span>
        </Link>
      </div>

      {/* Search Bar */}
      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="relative flex-1">
          <FiSearch className="w-4 h-4 absolute left-3.5 top-3.5 text-base-content/40" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search decisions by title, dilemma, or options..."
            className="input input-bordered w-full pl-10 text-sm rounded-xl focus:border-cyan-400"
          />
        </div>
        <button type="submit" className="btn btn-outline btn-primary rounded-xl px-4 text-xs font-semibold">
          Search
        </button>
      </form>

      {/* Decisions List */}
      {loading ? (
        <div className="flex justify-center py-16">
          <span className="loading loading-ring loading-lg text-primary" />
        </div>
      ) : decisions.length === 0 ? (
        <div className="glass-panel p-10 text-center space-y-4">
          <FiClock className="w-10 h-10 text-base-content/40 mx-auto" />
          <h3 className="font-bold text-base">No Decision Records Found</h3>
          <p className="text-xs text-base-content/60 max-w-sm mx-auto">
            {search ? 'No evaluations matched your search criteria.' : 'Create your first decision matrix to see it here.'}
          </p>
          <Link to="/decisions/new" className="btn btn-primary btn-sm rounded-xl">
            Create Decision
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {decisions.map((dec) => {
            const decId = dec._id || dec.id;
            const winner = dec.evaluation?.optionsAnalysis?.[0];
            return (
              <div
                key={decId}
                className="p-4 sm:p-5 rounded-2xl bg-base-200/60 border border-base-content/10 hover:border-cyan-500/30 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="badge badge-success badge-xs font-semibold">
                      {dec.status}
                    </span>
                    <span className="text-[11px] text-base-content/50">
                      {new Date(dec.createdAt).toLocaleDateString()}
                    </span>
                    <span className="badge badge-neutral badge-xs">
                      {dec.options?.length || 0} Options
                    </span>
                  </div>

                  <h3 className="font-bold text-sm sm:text-base text-base-content truncate">
                    {dec.title}
                  </h3>

                  <p className="text-xs text-base-content/60 line-clamp-1">
                    {dec.description}
                  </p>

                  {winner && (
                    <div className="text-xs text-cyan-400 font-medium flex items-center gap-1.5 pt-1">
                      <FiCheckCircle className="w-3.5 h-3.5" />
                      <span>Winner: <strong>{winner.optionTitle}</strong> ({winner.finalScore}/100)</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
                  {winner && <ScoreBadge score={winner.finalScore} size="md" />}

                  <Link
                    to={`/decisions/${decId}`}
                    className="btn btn-primary btn-sm rounded-xl gap-1 text-xs font-bold"
                  >
                    <span>View Matrix</span>
                    <FiArrowRight className="w-3.5 h-3.5" />
                  </Link>

                  <button
                    onClick={() => handleDelete(decId)}
                    disabled={deletingId === decId}
                    className="btn btn-ghost btn-sm btn-square text-rose-400 hover:bg-rose-500/10 rounded-xl"
                    title="Delete record"
                  >
                    <FiTrash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default DecisionHistoryPage;
