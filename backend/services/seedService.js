const Decision = require('../models/Decision');
const ScoringService = require('./scoringService');
const AIService = require('./aiService');
const { isDbConnected } = require('../config/db');

const SAMPLE_DECISIONS = [
  {
    title: 'Career Trajectory: Tech Specialization vs Founder Pathway',
    description: 'Evaluating optimal career focus for the next 5 years considering market changes, AI automation, financial security, and personal life balance.',
    budgetConstraint: 'Self-funded transition budget: $20,000 liquid capital.',
    timeframe: 'Next 6 months for initial pivot; 5-year strategic horizon.',
    personalPriorities: 'Long-term autonomy, high ethical impact, financial resilience, continuous learning.',
    additionalContext: 'Currently 4 years of software development experience; strong fundamentals in full-stack engineering.',
    options: [
      {
        id: 'opt_1',
        title: 'Option A: Senior Full-Stack & AI Systems Engineering',
        description: 'Focus on enterprise AI integration, scalable distributed systems, and team technical leadership.',
      },
      {
        id: 'opt_2',
        title: 'Option B: Cybersecurity & Infrastructure Resilience',
        description: 'Specialize in cloud defense, zero-trust architectures, and critical infrastructure safety.',
      },
      {
        id: 'opt_3',
        title: 'Option C: Technical Co-Founder / SaaS Startup Venture',
        description: 'Launch an AI-driven B2B product as technical founder, seeking venture validation.',
      },
      {
        id: 'opt_4',
        title: 'Option D: Specialized AI & Data Science Research',
        description: 'Pursue deep learning, model alignment, and custom fine-tuning consultancy.',
      },
    ],
    customWeights: {
      moral_correctness: 8,
      ethical_responsibility: 9,
      logical_consistency: 9,
      evidence_support: 8,
      long_term_benefits: 10,
      short_term_benefits: 6,
      risk_harm: 9,
      financial_feasibility: 8,
      social_impact: 8,
      human_welfare: 9,
      sustainability: 8,
      practical_feasibility: 9,
      fairness_equality: 8,
      personal_goal_alignment: 10,
    },
  },
  {
    title: 'Cloud Architecture: Kubernetes Microservices vs Managed Serverless',
    description: 'Selecting backend core infrastructure for a scaling real-time enterprise collaboration product.',
    budgetConstraint: '$3,500/month maximum baseline cloud infrastructure budget.',
    timeframe: 'Architecture freeze within 3 weeks; production rollout in 90 days.',
    personalPriorities: 'High reliability, low operational maintenance overhead, rapid developer iteration.',
    additionalContext: 'Team consists of 5 developers with strong JavaScript/Node.js experience but limited dedicated DevOps staff.',
    options: [
      {
        id: 'arch_1',
        title: 'Option 1: Managed Container Cluster (Kubernetes/EKS)',
        description: 'Full containerization with Helm, custom service meshes, and auto-scaling pods.',
      },
      {
        id: 'arch_2',
        title: 'Option 2: Hybrid Serverless & Managed PaaS (Railway / Render)',
        description: 'Stateless Node.js services deployed on modern platform-as-a-service with automated Git CI/CD.',
      },
      {
        id: 'arch_3',
        title: 'Option 3: Pure Event-Driven Functions (AWS Lambda / Cloudflare)',
        description: 'Event-driven serverless architecture using micro-functions and edge key-value storage.',
      },
    ],
    customWeights: {
      logical_consistency: 9,
      practical_feasibility: 10,
      financial_feasibility: 9,
      risk_harm: 9,
      long_term_benefits: 8,
      short_term_benefits: 8,
      sustainability: 8,
    },
  },
];

async function seedInitialDecisions(appLocals = {}) {
  const populateMemory = () => {
    if (appLocals && appLocals.fallbackDecisions) {
      SAMPLE_DECISIONS.forEach((sample, idx) => {
        const aiResult = AIService.evaluateWithCognitiveEngine(sample, sample.customWeights);
        const scored = ScoringService.processRankings(aiResult.optionsAnalysis, sample.customWeights);
        const comparative = ScoringService.generateComparativeSynthesis(scored.processedOptions, sample);
        const id = `mock_decision_${idx + 1}`;

        appLocals.fallbackDecisions.set(id, {
          _id: id,
          id,
          ...sample,
          status: 'completed',
          createdAt: new Date(Date.now() - idx * 3600000),
          updatedAt: new Date(Date.now() - idx * 3600000),
          evaluation: {
            evaluatedAt: new Date(),
            modelUsed: aiResult.modelUsed,
            executiveSummary: aiResult.executiveSummary,
            optionsAnalysis: scored.processedOptions,
            comparativeAnalysis: comparative,
            explainability: aiResult.explainability,
          },
        });
      });
      console.log(`[Seed Service] Loaded ${appLocals.fallbackDecisions.size} decisions into in-memory store.`);
    }
  };

  if (!isDbConnected()) {
    populateMemory();
    return;
  }

  try {
    const existingCount = await Decision.countDocuments();
    if (existingCount > 0) {
      console.log(`[Seed Service] Found ${existingCount} decisions already in database.`);
      return;
    }

    console.log('[Seed Service] Seeding initial demonstrative decisions into MongoDB...');

    for (const sample of SAMPLE_DECISIONS) {
      const aiResult = AIService.evaluateWithCognitiveEngine(sample, sample.customWeights);
      const scored = ScoringService.processRankings(aiResult.optionsAnalysis, sample.customWeights);
      const comparative = ScoringService.generateComparativeSynthesis(scored.processedOptions, sample);

      const decisionDoc = new Decision({
        title: sample.title,
        description: sample.description,
        budgetConstraint: sample.budgetConstraint,
        timeframe: sample.timeframe,
        personalPriorities: sample.personalPriorities,
        additionalContext: sample.additionalContext,
        options: sample.options,
        customWeights: sample.customWeights,
        status: 'completed',
        isGuest: false,
        evaluation: {
          evaluatedAt: new Date(),
          modelUsed: aiResult.modelUsed,
          executiveSummary: aiResult.executiveSummary,
          optionsAnalysis: scored.processedOptions,
          comparativeAnalysis: comparative,
          explainability: aiResult.explainability,
        },
      });

      await decisionDoc.save();
    }

    console.log('[Seed Service] Sample decisions seeded successfully.');
  } catch (err) {
    console.warn(`[Seed Service] Database seeding skipped (${err.message}). Populating memory store.`);
    populateMemory();
  }
}

module.exports = {
  seedInitialDecisions,
  SAMPLE_DECISIONS,
};
