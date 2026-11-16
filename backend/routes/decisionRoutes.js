const express = require('express');
const router = express.Router();
const {
  getCriteriaDefinitions,
  createDecision,
  getDecisions,
  getDecisionById,
  reevaluateDecision,
  deleteDecision,
  getDashboardStats,
} = require('../controllers/decisionController');
const { optionalAuth, protect } = require('../middleware/authMiddleware');

// Criteria & Stats (public/guest-friendly)
router.get('/criteria', getCriteriaDefinitions);
router.get('/dashboard/stats', optionalAuth, getDashboardStats);

// Decision CRUD
router.route('/')
  .get(optionalAuth, getDecisions)
  .post(optionalAuth, createDecision);

router.route('/:id')
  .get(optionalAuth, getDecisionById)
  .delete(optionalAuth, deleteDecision);

router.put('/:id/evaluate', optionalAuth, reevaluateDecision);

module.exports = router;
