import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  FiPlus,
  FiTrash2,
  FiSliders,
  FiLayers,
  FiArrowRight,
  FiRotateCcw,
  FiZap,
  FiAlertCircle,
  FiCheckCircle,
  FiInfo,
} from 'react-icons/fi';
import { TbBrain, TbScale } from 'react-icons/tb';

const DEFAULT_CRITERIA = [
  { id: 'moral_correctness', name: 'Moral Correctness', category: 'Ethics & Principles', defaultWeight: 8, description: 'Alignment with fundamental moral values and human conscience.' },
  { id: 'ethical_responsibility', name: 'Ethical Responsibility', category: 'Ethics & Principles', defaultWeight: 8, description: 'Accountability, duty, integrity, and ethical leadership.' },
  { id: 'logical_consistency', name: 'Logical Consistency', category: 'Reasoning & Facts', defaultWeight: 8, description: 'Internal coherence, sound premises, and absence of contradiction.' },
  { id: 'evidence_support', name: 'Evidence & Factual Support', category: 'Reasoning & Facts', defaultWeight: 7, description: 'Grounded in empirical precedents, data, or verified history.' },
  { id: 'long_term_benefits', name: 'Long-Term Benefits', category: 'Outcomes & Impact', defaultWeight: 9, description: 'Compounding growth, durable fulfillment, and future payoff.' },
  { id: 'short_term_benefits', name: 'Short-Term Benefits', category: 'Outcomes & Impact', defaultWeight: 6, description: 'Immediate wins, swift relief, and quick time-to-value.' },
  { id: 'risk_harm', name: 'Risk & Potential Harm (Safety)', category: 'Risk & Resilience', defaultWeight: 9, description: 'Resilience against catastrophe, safety buffers (higher weight = prioritize safety).' },
  { id: 'financial_feasibility', name: 'Financial Feasibility', category: 'Resources & Practicality', defaultWeight: 8, description: 'Economic runway, capital affordability, and return on investment.' },
  { id: 'social_impact', name: 'Social Impact', category: 'Community & Society', defaultWeight: 7, description: 'Influence on relationships, community, and public perception.' },
  { id: 'human_welfare', name: 'Human Welfare', category: 'Ethics & Principles', defaultWeight: 9, description: 'Protection of health, mental peace, and stakeholder dignity.' },
  { id: 'sustainability', name: 'Sustainability', category: 'Outcomes & Impact', defaultWeight: 7, description: 'Long-term ecological, operational, and energetic viability.' },
  { id: 'practical_feasibility', name: 'Practical Feasibility', category: 'Resources & Practicality', defaultWeight: 8, description: 'Ease of execution, skill requirements, and operational friction.' },
  { id: 'fairness_equality', name: 'Fairness & Equality', category: 'Ethics & Principles', defaultWeight: 8, description: 'Equitable burden distribution and absence of discrimination.' },
  { id: 'personal_goal_alignment', name: 'Personal Goal Alignment', category: 'Outcomes & Impact', defaultWeight: 10, description: 'Congruence with your core authentic ambitions and values.' },
];

const TEMPLATES = [
  {
    name: 'Career Choice: Software vs Data vs Cyber vs Startup',
    title: 'Which career path should I choose for the next 5 years?',
    description: 'Evaluating long-term technical mastery, job satisfaction, market demand, and work-life balance.',
    budget: '$10,000 for courses and self-development certifications.',
    timeframe: 'Decision needed within 30 days.',
    priorities: 'Long-term autonomy, financial stability, intellectual challenge, ethical integrity.',
    options: [
      { id: 'opt_1', title: 'Option A: Software Engineering', description: 'Full-stack application development, distributed systems architecture, and engineering management.' },
      { id: 'opt_2', title: 'Option B: Data Science & AI', description: 'Machine learning model development, statistical analysis, predictive algorithms, and AI solutions.' },
      { id: 'opt_3', title: 'Option C: Cybersecurity', description: 'Information security defense, penetration testing, threat intelligence, and zero-trust systems.' },
      { id: 'opt_4', title: 'Option D: Entrepreneurship', description: 'Launching a technology startup, building custom SaaS, seeking venture funding, and bootstrapping.' },
    ],
  },
  {
    name: 'Product Tech Stack: SQL vs NoSQL Database',
    title: 'Database Architecture Selection for Enterprise SaaS',
    description: 'Choosing core persistence layer for an enterprise multi-tenant analytics and transaction application.',
    budget: 'Cloud infrastructure budget of $2,000/month.',
    timeframe: 'Launch in 4 months.',
    priorities: 'Data integrity (ACID), schema flexibility, developer velocity, global scale.',
    options: [
      { id: 'opt_1', title: 'PostgreSQL with Row Level Security', description: 'Relational model with strong ACID transactions, relational integrity, and pgvector extension.' },
      { id: 'opt_2', title: 'MongoDB Atlas Distributed Cluster', description: 'Document schema flexibility, horizontal sharding, rapid JSON iteration, and native search.' },
    ],
  },
];

const CreateDecisionPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [budgetConstraint, setBudgetConstraint] = useState('');
  const [timeframe, setTimeframe] = useState('');
  const [personalPriorities, setPersonalPriorities] = useState('');
  const [additionalContext, setAdditionalContext] = useState('');

  // Options State (Minimum 2)
  const [options, setOptions] = useState([
    { id: 'opt_1', title: '', description: '' },
    { id: 'opt_2', title: '', description: '' },
  ]);

  // Weights State
  const [weights, setWeights] = useState(() => {
    const initial = {};
    DEFAULT_CRITERIA.forEach((c) => {
      initial[c.id] = c.defaultWeight;
    });
    return initial;
  });

  const [activeTab, setActiveTab] = useState('context'); // 'context' | 'options' | 'weights'
  const [evaluating, setEvaluating] = useState(false);
  const [evaluationStage, setEvaluationStage] = useState('');
  const [error, setError] = useState('');

  // Apply Template
  const applyTemplate = (template) => {
    setTitle(template.title);
    setDescription(template.description);
    setBudgetConstraint(template.budget);
    setTimeframe(template.timeframe);
    setPersonalPriorities(template.priorities);
    setOptions(template.options);
    setError('');
  };

  // Options handlers
  const handleAddOption = () => {
    const nextIdx = options.length + 1;
    setOptions([
      ...options,
      {
        id: `opt_${Date.now()}`,
        title: `Option ${String.fromCharCode(65 + options.length)}`,
        description: '',
      },
    ]);
  };

  const handleRemoveOption = (indexToRemove) => {
    if (options.length <= 2) {
      setError('A decision requires at least two (2) alternatives for comparative evaluation.');
      return;
    }
    setOptions(options.filter((_, idx) => idx !== indexToRemove));
  };

  const handleOptionChange = (index, field, value) => {
    const updated = [...options];
    updated[index][field] = value;
    setOptions(updated);
  };

  const handleWeightChange = (critId, val) => {
    setWeights((prev) => ({
      ...prev,
      [critId]: Number(val),
    }));
  };

  const resetWeights = () => {
    const reset = {};
    DEFAULT_CRITERIA.forEach((c) => {
      reset[c.id] = c.defaultWeight;
    });
    setWeights(reset);
  };

  // Submit and Evaluate
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!title.trim()) {
      setActiveTab('context');
      return setError('Please enter a clear decision title.');
    }
    if (!description.trim()) {
      setActiveTab('context');
      return setError('Please provide the situation context and description.');
    }
    if (options.length < 2) {
      setActiveTab('options');
      return setError('Please provide at least two (2) distinct options.');
    }
    for (let i = 0; i < options.length; i++) {
      if (!options[i].title.trim()) {
        setActiveTab('options');
        return setError(`Please provide a title for Option ${i + 1}.`);
      }
    }

    setEvaluating(true);
    setEvaluationStage('Decomposing decision context and validating criteria...');

    const stageTimer1 = setTimeout(() => {
      setEvaluationStage('Evaluating ethical, logical, and evidence dimensions independently...');
    }, 1500);

    const stageTimer2 = setTimeout(() => {
      setEvaluationStage('Computing weighted multi-criteria utility matrix & tie breakers...');
    }, 3000);

    const stageTimer3 = setTimeout(() => {
      setEvaluationStage('Synthesizing comparative tradeoffs and explainability report...');
    }, 4500);

    try {
      const payload = {
        title,
        description,
        budgetConstraint,
        timeframe,
        personalPriorities,
        additionalContext,
        options,
        customWeights: weights,
        evaluateNow: true,
      };

      const res = await api.post('/decisions', payload);
      clearTimeout(stageTimer1);
      clearTimeout(stageTimer2);
      clearTimeout(stageTimer3);

      navigate(`/decisions/${res.data.decision._id || res.data.decision.id}`);
    } catch (err) {
      clearTimeout(stageTimer1);
      clearTimeout(stageTimer2);
      clearTimeout(stageTimer3);
      setEvaluating(false);
      setError(err.message || 'Evaluation process encountered an error. Please retry.');
    }
  };

  // Group criteria by category for clean UI
  const categories = Array.from(new Set(DEFAULT_CRITERIA.map((c) => c.category)));

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16">
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            Create <span className="text-cyan-400">Decision Matrix</span>
          </h1>
          <p className="text-xs sm:text-sm text-base-content/60 mt-1">
            Define your decision context, configure options, and calibrate your 14 evaluation dimensions.
          </p>
        </div>

        {/* Template Selector Dropdown */}
        <div className="dropdown dropdown-end">
          <div
            tabIndex={0}
            role="button"
            className="btn btn-outline btn-sm rounded-xl gap-1.5 border-base-content/20 text-xs"
          >
            <FiZap className="w-3.5 h-3.5 text-amber-400" />
            <span>Load Example Template</span>
          </div>
          <ul
            tabIndex={0}
            className="dropdown-content menu p-2 shadow-xl bg-base-200 border border-base-content/10 rounded-2xl w-80 mt-2 z-50 text-xs"
          >
            <li className="menu-title px-2 py-1 text-base-content/50 uppercase">Pre-Built Scenarios</li>
            {TEMPLATES.map((tmpl, idx) => (
              <li key={idx}>
                <button
                  type="button"
                  onClick={() => applyTemplate(tmpl)}
                  className="py-2 flex flex-col items-start gap-0.5 hover:bg-base-300/80 rounded-lg"
                >
                  <span className="font-bold text-cyan-400">{tmpl.name}</span>
                  <span className="text-[11px] text-base-content/60 truncate max-w-[260px]">
                    {tmpl.title}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Evaluating Overlay / Loading state */}
      {evaluating && (
        <div className="glass-panel p-8 sm:p-12 text-center space-y-6 border-cyan-500/40 glow-cyan">
          <div className="w-16 h-16 rounded-3xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center mx-auto animate-pulse">
            <TbBrain className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-bold">Multi-Criteria Engine Analyzing...</h3>
            <p className="text-sm text-cyan-400 font-mono tracking-wide">{evaluationStage}</p>
          </div>
          <progress className="progress progress-primary w-full max-w-md mx-auto" />
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] text-base-content/50 max-w-lg mx-auto">
            <span>✓ Deontological Duty</span>
            <span>✓ Causal Consistency</span>
            <span>✓ Risk Harm Buffer</span>
            <span>✓ Consequence Tree</span>
          </div>
        </div>
      )}

      {/* Main Form Tabs */}
      {!evaluating && (
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="alert alert-error text-xs p-3.5 rounded-xl flex items-center gap-2">
              <FiAlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Stepper / Tabs Header */}
          <div className="grid grid-cols-3 gap-2 p-1.5 rounded-2xl bg-base-200/60 border border-base-content/10">
            <button
              type="button"
              onClick={() => setActiveTab('context')}
              className={`py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all ${
                activeTab === 'context'
                  ? 'bg-primary text-primary-content shadow-sm'
                  : 'text-base-content/60 hover:text-base-content'
              }`}
            >
              <FiLayers className="w-4 h-4" />
              <span>1. Context</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('options')}
              className={`py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all ${
                activeTab === 'options'
                  ? 'bg-primary text-primary-content shadow-sm'
                  : 'text-base-content/60 hover:text-base-content'
              }`}
            >
              <TbScale className="w-4 h-4" />
              <span>2. Options ({options.length})</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('weights')}
              className={`py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all ${
                activeTab === 'weights'
                  ? 'bg-primary text-primary-content shadow-sm'
                  : 'text-base-content/60 hover:text-base-content'
              }`}
            >
              <FiSliders className="w-4 h-4" />
              <span>3. Weights (14)</span>
            </button>
          </div>

          {/* TAB 1: CONTEXT */}
          {activeTab === 'context' && (
            <div className="glass-panel p-6 sm:p-8 space-y-5">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-base-content/70 mb-1.5">
                  Decision Title *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., Which career path should I pursue for the next 5 years?"
                  className="input input-bordered w-full rounded-xl text-sm font-semibold focus:border-cyan-400"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-base-content/70 mb-1.5">
                  Situation & Problem Description *
                </label>
                <textarea
                  required
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe your current circumstance, background, why this decision matters, and what key conflicts or uncertainties you face..."
                  className="textarea textarea-bordered w-full rounded-xl text-sm leading-relaxed focus:border-cyan-400"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-base-content/70 mb-1.5">
                    Budget / Resource Constraints (Optional)
                  </label>
                  <input
                    type="text"
                    value={budgetConstraint}
                    onChange={(e) => setBudgetConstraint(e.target.value)}
                    placeholder="e.g., $15,000 max budget, 15 hrs/week"
                    className="input input-bordered w-full rounded-xl text-sm focus:border-cyan-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-base-content/70 mb-1.5">
                    Decision Deadline / Timeframe (Optional)
                  </label>
                  <input
                    type="text"
                    value={timeframe}
                    onChange={(e) => setTimeframe(e.target.value)}
                    placeholder="e.g., Needed within 45 days"
                    className="input input-bordered w-full rounded-xl text-sm focus:border-cyan-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-base-content/70 mb-1.5">
                  Personal Priorities & Values (Optional)
                </label>
                <input
                  type="text"
                  value={personalPriorities}
                  onChange={(e) => setPersonalPriorities(e.target.value)}
                  placeholder="e.g., High autonomy, work-life balance, ethical impact, rapid learning"
                  className="input input-bordered w-full rounded-xl text-sm focus:border-cyan-400"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-base-content/70 mb-1.5">
                  Additional Context or Constraints (Optional)
                </label>
                <input
                  type="text"
                  value={additionalContext}
                  onChange={(e) => setAdditionalContext(e.target.value)}
                  placeholder="e.g., Willing to relocate, risk tolerance is moderate, family considerations"
                  className="input input-bordered w-full rounded-xl text-sm focus:border-cyan-400"
                />
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('options')}
                  className="btn btn-primary rounded-xl gap-2 font-bold px-6"
                >
                  <span>Next: Configure Options</span>
                  <FiArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: OPTIONS */}
          {activeTab === 'options' && (
            <div className="glass-panel p-6 sm:p-8 space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-base">Alternatives to Evaluate</h3>
                  <p className="text-xs text-base-content/60">
                    Add between 2 and 6 distinct pathways or options.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleAddOption}
                  className="btn btn-outline btn-primary btn-sm rounded-xl gap-1.5 font-semibold"
                >
                  <FiPlus className="w-4 h-4" />
                  <span>Add Option</span>
                </button>
              </div>

              <div className="space-y-4">
                {options.map((opt, idx) => (
                  <div
                    key={opt.id || idx}
                    className="p-4 rounded-2xl bg-base-300/40 border border-base-content/10 space-y-3 relative group"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <span className="w-7 h-7 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center text-xs font-bold">
                          {String.fromCharCode(65 + idx)}
                        </span>
                        <input
                          type="text"
                          required
                          value={opt.title}
                          onChange={(e) => handleOptionChange(idx, 'title', e.target.value)}
                          placeholder={`Option ${String.fromCharCode(65 + idx)} Title (e.g., Senior Software Engineering)`}
                          className="input input-bordered input-sm rounded-xl font-bold text-sm w-64 sm:w-80 focus:border-cyan-400"
                        />
                      </div>

                      {options.length > 2 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveOption(idx)}
                          className="btn btn-ghost btn-xs text-rose-400 hover:bg-rose-500/10 rounded-lg"
                          title="Remove this option"
                        >
                          <FiTrash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    <div>
                      <textarea
                        rows={2}
                        value={opt.description}
                        onChange={(e) => handleOptionChange(idx, 'description', e.target.value)}
                        placeholder="Key specifics, requirements, anticipated scope, and details for this option..."
                        className="textarea textarea-bordered textarea-sm w-full rounded-xl text-xs leading-relaxed focus:border-cyan-400"
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-between pt-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('context')}
                  className="btn btn-ghost rounded-xl text-xs"
                >
                  Back to Context
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('weights')}
                  className="btn btn-primary rounded-xl gap-2 font-bold px-6"
                >
                  <span>Next: Adjust Weights</span>
                  <FiArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: WEIGHTS & EVALUATION */}
          {activeTab === 'weights' && (
            <div className="glass-panel p-6 sm:p-8 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-base-content/10">
                <div>
                  <h3 className="font-bold text-base flex items-center gap-2">
                    <FiSliders className="w-4 h-4 text-cyan-400" />
                    <span>Calibrate Dimension Weights (1 to 10)</span>
                  </h3>
                  <p className="text-xs text-base-content/60">
                    Customize how much each dimension influences the final ranking formula.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={resetWeights}
                  className="btn btn-ghost btn-xs rounded-lg gap-1 text-base-content/60 hover:text-base-content"
                >
                  <FiRotateCcw className="w-3.5 h-3.5" />
                  <span>Reset Defaults</span>
                </button>
              </div>

              {/* Grouped Criteria Sliders */}
              <div className="space-y-6">
                {categories.map((category) => (
                  <div key={category} className="space-y-3">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-cyan-400/90 flex items-center gap-1.5">
                      <FiCheckCircle className="w-3.5 h-3.5" />
                      <span>{category}</span>
                    </h4>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                      {DEFAULT_CRITERIA.filter((c) => c.category === category).map((crit) => (
                        <div
                          key={crit.id}
                          className="p-3.5 rounded-xl bg-base-300/30 border border-base-content/5 space-y-2"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-xs text-base-content">
                              {crit.name}
                            </span>
                            <span className="badge badge-sm badge-neutral font-mono font-bold">
                              Weight: {weights[crit.id] || crit.defaultWeight}/10
                            </span>
                          </div>

                          <p className="text-[11px] text-base-content/60 line-clamp-1">
                            {crit.description}
                          </p>

                          <input
                            type="range"
                            min="1"
                            max="10"
                            value={weights[crit.id] || crit.defaultWeight}
                            onChange={(e) => handleWeightChange(crit.id, e.target.value)}
                            className="range range-xs range-primary"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Evaluation Disclaimer Box */}
              <div className="p-4 rounded-xl bg-base-300/50 border border-base-content/10 text-xs text-base-content/70 flex items-start gap-2.5">
                <FiInfo className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                <p>
                  <strong>Zero Position Bias:</strong> Every option will be evaluated independently on all 14 criteria
                  before weighted summation. Ethical disagreements will be surfaced separately rather than smoothed into an arbitrary single score.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-4 border-t border-base-content/10">
                <button
                  type="button"
                  onClick={() => setActiveTab('options')}
                  className="btn btn-ghost rounded-xl text-xs"
                >
                  Back to Options
                </button>

                <button
                  type="submit"
                  className="btn btn-primary rounded-xl gap-2 font-bold px-8 shadow-lg shadow-primary/30 text-sm"
                >
                  <TbBrain className="w-4 h-4" />
                  <span>Execute Decision Intelligence Analysis</span>
                </button>
              </div>
            </div>
          )}
        </form>
      )}
    </div>
  );
};

export default CreateDecisionPage;
