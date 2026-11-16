const Decision = require('../models/Decision');
const ScoringService = require('../services/scoringService');
const AIService = require('../services/aiService');
const { CRITERIA_DEFINITIONS } = require('../utils/criteriaList');

// @desc    Get all criteria definitions and default weights
// @route   GET /api/decisions/criteria
// @access  Public
const getCriteriaDefinitions = async (req, res) => {
  res.json({
    success: true,
    count: CRITERIA_DEFINITIONS.length,
    criteria: CRITERIA_DEFINITIONS,
  });
};

// @desc    Create new decision (and optionally evaluate immediately)
// @route   POST /api/decisions
// @access  Public / Guest / User
const createDecision = async (req, res, next) => {
  try {
    const {
      title,
      description,
      options,
      budgetConstraint,
      timeframe,
      personalPriorities,
      additionalContext,
      customWeights,
      evaluateNow = true,
      guestSessionId,
    } = req.body;

    // Validation
    if (!title || !title.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Decision title is required.',
      });
    }

    if (!description || !description.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Situation description/context is required.',
      });
    }

    if (!Array.isArray(options) || options.length < 2) {
      return res.status(400).json({
        success: false,
        message: 'At least two (2) distinct options are required for evaluation.',
      });
    }

    // Format options with unique IDs
    const formattedOptions = options.map((opt, idx) => ({
      id: opt.id || `opt_${idx + 1}_${Date.now().toString(36)}`,
      title: opt.title?.trim() || `Option ${String.fromCharCode(65 + idx)}`,
      description: opt.description?.trim() || '',
    }));

    const userId = req.user ? req.user._id || req.user.id : null;
    const isGuest = !userId || req.user?.role === 'guest';
    const activeGuestSession = guestSessionId || req.user?.id || (isGuest ? `guest_${Date.now()}` : null);

    let evaluationResult = null;
    let status = 'draft';

    if (evaluateNow) {
      status = 'evaluating';
      const aiEvaluation = await AIService.evaluateDecision(
        {
          title,
          description,
          budgetConstraint,
          timeframe,
          personalPriorities,
          additionalContext,
          options: formattedOptions,
        },
        customWeights || {}
      );

      // Process intelligent scoring & comparative synthesis
      const scored = ScoringService.processRankings(
        aiEvaluation.optionsAnalysis,
        customWeights || {}
      );

      const comparative = ScoringService.generateComparativeSynthesis(
        scored.processedOptions,
        { title, description }
      );

      evaluationResult = {
        evaluatedAt: new Date(),
        modelUsed: aiEvaluation.modelUsed || 'DecisionMatrix Core Intelligence',
        executiveSummary: aiEvaluation.executiveSummary,
        optionsAnalysis: scored.processedOptions,
        comparativeAnalysis: comparative,
        explainability: aiEvaluation.explainability,
      };

      status = 'completed';
    }

    try {
      const decisionDoc = await Decision.create({
        user: userId,
        isGuest,
        guestSessionId: activeGuestSession,
        title,
        description,
        budgetConstraint: budgetConstraint || '',
        timeframe: timeframe || '',
        personalPriorities: personalPriorities || '',
        additionalContext: additionalContext || '',
        options: formattedOptions,
        customWeights: customWeights || {},
        status,
        evaluation: evaluationResult,
      });

      return res.status(201).json({
        success: true,
        message: evaluateNow
          ? 'Decision evaluated and saved successfully.'
          : 'Decision draft saved successfully.',
        decision: decisionDoc,
      });
    } catch (dbErr) {
      // In-memory fallback
      console.warn('[Decision] Saving to in-memory fallback store.');
      const fallbackDecisions = req.app.locals.fallbackDecisions;
      if (fallbackDecisions) {
        const id = 'dec_' + Date.now();
        const fallbackDoc = {
          _id: id,
          id,
          user: userId,
          isGuest,
          guestSessionId: activeGuestSession,
          title,
          description,
          budgetConstraint: budgetConstraint || '',
          timeframe: timeframe || '',
          personalPriorities: personalPriorities || '',
          additionalContext: additionalContext || '',
          options: formattedOptions,
          customWeights: customWeights || {},
          status,
          evaluation: evaluationResult,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        fallbackDecisions.set(id, fallbackDoc);
        req.app.locals.persistStore?.();

        return res.status(201).json({
          success: true,
          message: evaluateNow
            ? 'Decision evaluated and saved successfully.'
            : 'Decision draft saved successfully.',
          decision: fallbackDoc,
        });
      }
      throw dbErr;
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Get all decisions for the user / guest
// @route   GET /api/decisions
// @access  Public / Optional Auth
const getDecisions = async (req, res, next) => {
  try {
    const userId = req.user ? req.user._id || req.user.id : null;
    const guestSessionId = req.query.guestSessionId;
    const search = req.query.search;

    let query = {};

    if (userId && req.user.role !== 'guest') {
      query.user = userId;
    } else if (guestSessionId) {
      query = {
        $or: [{ guestSessionId }, { isGuest: true }],
      };
    }

    if (search) {
      query.title = { $regex: search, $options: 'i' };
    }

    try {
      let decisions = await Decision.find(query).sort({ createdAt: -1 });

      // If user has no decisions yet and no query filter, return seeded or fallback decisions
      if (decisions.length === 0 && !search) {
        decisions = await Decision.find({}).sort({ createdAt: -1 }).limit(10);
      }

      return res.json({
        success: true,
        count: decisions.length,
        decisions,
      });
    } catch (dbErr) {
      // In-memory fallback
      const fallbackDecisions = req.app.locals.fallbackDecisions;
      let list = [];
      if (fallbackDecisions) {
        list = Array.from(fallbackDecisions.values());
        if (search) {
          list = list.filter((d) => d.title.toLowerCase().includes(search.toLowerCase()));
        }
        list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      }

      return res.json({
        success: true,
        count: list.length,
        decisions: list,
      });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Get single decision by ID
// @route   GET /api/decisions/:id
// @access  Public / Optional Auth
const getDecisionById = async (req, res, next) => {
  try {
    const { id } = req.params;

    try {
      const decision = await Decision.findById(id);
      if (decision) {
        return res.json({
          success: true,
          decision,
        });
      }
    } catch (dbErr) {
      // ignore and try fallback
    }

    // In-memory fallback check
    const fallbackDecisions = req.app.locals.fallbackDecisions;
    const fallbackItem = fallbackDecisions?.get(id);

    if (fallbackItem) {
      return res.json({
        success: true,
        decision: fallbackItem,
      });
    }

    return res.status(404).json({
      success: false,
      message: 'Decision record not found.',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Re-evaluate or update decision
// @route   PUT /api/decisions/:id/evaluate
// @access  Public / Optional Auth
const reevaluateDecision = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { customWeights, updatedOptions } = req.body;

    let decision = null;
    let isFallback = false;

    try {
      decision = await Decision.findById(id);
    } catch (e) {
      // db error
    }

    if (!decision) {
      const fallback = req.app.locals.fallbackDecisions?.get(id);
      if (fallback) {
        decision = fallback;
        isFallback = true;
      } else {
        return res.status(404).json({
          success: false,
          message: 'Decision not found.',
        });
      }
    }

    // Update weights if provided
    const weights = customWeights || decision.customWeights || {};
    if (customWeights) {
      decision.customWeights = customWeights;
    }

    if (updatedOptions && Array.isArray(updatedOptions)) {
      decision.options = updatedOptions;
    }

    // Run AI Evaluation
    const aiEvaluation = await AIService.evaluateDecision(
      {
        title: decision.title,
        description: decision.description,
        budgetConstraint: decision.budgetConstraint,
        timeframe: decision.timeframe,
        personalPriorities: decision.personalPriorities,
        additionalContext: decision.additionalContext,
        options: decision.options,
      },
      weights
    );

    const scored = ScoringService.processRankings(
      aiEvaluation.optionsAnalysis,
      weights
    );

    const comparative = ScoringService.generateComparativeSynthesis(
      scored.processedOptions,
      { title: decision.title, description: decision.description }
    );

    decision.evaluation = {
      evaluatedAt: new Date(),
      modelUsed: aiEvaluation.modelUsed || 'DecisionMatrix Core Intelligence',
      executiveSummary: aiEvaluation.executiveSummary,
      optionsAnalysis: scored.processedOptions,
      comparativeAnalysis: comparative,
      explainability: aiEvaluation.explainability,
    };
    decision.status = 'completed';
    decision.updatedAt = new Date();

    if (!isFallback) {
      await decision.save();
    } else {
      req.app.locals.fallbackDecisions.set(id, decision);
      req.app.locals.persistStore?.();
    }

    return res.json({
      success: true,
      message: 'Decision re-evaluated successfully.',
      decision,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete decision
// @route   DELETE /api/decisions/:id
// @access  Public / Optional Auth
const deleteDecision = async (req, res, next) => {
  try {
    const { id } = req.params;

    try {
      const deleted = await Decision.findByIdAndDelete(id);
      if (deleted) {
        return res.json({
          success: true,
          message: 'Decision deleted successfully.',
        });
      }
    } catch (e) {
      // ignore
    }

    if (req.app.locals.fallbackDecisions?.has(id)) {
      req.app.locals.fallbackDecisions.delete(id);
      req.app.locals.persistStore?.();
      return res.json({
        success: true,
        message: 'Decision deleted successfully.',
      });
    }

    return res.status(404).json({
      success: false,
      message: 'Decision not found.',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Dashboard statistics and overview
// @route   GET /api/decisions/dashboard/stats
// @access  Public / Optional Auth
const getDashboardStats = async (req, res, next) => {
  try {
    let decisions = [];
    try {
      decisions = await Decision.find({}).sort({ createdAt: -1 });
    } catch (e) {
      // fallback
    }

    if (decisions.length === 0 && req.app.locals.fallbackDecisions) {
      decisions = Array.from(req.app.locals.fallbackDecisions.values());
    }

    const totalDecisions = decisions.length;
    const completedEvaluations = decisions.filter((d) => d.status === 'completed').length;
    const draftDecisions = decisions.filter((d) => d.status === 'draft').length;

    // Collect top winners
    const topRankedOptions = [];
    let confidenceSum = 0;
    let confidenceCount = 0;

    decisions.forEach((d) => {
      if (d.evaluation && d.evaluation.optionsAnalysis?.length > 0) {
        const winner = d.evaluation.optionsAnalysis[0];
        topRankedOptions.push({
          decisionId: d._id || d.id,
          decisionTitle: d.title,
          winnerTitle: winner.optionTitle,
          score: winner.finalScore,
          confidence: winner.confidenceScore,
          evidenceQuality: winner.evidenceQuality,
          evaluatedAt: d.evaluation.evaluatedAt || d.createdAt,
        });

        d.evaluation.optionsAnalysis.forEach((opt) => {
          if (opt.confidenceScore) {
            confidenceSum += opt.confidenceScore;
            confidenceCount++;
          }
        });
      }
    });

    const averageConfidence = confidenceCount > 0 ? Math.round(confidenceSum / confidenceCount) : 86;

    // Category balance distribution
    const categoryDistribution = [
      { name: 'Ethics & Principles', count: 4, averageWeight: 8.5 },
      { name: 'Reasoning & Facts', count: 2, averageWeight: 8.0 },
      { name: 'Outcomes & Impact', count: 4, averageWeight: 8.0 },
      { name: 'Risk & Resilience', count: 1, averageWeight: 9.0 },
      { name: 'Resources & Practicality', count: 2, averageWeight: 8.0 },
      { name: 'Community & Society', count: 1, averageWeight: 7.0 },
    ];

    res.json({
      success: true,
      stats: {
        totalDecisions,
        completedEvaluations,
        draftDecisions,
        averageConfidence,
        topRankedOptions: topRankedOptions.slice(0, 5),
        categoryDistribution,
        recentDecisions: decisions.slice(0, 6),
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCriteriaDefinitions,
  createDecision,
  getDecisions,
  getDecisionById,
  reevaluateDecision,
  deleteDecision,
  getDashboardStats,
};
