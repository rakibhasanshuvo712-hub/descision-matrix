import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import ScoreBadge from '../components/common/ScoreBadge';
import {
  FiColumns,
  FiArrowRight,
  FiCheckCircle,
  FiAlertTriangle,
  FiTrendingUp,
  FiSliders,
} from 'react-icons/fi';
import { TbScale, TbBrain } from 'react-icons/tb';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from 'recharts';

const CompareOptionsPage = () => {
  const { id } = useParams();
  const [decisions, setDecisions] = useState([]);
  const [selectedDecisionId, setSelectedDecisionId] = useState(id || '');
  const [currentDecision, setCurrentDecision] = useState(null);
  const [loading, setLoading] = useState(true);

  // Selected 2 options for detailed side-by-side delta
  const [optionAId, setOptionAId] = useState('');
  const [optionBId, setOptionBId] = useState('');

  useEffect(() => {
    fetchDecisionsList();
  }, []);

  useEffect(() => {
    if (selectedDecisionId) {
      loadDecision(selectedDecisionId);
    }
  }, [selectedDecisionId]);

  const fetchDecisionsList = async () => {
    try {
      setLoading(true);
      const res = await api.get('/decisions');
      const list = res.data.decisions || [];
      setDecisions(list);

      const defaultId = id || list[0]?._id || list[0]?.id;
      if (defaultId) {
        setSelectedDecisionId(defaultId);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadDecision = async (decId) => {
    try {
      setLoading(true);
      const res = await api.get(`/decisions/${decId}`);
      const dec = res.data.decision;
      setCurrentDecision(dec);

      const opts = dec.evaluation?.optionsAnalysis || [];
      if (opts.length >= 2) {
        setOptionAId(opts[0].optionId);
        setOptionBId(opts[1].optionId);
      } else if (opts.length === 1) {
        setOptionAId(opts[0].optionId);
        setOptionBId(opts[0].optionId);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading && !currentDecision) {
    return (
      <div className="flex justify-center py-20">
        <span className="loading loading-ring loading-lg text-primary" />
      </div>
    );
  }

  const optionsList = currentDecision?.evaluation?.optionsAnalysis || [];
  const optA = optionsList.find((o) => o.optionId === optionAId) || optionsList[0];
  const optB = optionsList.find((o) => o.optionId === optionBId) || optionsList[1] || optionsList[0];

  // Prepare criteria differential data for Bar Chart
  const comparisonData = (optA?.criteriaScores || []).map((cA) => {
    const matchB = optB?.criteriaScores?.find((cB) => cB.criterionId === cA.criterionId);
    const scoreA = cA.score;
    const scoreB = matchB ? matchB.score : 0;
    const delta = scoreA - scoreB;

    return {
      name: cA.criterionName.length > 15 ? cA.criterionName.substring(0, 15) + '..' : cA.criterionName,
      fullName: cA.criterionName,
      [optA?.optionTitle || 'Option A']: scoreA,
      [optB?.optionTitle || 'Option B']: scoreB,
      delta,
    };
  });

  const scoreDiff = Math.abs((optA?.finalScore || 0) - (optB?.finalScore || 0));

  return (
    <div className="space-y-8 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-base-content/10 pb-5">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-bold uppercase tracking-wider mb-2">
            <TbScale className="w-4 h-4" /> Comparative Matrix
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            Compare <span className="text-cyan-400">Options</span>
          </h1>
          <p className="text-xs sm:text-sm text-base-content/60 mt-1">
            Side-by-side multi-dimensional differential analysis between competing alternatives.
          </p>
        </div>

        {/* Decision Switcher Dropdown */}
        {decisions.length > 1 && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-base-content/60">Decision:</span>
            <select
              value={selectedDecisionId}
              onChange={(e) => setSelectedDecisionId(e.target.value)}
              className="select select-bordered select-sm rounded-xl text-xs max-w-xs focus:border-cyan-400"
            >
              {decisions.map((d) => (
                <option key={d._id || d.id} value={d._id || d.id}>
                  {d.title}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {currentDecision && (
        <>
          {/* Options Selector Strip */}
          <div className="glass-panel p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-3 rounded-xl bg-base-300/40 space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-cyan-400">
                Option A (Baseline)
              </label>
              <select
                value={optionAId}
                onChange={(e) => setOptionAId(e.target.value)}
                className="select select-bordered select-sm w-full rounded-xl text-xs font-bold"
              >
                {optionsList.map((o) => (
                  <option key={o.optionId} value={o.optionId}>
                    Rank #{o.rank}: {o.optionTitle} ({o.finalScore}/100)
                  </option>
                ))}
              </select>
            </div>

            <div className="p-3 rounded-xl bg-base-300/40 space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-indigo-400">
                Option B (Comparison)
              </label>
              <select
                value={optionBId}
                onChange={(e) => setOptionBId(e.target.value)}
                className="select select-bordered select-sm w-full rounded-xl text-xs font-bold"
              >
                {optionsList.map((o) => (
                  <option key={o.optionId} value={o.optionId}>
                    Rank #{o.rank}: {o.optionTitle} ({o.finalScore}/100)
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Differential Highlight Banner */}
          {optA && optB && (
            <div className="glass-panel p-6 border-cyan-500/20 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-base-content/50">
                  Separation Delta
                </span>
                <h3 className="text-xl font-bold">
                  {optA.finalScore >= optB.finalScore ? optA.optionTitle : optB.optionTitle} leads by{' '}
                  <span className="text-cyan-400 font-extrabold">{scoreDiff.toFixed(1)} points</span>
                </h3>
                <p className="text-xs text-base-content/70">
                  {scoreDiff <= 4
                    ? 'Narrow margin: Rankings could invert with modest criteria weight adjustments or updated risk estimates.'
                    : 'Decisive margin: Clear separation across core feasibility and outcome criteria.'}
                </p>
              </div>

              <div className="flex items-center gap-4 shrink-0">
                <div className="text-center">
                  <div className="text-[10px] uppercase font-bold text-base-content/50 truncate max-w-[120px]">
                    {optA.optionTitle}
                  </div>
                  <ScoreBadge score={optA.finalScore} size="lg" />
                </div>
                <div className="text-lg font-bold text-base-content/30">VS</div>
                <div className="text-center">
                  <div className="text-[10px] uppercase font-bold text-base-content/50 truncate max-w-[120px]">
                    {optB.optionTitle}
                  </div>
                  <ScoreBadge score={optB.finalScore} size="lg" />
                </div>
              </div>
            </div>
          )}

          {/* Side-by-Side Bar Chart */}
          <div className="glass-panel p-6 space-y-4">
            <h3 className="font-bold text-base flex items-center gap-2">
              <TbScale className="w-4 h-4 text-cyan-400" />
              <span>Direct Criteria Comparison Chart</span>
            </h3>

            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={comparisonData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                  <XAxis dataKey="name" tick={{ fontSize: 10, fill: 'currentColor', opacity: 0.7 }} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: 'currentColor', opacity: 0.7 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1e293b',
                      borderRadius: '12px',
                      border: '1px solid rgba(255,255,255,0.1)',
                      fontSize: '12px',
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                  <Bar dataKey={optA?.optionTitle || 'Option A'} fill="#38bdf8" radius={[4, 4, 0, 0]} />
                  <Bar dataKey={optB?.optionTitle || 'Option B'} fill="#818cf8" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Detailed Side-by-Side Qualitative Comparison */}
          {optA && optB && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Option A Card */}
              <div className="glass-panel p-6 space-y-4 border-cyan-500/20">
                <div className="flex items-center justify-between border-b border-base-content/10 pb-3">
                  <div>
                    <span className="badge badge-primary badge-xs">Option A • Rank #{optA.rank}</span>
                    <h3 className="font-bold text-lg mt-0.5">{optA.optionTitle}</h3>
                  </div>
                  <ScoreBadge score={optA.finalScore} size="md" />
                </div>

                <div className="space-y-3 text-xs">
                  <div>
                    <h4 className="font-bold text-emerald-400 mb-1">Key Strengths:</h4>
                    <ul className="space-y-1 text-base-content/80">
                      {optA.strengths?.slice(0, 3).map((s, i) => (
                        <li key={i}>✓ {s}</li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-bold text-rose-400 mb-1">Key Vulnerabilities:</h4>
                    <ul className="space-y-1 text-base-content/80">
                      {optA.weaknesses?.slice(0, 3).map((w, i) => (
                        <li key={i}>✗ {w}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="p-3 rounded-xl bg-base-300/40">
                    <span className="font-semibold text-base-content">Best-Case Horizon:</span>
                    <p className="text-base-content/70 mt-0.5 leading-relaxed">
                      {optA.bestCaseScenario}
                    </p>
                  </div>
                </div>
              </div>

              {/* Option B Card */}
              <div className="glass-panel p-6 space-y-4 border-indigo-500/20">
                <div className="flex items-center justify-between border-b border-base-content/10 pb-3">
                  <div>
                    <span className="badge badge-secondary badge-xs">Option B • Rank #{optB.rank}</span>
                    <h3 className="font-bold text-lg mt-0.5">{optB.optionTitle}</h3>
                  </div>
                  <ScoreBadge score={optB.finalScore} size="md" />
                </div>

                <div className="space-y-3 text-xs">
                  <div>
                    <h4 className="font-bold text-emerald-400 mb-1">Key Strengths:</h4>
                    <ul className="space-y-1 text-base-content/80">
                      {optB.strengths?.slice(0, 3).map((s, i) => (
                        <li key={i}>✓ {s}</li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-bold text-rose-400 mb-1">Key Vulnerabilities:</h4>
                    <ul className="space-y-1 text-base-content/80">
                      {optB.weaknesses?.slice(0, 3).map((w, i) => (
                        <li key={i}>✗ {w}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="p-3 rounded-xl bg-base-300/40">
                    <span className="font-semibold text-base-content">Best-Case Horizon:</span>
                    <p className="text-base-content/70 mt-0.5 leading-relaxed">
                      {optB.bestCaseScenario}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Footer Navigation */}
          <div className="flex justify-between items-center pt-4">
            <Link
              to={`/decisions/${currentDecision._id || currentDecision.id}`}
              className="btn btn-outline btn-sm rounded-xl text-xs gap-1"
            >
              <span>Back to Full Evaluation</span>
            </Link>

            <Link
              to="/decisions/new"
              className="btn btn-primary btn-sm rounded-xl text-xs font-bold gap-1"
            >
              <span>Create New Decision</span>
              <FiArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </>
      )}
    </div>
  );
};

export default CompareOptionsPage;
