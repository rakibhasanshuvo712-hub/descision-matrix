import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import ScoreBadge from '../components/common/ScoreBadge';
import {
  FiAward,
  FiShield,
  FiAlertTriangle,
  FiCheckCircle,
  FiArrowRight,
  FiPrinter,
  FiSliders,
  FiRefreshCw,
  FiInfo,
  FiHelpCircle,
  FiLayers,
  FiTrendingUp,
  FiMaximize2,
  FiChevronDown,
  FiChevronUp,
} from 'react-icons/fi';
import {
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Legend,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
} from 'recharts';
import { TbBrain, TbScale, TbBulb } from 'react-icons/tb';

const EvaluationResultsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [decision, setDecision] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedOptionId, setSelectedOptionId] = useState(null);
  const [activeTab, setActiveTab] = useState('ranking'); // 'ranking' | 'comparison' | 'deep_dive' | 'explainability'
  const [showWeightAdjuster, setShowWeightAdjuster] = useState(false);
  const [customWeights, setCustomWeights] = useState({});
  const [reEvaluating, setReEvaluating] = useState(false);

  useEffect(() => {
    fetchDecision();
  }, [id]);

  const fetchDecision = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/decisions/${id}`);
      const dec = res.data.decision;
      setDecision(dec);
      setCustomWeights(dec.customWeights || {});
      if (dec.evaluation?.optionsAnalysis?.length > 0) {
        setSelectedOptionId(dec.evaluation.optionsAnalysis[0].optionId);
      }
    } catch (err) {
      setError(err.message || 'Failed to retrieve decision record.');
    } finally {
      setLoading(false);
    }
  };

  const handleReevaluate = async () => {
    try {
      setReEvaluating(true);
      const res = await api.put(`/decisions/${id}/evaluate`, {
        customWeights,
      });
      setDecision(res.data.decision);
      setShowWeightAdjuster(false);
    } catch (err) {
      alert('Error updating evaluation: ' + err.message);
    } finally {
      setReEvaluating(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <span className="loading loading-ring loading-lg text-primary" />
        <p className="text-sm text-base-content/60">Retrieving Decision Matrix & Multi-Dimensional Scores...</p>
      </div>
    );
  }

  if (error || !decision) {
    return (
      <div className="glass-panel p-8 text-center max-w-lg mx-auto space-y-4">
        <FiAlertTriangle className="w-10 h-10 text-rose-400 mx-auto" />
        <h2 className="text-xl font-bold">Decision Record Not Found</h2>
        <p className="text-xs text-base-content/60">{error}</p>
        <Link to="/dashboard" className="btn btn-primary btn-sm rounded-xl">
          Return to Dashboard
        </Link>
      </div>
    );
  }

  const { evaluation } = decision;
  const optionsAnalysis = evaluation?.optionsAnalysis || [];
  const comparative = evaluation?.comparativeAnalysis || {};
  const explainability = evaluation?.explainability || {};
  const selectedOption = optionsAnalysis.find((o) => o.optionId === selectedOptionId) || optionsAnalysis[0];

  // Radar Data for visual comparison across criteria
  const radarCriteriaData = (selectedOption?.criteriaScores || []).map((cs) => {
    const item = { subject: cs.criterionName.length > 14 ? cs.criterionName.substring(0, 14) + '..' : cs.criterionName };
    optionsAnalysis.forEach((opt) => {
      const match = opt.criteriaScores?.find((c) => c.criterionId === cs.criterionId);
      item[opt.optionTitle] = match ? match.score : 50;
    });
    return item;
  });

  const colors = ['#38bdf8', '#818cf8', '#34d399', '#f59e0b', '#ec4899', '#a855f7'];

  return (
    <div className="space-y-8 pb-16 print:p-0">
      {/* Header & Quick Action Strip */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-base-content/10 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="badge badge-primary badge-sm font-semibold uppercase tracking-wider">
              Evaluated Record
            </span>
            <span className="text-xs text-base-content/50">
              {evaluation?.modelUsed || 'AI Core Intelligence'}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">{decision.title}</h1>
          <p className="text-xs sm:text-sm text-base-content/60 mt-1 max-w-2xl leading-relaxed">
            {decision.description}
          </p>
        </div>

        {/* Action Controls (Hidden in Print) */}
        <div className="flex flex-wrap items-center gap-2 no-print shrink-0">
          <button
            onClick={() => setShowWeightAdjuster((prev) => !prev)}
            className="btn btn-outline btn-sm rounded-xl gap-1.5 border-base-content/20 text-xs font-semibold"
          >
            <FiSliders className="w-3.5 h-3.5 text-cyan-400" />
            <span>Tune Weights</span>
          </button>

          <button
            onClick={handlePrint}
            className="btn btn-ghost btn-sm rounded-xl gap-1.5 text-xs text-base-content/70 hover:text-base-content"
          >
            <FiPrinter className="w-3.5 h-3.5" />
            <span>Export Report (PDF)</span>
          </button>

          <Link
            to="/decisions/new"
            className="btn btn-primary btn-sm rounded-xl gap-1.5 font-bold shadow-md shadow-primary/20 text-xs"
          >
            <span>+ New Decision</span>
          </Link>
        </div>
      </div>

      {/* WEIGHT TUNER DRAWER / ACCORDION */}
      {showWeightAdjuster && (
        <div className="glass-panel p-6 space-y-4 border-cyan-500/30 glow-cyan no-print">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm flex items-center gap-2">
              <FiSliders className="w-4 h-4 text-cyan-400" />
              <span>Real-Time Weight Sensitivity Tuning</span>
            </h3>
            <span className="text-xs text-base-content/50">
              Adjust weights and re-run formula instantaneously
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
            {selectedOption?.criteriaScores?.map((crit) => (
              <div key={crit.criterionId} className="p-2.5 rounded-xl bg-base-300/40 space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="font-medium truncate max-w-[120px]">{crit.criterionName}</span>
                  <span className="font-bold text-cyan-400">{customWeights[crit.criterionId] || crit.weight}/10</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={customWeights[crit.criterionId] || crit.weight}
                  onChange={(e) =>
                    setCustomWeights({
                      ...customWeights,
                      [crit.criterionId]: Number(e.target.value),
                    })
                  }
                  className="range range-xs range-primary"
                />
              </div>
            ))}
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              onClick={() => setShowWeightAdjuster(false)}
              className="btn btn-ghost btn-xs rounded-lg"
            >
              Cancel
            </button>
            <button
              onClick={handleReevaluate}
              disabled={reEvaluating}
              className="btn btn-primary btn-xs rounded-lg gap-1 font-bold"
            >
              {reEvaluating ? (
                <span className="loading loading-spinner loading-xs" />
              ) : (
                <>
                  <FiRefreshCw className="w-3 h-3" />
                  <span>Recalculate Rankings</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* EXECUTIVE WINNER BANNER */}
      {comparative?.winner && (
        <div className="glass-panel p-6 border-cyan-500/30 bg-gradient-to-r from-cyan-950/20 via-base-200/90 to-indigo-950/20 relative overflow-hidden">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-bold uppercase tracking-wider">
                <FiAward className="w-4 h-4 text-amber-400" /> Top Recommended Choice
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-base-content">
                {comparative.winner.optionTitle}
              </h2>
              <p className="text-xs sm:text-sm text-base-content/80 max-w-2xl leading-relaxed">
                {comparative.winner.reason}
              </p>
              {comparative.explanationOfDifferences && (
                <p className="text-xs text-base-content/60 italic pt-1">
                  {comparative.explanationOfDifferences}
                </p>
              )}
            </div>

            <div className="flex items-center gap-4 sm:gap-6 bg-base-300/40 p-4 rounded-2xl border border-base-content/10 shrink-0">
              <div className="text-center">
                <div className="text-[10px] uppercase font-bold text-base-content/50 mb-0.5">Final Score</div>
                <ScoreBadge score={comparative.winner.score} size="xl" />
              </div>
              <div className="w-px h-10 bg-base-content/10" />
              <div className="text-center">
                <div className="text-[10px] uppercase font-bold text-base-content/50 mb-0.5">Evidence Quality</div>
                <span className="badge badge-success badge-sm font-bold">
                  {optionsAnalysis[0]?.evidenceQuality || 'High'}
                </span>
                <div className="text-[10px] text-base-content/50 mt-1">
                  Confidence: {optionsAnalysis[0]?.confidenceScore || 85}%
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Navigation Sub-Tabs */}
      <div className="flex border-b border-base-content/10 no-print gap-2">
        <button
          onClick={() => setActiveTab('ranking')}
          className={`py-3 px-4 font-bold text-xs sm:text-sm border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'ranking'
              ? 'border-primary text-primary'
              : 'border-transparent text-base-content/60 hover:text-base-content'
          }`}
        >
          <FiAward className="w-4 h-4" />
          <span>Intelligent Ranking ({optionsAnalysis.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('comparison')}
          className={`py-3 px-4 font-bold text-xs sm:text-sm border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'comparison'
              ? 'border-primary text-primary'
              : 'border-transparent text-base-content/60 hover:text-base-content'
          }`}
        >
          <TbScale className="w-4 h-4" />
          <span>Cross-Option Comparison</span>
        </button>

        <button
          onClick={() => setActiveTab('deep_dive')}
          className={`py-3 px-4 font-bold text-xs sm:text-sm border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'deep_dive'
              ? 'border-primary text-primary'
              : 'border-transparent text-base-content/60 hover:text-base-content'
          }`}
        >
          <TbBrain className="w-4 h-4" />
          <span>Option Deep Reasoning</span>
        </button>

        <button
          onClick={() => setActiveTab('explainability')}
          className={`py-3 px-4 font-bold text-xs sm:text-sm border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'explainability'
              ? 'border-primary text-primary'
              : 'border-transparent text-base-content/60 hover:text-base-content'
          }`}
        >
          <FiShield className="w-4 h-4" />
          <span>Transparency & Ethics</span>
        </button>
      </div>

      {/* TAB 1: INTELLIGENT RANKINGS */}
      {(activeTab === 'ranking' || activeTab === 'all') && (
        <div className="space-y-6">
          <div className="space-y-4">
            {optionsAnalysis.map((opt, idx) => (
              <div
                key={opt.optionId || idx}
                className={`p-5 rounded-2xl border transition-all ${
                  opt.rank === 1
                    ? 'bg-base-200/90 border-cyan-500/40 glow-cyan'
                    : 'bg-base-200/50 border-base-content/10'
                }`}
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <span
                      className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-sm shrink-0 ${
                        opt.rank === 1
                          ? 'bg-cyan-500 text-black shadow-md'
                          : opt.rank === 2
                          ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30'
                          : 'bg-base-300 text-base-content/70'
                      }`}
                    >
                      #{opt.rank}
                    </span>

                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-base sm:text-lg text-base-content">
                          {opt.optionTitle}
                        </h3>
                        {opt.rank === 1 && (
                          <span className="badge badge-primary badge-xs uppercase font-extrabold">
                            Winner
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-base-content/60 mt-0.5">
                        Confidence: <strong className="text-base-content/80">{opt.confidenceScore}%</strong> • Evidence Quality:{' '}
                        <span className="badge badge-neutral badge-xs">{opt.evidenceQuality}</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <div className="text-[10px] uppercase font-bold text-base-content/50">Weighted Index</div>
                      <ScoreBadge score={opt.finalScore} size="lg" />
                    </div>

                    <button
                      onClick={() => {
                        setSelectedOptionId(opt.optionId);
                        setActiveTab('deep_dive');
                      }}
                      className="btn btn-ghost btn-sm rounded-xl text-cyan-400 text-xs font-semibold gap-1 no-print"
                    >
                      <span>Deep Dive</span>
                      <FiArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Quick Criterion Chips */}
                <div className="mt-4 pt-4 border-t border-base-content/10 flex flex-wrap gap-2 text-xs">
                  {opt.criteriaScores?.slice(0, 5).map((c) => (
                    <span
                      key={c.criterionId}
                      className="px-2.5 py-1 rounded-lg bg-base-300/40 border border-base-content/5 flex items-center gap-1.5"
                    >
                      <span className="text-base-content/70">{c.criterionName}:</span>
                      <strong className={c.score >= 80 ? 'text-emerald-400' : c.score >= 65 ? 'text-cyan-400' : 'text-amber-400'}>
                        {c.score}
                      </strong>
                    </span>
                  ))}
                  <span className="text-xs text-base-content/40 self-center">
                    +{opt.criteriaScores?.length - 5} more dimensions
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: CROSS-OPTION COMPARISON & CHARTS */}
      {activeTab === 'comparison' && (
        <div className="space-y-8">
          {/* Radar Chart: Multidimensional Profiling */}
          <div className="glass-panel p-6 space-y-4">
            <div>
              <h3 className="font-bold text-base flex items-center gap-2">
                <FiShield className="w-4 h-4 text-cyan-400" />
                <span>Multidimensional Profile Overlay</span>
              </h3>
              <p className="text-xs text-base-content/60">
                Overlaying criteria scores across all options to identify structural asymmetries.
              </p>
            </div>

            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarCriteriaData}>
                  <PolarGrid stroke="rgba(255,255,255,0.15)" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: 'currentColor', fontSize: 10, opacity: 0.8 }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="rgba(255,255,255,0.2)" />
                  {optionsAnalysis.map((opt, i) => (
                    <Radar
                      key={opt.optionId}
                      name={opt.optionTitle}
                      dataKey={opt.optionTitle}
                      stroke={colors[i % colors.length]}
                      fill={colors[i % colors.length]}
                      fillOpacity={0.25}
                    />
                  ))}
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1e293b',
                      borderRadius: '12px',
                      border: '1px solid rgba(255,255,255,0.1)',
                      fontSize: '12px',
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Criterion by Criterion Comparison Table */}
          <div className="glass-panel p-6 space-y-4 overflow-x-auto">
            <h3 className="font-bold text-base">Dimension-by-Dimension Breakdown</h3>
            <table className="table table-sm w-full">
              <thead>
                <tr className="border-b border-base-content/10 text-xs text-base-content/60">
                  <th>Evaluation Dimension</th>
                  <th>Weight</th>
                  {optionsAnalysis.map((opt) => (
                    <th key={opt.optionId} className="text-center font-bold">
                      {opt.optionTitle}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {optionsAnalysis[0]?.criteriaScores?.map((crit) => (
                  <tr key={crit.criterionId} className="hover:bg-base-300/30 text-xs">
                    <td className="font-semibold text-base-content">
                      <div>{crit.criterionName}</div>
                      <span className="text-[10px] text-base-content/50">{crit.category}</span>
                    </td>
                    <td>
                      <span className="badge badge-neutral badge-xs font-mono">{crit.weight}/10</span>
                    </td>
                    {optionsAnalysis.map((opt) => {
                      const match = opt.criteriaScores?.find((c) => c.criterionId === crit.criterionId);
                      const s = match ? match.score : 0;
                      return (
                        <td key={opt.optionId} className="text-center">
                          <span
                            className={`font-bold px-2 py-0.5 rounded ${
                              s >= 85
                                ? 'bg-emerald-500/15 text-emerald-400'
                                : s >= 70
                                ? 'bg-cyan-500/15 text-cyan-400'
                                : s >= 55
                                ? 'bg-amber-500/15 text-amber-400'
                                : 'bg-rose-500/15 text-rose-400'
                            }`}
                          >
                            {s}
                          </span>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Key Trade-Offs & Ethical Disagreements */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="glass-panel p-6 space-y-3">
              <h4 className="font-bold text-sm text-cyan-400 flex items-center gap-2">
                <TbScale className="w-4 h-4" />
                <span>Critical Trade-Offs Identified</span>
              </h4>
              <ul className="space-y-2 text-xs text-base-content/80">
                {(comparative.keyTradeOffs || []).map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-cyan-400 mt-0.5">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="glass-panel p-6 space-y-3">
              <h4 className="font-bold text-sm text-amber-400 flex items-center gap-2">
                <FiAlertTriangle className="w-4 h-4" />
                <span>Ethical Disagreements & Value Clashes</span>
              </h4>
              <ul className="space-y-2 text-xs text-base-content/80">
                {(comparative.ethicalDisagreements || []).map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-amber-400 mt-0.5">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: OPTION DEEP REASONING */}
      {activeTab === 'deep_dive' && selectedOption && (
        <div className="space-y-6">
          {/* Option Selector Pills */}
          <div className="flex flex-wrap gap-2 no-print">
            {optionsAnalysis.map((opt) => (
              <button
                key={opt.optionId}
                onClick={() => setSelectedOptionId(opt.optionId)}
                className={`btn btn-sm rounded-xl font-bold gap-2 ${
                  selectedOption.optionId === opt.optionId
                    ? 'btn-primary'
                    : 'btn-ghost bg-base-200'
                }`}
              >
                <span>Rank #{opt.rank}</span>
                <span>{opt.optionTitle}</span>
              </button>
            ))}
          </div>

          {/* Option Focus Card */}
          <div className="glass-panel p-6 sm:p-8 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-base-content/10 pb-4">
              <div>
                <span className="badge badge-primary badge-sm font-bold mb-1">
                  Rank #{selectedOption.rank} Analysis
                </span>
                <h3 className="text-2xl font-black">{selectedOption.optionTitle}</h3>
                <p className="text-xs text-base-content/60 mt-1">
                  Confidence: {selectedOption.confidenceScore}% • Evidence Quality: {selectedOption.evidenceQuality}
                </p>
              </div>
              <ScoreBadge score={selectedOption.finalScore} size="xl" showLabel />
            </div>

            {/* Strengths & Weaknesses Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 space-y-2">
                <h4 className="font-bold text-xs uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                  <FiCheckCircle className="w-3.5 h-3.5" /> Strengths & Catalysts
                </h4>
                <ul className="space-y-1.5 text-xs text-base-content/80">
                  {(selectedOption.strengths || []).map((s, i) => (
                    <li key={i} className="flex items-start gap-1.5">
                      <span className="text-emerald-400">✓</span> <span>{s}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 space-y-2">
                <h4 className="font-bold text-xs uppercase tracking-wider text-rose-400 flex items-center gap-1.5">
                  <FiAlertTriangle className="w-3.5 h-3.5" /> Weaknesses & Vulnerabilities
                </h4>
                <ul className="space-y-1.5 text-xs text-base-content/80">
                  {(selectedOption.weaknesses || []).map((w, i) => (
                    <li key={i} className="flex items-start gap-1.5">
                      <span className="text-rose-400">✗</span> <span>{w}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Consequences & Time Horizon */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-base-300/40 border border-base-content/10 space-y-2">
                <h4 className="font-bold text-xs uppercase tracking-wider text-cyan-400">
                  Short-Term Outcomes (0-12 Months)
                </h4>
                <ul className="space-y-1 text-xs text-base-content/80">
                  {(selectedOption.possibleConsequences?.shortTerm || []).map((st, i) => (
                    <li key={i}>• {st}</li>
                  ))}
                </ul>
              </div>

              <div className="p-4 rounded-2xl bg-base-300/40 border border-base-content/10 space-y-2">
                <h4 className="font-bold text-xs uppercase tracking-wider text-indigo-400">
                  Long-Term Compounding (1-5 Years)
                </h4>
                <ul className="space-y-1 text-xs text-base-content/80">
                  {(selectedOption.possibleConsequences?.longTerm || []).map((lt, i) => (
                    <li key={i}>• {lt}</li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Best Case vs Worst Case Scenarios */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-base-300/40 border border-base-content/10 space-y-1.5">
                <h4 className="font-bold text-xs uppercase tracking-wider text-teal-400">
                  Best-Case Scenario
                </h4>
                <p className="text-xs text-base-content/80 leading-relaxed">
                  {selectedOption.bestCaseScenario || 'Maximum strategic upside realized with zero execution friction.'}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-base-300/40 border border-base-content/10 space-y-1.5">
                <h4 className="font-bold text-xs uppercase tracking-wider text-amber-400">
                  Worst-Case Scenario (Tail Risk)
                </h4>
                <p className="text-xs text-base-content/80 leading-relaxed">
                  {selectedOption.worstCaseScenario || 'Adverse market headwinds require strategic pivot with contained fallout.'}
                </p>
              </div>
            </div>

            {/* Assumptions & Counterarguments */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-base-300/30 border border-base-content/5 space-y-1.5">
                <h4 className="font-bold text-xs uppercase tracking-wider text-base-content/60">
                  Underlying Assumptions
                </h4>
                <ul className="text-xs text-base-content/70 space-y-1">
                  {(selectedOption.assumptions || []).map((a, i) => (
                    <li key={i}>• {a}</li>
                  ))}
                </ul>
              </div>

              <div className="p-4 rounded-2xl bg-base-300/30 border border-base-content/5 space-y-1.5">
                <h4 className="font-bold text-xs uppercase tracking-wider text-base-content/60">
                  Critical Counterarguments
                </h4>
                <ul className="text-xs text-base-content/70 space-y-1">
                  {(selectedOption.counterarguments || []).map((c, i) => (
                    <li key={i}>• {c}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: EXPLAINABILITY & TRANSPARENCY */}
      {activeTab === 'explainability' && (
        <div className="glass-panel p-6 sm:p-8 space-y-6">
          <div>
            <h3 className="text-xl font-bold flex items-center gap-2">
              <FiShield className="w-5 h-5 text-cyan-400" />
              <span>Algorithmic Transparency & Limitations</span>
            </h3>
            <p className="text-xs text-base-content/60 mt-1">
              DECISION MATRIX operates under strict explainability standards: no black-box predictions.
            </p>
          </div>

          <div className="space-y-4 text-xs leading-relaxed text-base-content/80">
            <div className="p-4 rounded-xl bg-base-300/40 space-y-1">
              <h4 className="font-bold text-base-content">Evaluation Methodology:</h4>
              <p>{explainability.evaluationMethodology}</p>
            </div>

            <div className="p-4 rounded-xl bg-base-300/40 space-y-1">
              <h4 className="font-bold text-base-content">Scoring Breakdown Formula:</h4>
              <p>{explainability.scoringBreakdownExplanation}</p>
              <div className="font-mono text-cyan-400 pt-1">
                Final Score = Σ (Criterion Score × Weight) / Σ Weights
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-base-300/40 space-y-1">
                <h4 className="font-bold text-base-content">Potential Algorithmic Biases:</h4>
                <ul className="space-y-1 list-disc pl-4 text-base-content/70">
                  {(explainability.potentialBiases || []).map((b, i) => (
                    <li key={i}>{b}</li>
                  ))}
                </ul>
              </div>

              <div className="p-4 rounded-xl bg-base-300/40 space-y-1">
                <h4 className="font-bold text-base-content">Evidence Limitations:</h4>
                <ul className="space-y-1 list-disc pl-4 text-base-content/70">
                  {(explainability.evidenceLimitations || []).map((l, i) => (
                    <li key={i}>{l}</li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Professional Legal / Health / Finance Disclaimer */}
            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-200/90 space-y-2">
              <h4 className="font-bold uppercase tracking-wider flex items-center gap-2">
                <FiAlertTriangle className="w-4 h-4 text-amber-400" />
                <span>Professional Consultation Notice</span>
              </h4>
              <p className="leading-relaxed">
                {explainability.professionalDisclaimer ||
                  'This evaluation is an analytical cognitive framework designed for structured decision support. Never present AI recommendations as absolute truth. For medical, legal, fiduciary, or safety-critical decisions, consult qualified and accredited professionals.'}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EvaluationResultsPage;
