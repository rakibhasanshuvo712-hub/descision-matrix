const mongoose = require('mongoose');

const criterionScoreSchema = new mongoose.Schema(
  {
    criterionId: { type: String, required: true },
    criterionName: { type: String, required: true },
    score: { type: Number, required: true, min: 0, max: 100 },
    weight: { type: Number, required: true, min: 1, max: 10 },
    weightedScore: { type: Number, required: true },
    reasoning: { type: String, default: '' },
  },
  { _id: false }
);

const optionAnalysisSchema = new mongoose.Schema(
  {
    optionId: { type: String, required: true },
    optionTitle: { type: String, required: true },
    finalScore: { type: Number, required: true },
    rank: { type: Number, required: true },
    confidenceScore: { type: Number, default: 85 },
    evidenceQuality: {
      type: String,
      enum: ['High', 'Moderate', 'Limited', 'Theoretical'],
      default: 'Moderate',
    },
    criteriaScores: [criterionScoreSchema],
    strengths: [String],
    weaknesses: [String],
    advantages: [String],
    disadvantages: [String],
    ethicalConcerns: [String],
    possibleConsequences: {
      shortTerm: [String],
      longTerm: [String],
    },
    hiddenRisks: [String],
    bestCaseScenario: String,
    worstCaseScenario: String,
    assumptions: [String],
    supportingEvidence: [String],
    counterarguments: [String],
  },
  { _id: false }
);

const decisionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true,
    },
    isGuest: {
      type: Boolean,
      default: false,
    },
    guestSessionId: {
      type: String,
      default: null,
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Decision title is required'],
      trim: true,
      maxlength: 200,
    },
    description: {
      type: String,
      required: [true, 'Situation context/description is required'],
      trim: true,
    },
    budgetConstraint: {
      type: String,
      default: '',
    },
    timeframe: {
      type: String,
      default: '',
    },
    personalPriorities: {
      type: String,
      default: '',
    },
    additionalContext: {
      type: String,
      default: '',
    },
    options: [
      {
        id: { type: String, required: true },
        title: { type: String, required: true },
        description: { type: String, default: '' },
      },
    ],
    customWeights: {
      type: Map,
      of: Number,
      default: {},
    },
    status: {
      type: String,
      enum: ['draft', 'evaluating', 'completed', 'failed'],
      default: 'draft',
    },
    evaluation: {
      evaluatedAt: { type: Date, default: null },
      modelUsed: { type: String, default: 'Gemini-2.5-Pro-Matrix' },
      executiveSummary: { type: String, default: '' },
      optionsAnalysis: [optionAnalysisSchema],
      comparativeAnalysis: {
        winner: {
          optionId: String,
          optionTitle: String,
          score: Number,
          reason: String,
        },
        secondBest: {
          optionId: String,
          optionTitle: String,
          score: Number,
          reason: String,
        },
        lowestPriority: {
          optionId: String,
          optionTitle: String,
          score: Number,
          reason: String,
        },
        keyTradeOffs: [String],
        ethicalDisagreements: [String],
        missingInformation: [String],
        explanationOfDifferences: String,
        criticalTippingPoints: [String],
      },
      explainability: {
        evaluationMethodology: String,
        scoringBreakdownExplanation: String,
        assumptionsMade: [String],
        evidenceLimitations: [String],
        potentialBiases: [String],
        conflictingEthicalPrinciples: [String],
        alternativeInterpretations: [String],
        professionalDisclaimer: String,
      },
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Decision', decisionSchema);
