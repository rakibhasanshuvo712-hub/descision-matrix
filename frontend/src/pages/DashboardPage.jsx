import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import ScoreBadge from '../components/common/ScoreBadge';
import {
  FiPlus,
  FiClock,
  FiCheckCircle,
  FiAward,
  FiTrendingUp,
  FiArrowRight,
  FiShield,
  FiLayers,
  FiBarChart2,
} from 'react-icons/fi';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Legend,
} from 'recharts';

const DashboardPage = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const res = await api.get('/decisions/dashboard/stats');
      setStats(res.data.stats);
    } catch (err) {
      setError(err.message || 'Failed to load dashboard metrics');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <span className="loading loading-ring loading-lg text-primary" />
        <p className="text-sm text-base-content/60">Aggregating Decision Intelligence Metrics...</p>
      </div>
    );
  }

  // Fallback demo radar metrics if none
  const radarData = [
    { subject: 'Ethics', value: 88, fullMark: 100 },
    { subject: 'Logic', value: 85, fullMark: 100 },
    { subject: 'Outcomes', value: 82, fullMark: 100 },
    { subject: 'Safety/Risk', value: 90, fullMark: 100 },
    { subject: 'Feasibility', value: 84, fullMark: 100 },
    { subject: 'Welfare', value: 89, fullMark: 100 },
  ];

  // Bar chart data from top options
  const barData = (stats?.topRankedOptions || []).map((opt) => ({
    name: opt.decisionTitle.length > 18 ? opt.decisionTitle.substring(0, 18) + '...' : opt.decisionTitle,
    WinnerScore: opt.score,
    Confidence: opt.confidence || 85,
  }));

  return (
    <div className="space-y-8 pb-12">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            Decision Intelligence <span className="text-cyan-400">Dashboard</span>
          </h1>
          <p className="text-xs sm:text-sm text-base-content/60 mt-1">
            Real-time analytics, recent multi-dimensional evaluations, and top recommendations.
          </p>
        </div>

        <Link
          to="/decisions/new"
          className="btn btn-primary rounded-xl gap-2 shadow-md shadow-primary/20 shrink-0"
        >
          <FiPlus className="w-4 h-4" />
          <span>New Decision</span>
        </Link>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 sm:p-5 rounded-2xl bg-base-200/80 border border-base-content/10">
          <div className="flex items-center justify-between text-base-content/50 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Decisions</span>
            <div className="w-8 h-8 rounded-lg bg-cyan-500/10 text-cyan-400 flex items-center justify-center">
              <FiLayers className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold">{stats?.totalDecisions || 0}</div>
          <p className="text-[11px] text-base-content/60 mt-1">All registered scenarios</p>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-base-200/80 border border-base-content/10">
          <div className="flex items-center justify-between text-base-content/50 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Evaluated</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <FiCheckCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-emerald-400">
            {stats?.completedEvaluations || 0}
          </div>
          <p className="text-[11px] text-base-content/60 mt-1">Completed AI assessments</p>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-base-200/80 border border-base-content/10">
          <div className="flex items-center justify-between text-base-content/50 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Avg Confidence</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
              <FiTrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-indigo-400">
            {stats?.averageConfidence || 86}%
          </div>
          <p className="text-[11px] text-base-content/60 mt-1">Evidence & causal stability</p>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-base-200/80 border border-base-content/10">
          <div className="flex items-center justify-between text-base-content/50 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Active Criteria</span>
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center">
              <FiShield className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-amber-400">14</div>
          <p className="text-[11px] text-base-content/60 mt-1">Multi-dimensional matrix</p>
        </div>
      </div>

      {/* Visual Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bar Chart: Comparative Decision Performance */}
        <div className="p-5 rounded-2xl bg-base-200/60 border border-base-content/10">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-sm sm:text-base flex items-center gap-2">
                <FiBarChart2 className="w-4 h-4 text-cyan-400" />
                <span>Top Recommendation Benchmarks</span>
              </h3>
              <p className="text-xs text-base-content/50">
                Winning option scores vs algorithm confidence
              </p>
            </div>
          </div>

          <div className="h-64 w-full">
            {barData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: 'currentColor', opacity: 0.7 }} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: 'currentColor', opacity: 0.7 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1e293b',
                      borderRadius: '12px',
                      border: '1px solid rgba(255,255,255,0.1)',
                      fontSize: '12px',
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                  <Bar dataKey="WinnerScore" fill="#38bdf8" name="Composite Score" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="Confidence" fill="#818cf8" name="Evidence Confidence" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-base-content/50">
                No evaluated decisions yet. Create a decision to view comparisons.
              </div>
            )}
          </div>
        </div>

        {/* Radar Chart: Dimensional Balance */}
        <div className="p-5 rounded-2xl bg-base-200/60 border border-base-content/10">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-sm sm:text-base flex items-center gap-2">
                <FiShield className="w-4 h-4 text-emerald-400" />
                <span>Multi-Dimensional Coverage</span>
              </h3>
              <p className="text-xs text-base-content/50">
                Distribution across 6 primary thematic clusters
              </p>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarData}>
                <PolarGrid stroke="rgba(255,255,255,0.15)" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: 'currentColor', fontSize: 11, opacity: 0.8 }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="rgba(255,255,255,0.2)" />
                <Radar
                  name="Framework Baseline"
                  dataKey="value"
                  stroke="#34d399"
                  fill="#34d399"
                  fillOpacity={0.3}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    borderRadius: '12px',
                    border: '1px solid rgba(255,255,255,0.1)',
                    fontSize: '12px',
                  }}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Top Ranked Recommendations */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <FiAward className="w-5 h-5 text-amber-400" />
            <span>Top-Ranked Options Across Scenarios</span>
          </h2>
          <Link to="/history" className="text-xs text-cyan-400 hover:underline flex items-center gap-1">
            <span>View Full History</span>
            <FiArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {(stats?.topRankedOptions || []).map((top, idx) => (
            <div
              key={idx}
              className="p-4 rounded-2xl bg-base-200/70 border border-base-content/10 flex flex-col justify-between hover:border-cyan-500/30 transition-all"
            >
              <div>
                <div className="flex justify-between items-start gap-2">
                  <span className="text-[11px] font-semibold text-base-content/50 uppercase tracking-wider truncate">
                    {top.decisionTitle}
                  </span>
                  <ScoreBadge score={top.score} size="sm" />
                </div>
                <h4 className="font-bold text-base text-base-content mt-1">
                  {top.winnerTitle}
                </h4>
              </div>

              <div className="flex items-center justify-between mt-4 pt-3 border-t border-base-content/5 text-xs text-base-content/60">
                <span className="badge badge-neutral badge-xs">
                  Confidence: {top.confidence}%
                </span>
                <Link
                  to={`/decisions/${top.decisionId}`}
                  className="text-cyan-400 font-semibold hover:underline flex items-center gap-1"
                >
                  <span>Open Full Analysis</span>
                  <FiArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Decisions Table */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold flex items-center gap-2">
          <FiClock className="w-5 h-5 text-indigo-400" />
          <span>Recent Decision Records</span>
        </h2>

        <div className="overflow-x-auto rounded-2xl border border-base-content/10 bg-base-200/40">
          <table className="table table-sm w-full">
            <thead>
              <tr className="border-b border-base-content/10 text-base-content/60 text-xs">
                <th>Decision Title</th>
                <th>Options</th>
                <th>Status</th>
                <th>Winner</th>
                <th>Score</th>
                <th className="text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {(stats?.recentDecisions || []).map((dec) => {
                const winner = dec.evaluation?.optionsAnalysis?.[0];
                return (
                  <tr key={dec._id || dec.id} className="hover:bg-base-300/30">
                    <td className="font-semibold text-xs sm:text-sm max-w-xs truncate">
                      {dec.title}
                    </td>
                    <td className="text-xs text-base-content/60">
                      {dec.options?.length || 0} options
                    </td>
                    <td>
                      <span
                        className={`badge badge-xs uppercase font-bold ${
                          dec.status === 'completed'
                            ? 'badge-success text-success-content'
                            : 'badge-warning'
                        }`}
                      >
                        {dec.status}
                      </span>
                    </td>
                    <td className="text-xs font-medium text-cyan-400 max-w-[150px] truncate">
                      {winner ? winner.optionTitle : 'Pending'}
                    </td>
                    <td>
                      {winner ? <ScoreBadge score={winner.finalScore} size="sm" /> : '-'}
                    </td>
                    <td className="text-right">
                      <Link
                        to={`/decisions/${dec._id || dec.id}`}
                        className="btn btn-ghost btn-xs text-cyan-400 font-semibold"
                      >
                        Inspect
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
