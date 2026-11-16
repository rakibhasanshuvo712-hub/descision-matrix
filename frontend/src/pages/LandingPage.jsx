import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  FiArrowRight,
  FiShield,
  FiCpu,
  FiLayers,
  FiSliders,
  FiFileText,
  FiCheckCircle,
  FiAlertTriangle,
  FiTarget,
  FiZap,
} from 'react-icons/fi';
import { TbGridDots, TbScale, TbBrain } from 'react-icons/tb';

const LandingPage = () => {
  const { isAuthenticated, startGuestSession } = useAuth();
  const navigate = useNavigate();

  const handleStartGuest = async () => {
    if (isAuthenticated) {
      navigate('/decisions/new');
    } else {
      await startGuestSession();
      navigate('/decisions/new');
    }
  };

  const criteriaHighlights = [
    { title: 'Moral & Ethical Values', desc: 'Conscience, human dignity, rights, and de-ontological duty.', icon: FiShield, color: 'text-emerald-400' },
    { title: 'Logical Reasoning & Evidence', desc: 'Causal coherence, empirical data, and verified precedent.', icon: TbBrain, color: 'text-cyan-400' },
    { title: 'Risk & Potential Harm', desc: 'Downside buffers, failure resilience, and mitigation of catastrophe.', icon: FiAlertTriangle, color: 'text-rose-400' },
    { title: 'Short & Long-Term Compounding', desc: 'Tactical milestones balanced against 5-10 year horizons.', icon: FiLayers, color: 'text-indigo-400' },
    { title: 'Financial & Resource Feasibility', desc: 'Capital expenditure, ROI, cashflow, and execution runway.', icon: TbScale, color: 'text-amber-400' },
    { title: 'Human Welfare & Social Impact', desc: 'Burnout avoidance, mental peace, and equitable stakeholder distribution.', icon: FiTarget, color: 'text-teal-400' },
  ];

  return (
    <div className="space-y-16 md:space-y-24 py-4">
      {/* Hero Section */}
      <section className="relative text-center max-w-4xl mx-auto pt-8 md:pt-16 pb-6">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-semibold uppercase tracking-wider mb-6 animate-pulse">
          <FiZap className="w-3.5 h-3.5" /> Next-Generation Decision Intelligence
        </div>

        <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight leading-tight">
          Make High-Stakes Decisions with <br className="hidden sm:inline" />
          <span className="gradient-text">Zero Bias & Deep Reasoning</span>
        </h1>

        <p className="mt-6 text-base sm:text-lg md:text-xl text-base-content/70 max-w-2xl mx-auto leading-relaxed">
          Submit competing options and let our multi-criteria engine evaluate them across
          <strong> 14 ethical, logical, outcome, and risk dimensions</strong>. Transparent rankings,
          highlighted value conflicts, and unvarnished consequence modeling.
        </p>

        {/* CTA Buttons */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <button
            onClick={handleStartGuest}
            className="btn btn-primary btn-lg rounded-2xl gap-2 shadow-lg shadow-primary/30 px-8 text-base font-bold"
          >
            <span>Launch Decision Engine</span>
            <FiArrowRight className="w-5 h-5" />
          </button>

          <Link
            to="/dashboard"
            className="btn btn-outline btn-lg rounded-2xl gap-2 px-6 text-base font-semibold border-base-content/20 hover:border-cyan-400"
          >
            <TbGridDots className="w-5 h-5 text-cyan-400" />
            <span>Explore Dashboard</span>
          </Link>
        </div>

        {/* Quick Trust badges */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-6 text-xs text-base-content/60">
          <div className="flex items-center gap-1.5">
            <FiCheckCircle className="text-emerald-400 w-4 h-4" /> 14-Dimension Framework
          </div>
          <div className="flex items-center gap-1.5">
            <FiCheckCircle className="text-emerald-400 w-4 h-4" /> Instant Guest Mode
          </div>
          <div className="flex items-center gap-1.5">
            <FiCheckCircle className="text-emerald-400 w-4 h-4" /> Weighted Scoring Formula
          </div>
          <div className="flex items-center gap-1.5">
            <FiCheckCircle className="text-emerald-400 w-4 h-4" /> PDF Report Export
          </div>
        </div>
      </section>

      {/* Interactive Interactive Preview Card */}
      <section className="glass-panel p-6 md:p-8 relative overflow-hidden border-cyan-500/20 glow-cyan">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-base-content/10 pb-5">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-cyan-400">
              Live Interactive Benchmark
            </span>
            <h3 className="text-xl font-bold mt-1">Career Transition: Tech Specialization vs Founder</h3>
            <p className="text-xs text-base-content/60">
              Multi-criteria analysis under $20k budget constraint and 5-year compounding horizon.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="badge badge-success badge-sm gap-1">
              <FiCheckCircle className="w-3 h-3" /> Evaluated
            </span>
            <span className="badge badge-neutral badge-sm">14 Dimensions</span>
          </div>
        </div>

        {/* Options Comparison Strip */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <div className="p-4 rounded-xl bg-cyan-500/10 border border-cyan-500/30">
            <div className="flex justify-between items-start">
              <div>
                <span className="badge badge-primary badge-xs mb-1">Rank #1 Winner</span>
                <h4 className="font-bold text-sm">Senior Full-Stack & AI Systems</h4>
              </div>
              <span className="text-xl font-extrabold text-cyan-400">86.4</span>
            </div>
            <p className="text-xs text-base-content/70 mt-2">
              High practical feasibility (92/100) and strong downside protection against automation.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-base-300/40 border border-base-content/10">
            <div className="flex justify-between items-start">
              <div>
                <span className="badge badge-ghost badge-xs mb-1">Rank #2 Runner-Up</span>
                <h4 className="font-bold text-sm">Cybersecurity & Resilience</h4>
              </div>
              <span className="text-xl font-extrabold text-indigo-400">83.1</span>
            </div>
            <p className="text-xs text-base-content/70 mt-2">
              Top ethical responsibility and safety buffer; slightly higher initial credential friction.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-base-300/40 border border-base-content/10">
            <div className="flex justify-between items-start">
              <div>
                <span className="badge badge-ghost badge-xs mb-1">Rank #3 High Upside</span>
                <h4 className="font-bold text-sm">Technical Co-Founder / SaaS</h4>
              </div>
              <span className="text-xl font-extrabold text-amber-400">77.8</span>
            </div>
            <p className="text-xs text-base-content/70 mt-2">
              Exceptional long-term payoff offset by elevated variance and liquid capital burn.
            </p>
          </div>
        </div>

        {/* Methodology Footer */}
        <div className="mt-6 pt-4 border-t border-base-content/10 flex flex-wrap items-center justify-between text-xs text-base-content/60">
          <div>
            <strong>Transparent Formula:</strong> Score = Σ (Criterion Score × Weight) / Σ Weights
          </div>
          <Link
            to="/decisions/mock_decision_1"
            className="text-cyan-400 hover:underline font-semibold flex items-center gap-1"
          >
            <span>View Complete 14-Dimension Breakdown</span>
            <FiArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </section>

      {/* 14 Multi-Dimensional Criteria Grid */}
      <section className="space-y-8">
        <div className="text-center max-w-2xl mx-auto">
          <span className="text-xs font-bold uppercase tracking-wider text-cyan-400">
            Holistic Evaluation Matrix
          </span>
          <h2 className="text-3xl font-extrabold mt-1">Beyond Shallow Pros and Cons</h2>
          <p className="text-sm text-base-content/70 mt-2">
            Most decision tools just tally positive and negative bullet points. DECISION MATRIX evaluates
            decisions through deep cognitive, ethical, and probabilistic dimensions.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {criteriaHighlights.map((item, i) => {
            const Icon = item.icon;
            return (
              <div
                key={i}
                className="p-5 rounded-2xl bg-base-200/60 border border-base-content/10 hover:border-cyan-500/30 transition-all hover:-translate-y-1"
              >
                <div className={`w-10 h-10 rounded-xl bg-base-300 flex items-center justify-center mb-3 ${item.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-base">{item.title}</h3>
                <p className="text-xs text-base-content/60 mt-1 leading-relaxed">
                  {item.desc}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Explainability & Ethics Banner */}
      <section className="glass-panel p-8 text-center max-w-3xl mx-auto space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center mx-auto">
          <TbScale className="w-6 h-6" />
        </div>
        <h3 className="text-2xl font-bold">Uncompromising Explainability</h3>
        <p className="text-sm text-base-content/70 leading-relaxed">
          We believe high-stakes decisions should never be delegated blindly to an AI. Every evaluation explicitly reveals
          underlying assumptions, highlights ethical disagreements, identifies missing information that could change the ranking,
          and disclaims professional boundaries for safety, medical, and legal decisions.
        </p>
        <div className="pt-2">
          <button
            onClick={handleStartGuest}
            className="btn btn-primary rounded-xl px-6 font-semibold"
          >
            Create Your First Decision
          </button>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
