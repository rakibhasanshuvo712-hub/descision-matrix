const { CRITERIA_DEFINITIONS } = require('../utils/criteriaList');

/**
 * Calculates weighted scores, ranks options, resolves ties,
 * and generates comparative analytics across all alternatives.
 */
class ScoringService {
  /**
   * Computes weighted scores and rankings for evaluated options.
   * @param {Array} optionsEvaluations - Raw criteria scores and insights per option
   * @param {Object} userWeights - Map of criterionId -> weight (1-10)
   */
  static processRankings(optionsEvaluations, userWeights = {}) {
    // 1. Resolve effective weights
    const effectiveWeights = {};
    let totalWeight = 0;

    CRITERIA_DEFINITIONS.forEach((crit) => {
      const weight = Number(userWeights[crit.id]) || crit.defaultWeight;
      effectiveWeights[crit.id] = Math.max(1, Math.min(10, weight));
      totalWeight += effectiveWeights[crit.id];
    });

    // 2. Score each option
    const processedOptions = optionsEvaluations.map((opt) => {
      let weightedSum = 0;
      const formattedCriteria = [];

      CRITERIA_DEFINITIONS.forEach((crit) => {
        const weight = effectiveWeights[crit.id];
        const match = opt.criteriaScores?.find(
          (c) => c.criterionId === crit.id || c.criterionName?.toLowerCase() === crit.name.toLowerCase()
        );

        let rawScore = 50;
        let reasoning = 'Evaluated under standard multi-dimensional framework.';

        if (match) {
          rawScore = Math.max(0, Math.min(100, Math.round(Number(match.score) || 50)));
          reasoning = match.reasoning || reasoning;
        }

        const weightedScore = Math.round(((rawScore * weight) / totalWeight) * 100) / 100;
        weightedSum += (rawScore * weight);

        formattedCriteria.push({
          criterionId: crit.id,
          criterionName: crit.name,
          category: crit.category,
          score: rawScore,
          weight,
          weightedScore,
          reasoning,
        });
      });

      const finalScore = totalWeight > 0 ? Math.round((weightedSum / totalWeight) * 10) / 10 : 0;

      return {
        ...opt,
        finalScore,
        criteriaScores: formattedCriteria,
      };
    });

    // 3. Sort and Rank (with tie-breaking logic)
    processedOptions.sort((a, b) => {
      if (Math.abs(b.finalScore - a.finalScore) > 0.05) {
        return b.finalScore - a.finalScore;
      }
      // Tie breaker 1: Risk & Potential Harm (Safety) score
      const aRisk = a.criteriaScores.find((c) => c.criterionId === 'risk_harm')?.score || 0;
      const bRisk = b.criteriaScores.find((c) => c.criterionId === 'risk_harm')?.score || 0;
      if (bRisk !== aRisk) return bRisk - aRisk;

      // Tie breaker 2: Moral correctness
      const aMoral = a.criteriaScores.find((c) => c.criterionId === 'moral_correctness')?.score || 0;
      const bMoral = b.criteriaScores.find((c) => c.criterionId === 'moral_correctness')?.score || 0;
      if (bMoral !== aMoral) return bMoral - aMoral;

      // Tie breaker 3: Evidence support
      const aEv = a.criteriaScores.find((c) => c.criterionId === 'evidence_support')?.score || 0;
      const bEv = b.criteriaScores.find((c) => c.criterionId === 'evidence_support')?.score || 0;
      return bEv - aEv;
    });

    // Assign rank positions (1, 2, 3...)
    processedOptions.forEach((opt, idx) => {
      opt.rank = idx + 1;
    });

    return {
      processedOptions,
      effectiveWeights,
      totalWeight,
    };
  }

  /**
   * Generates comparative summaries and highlights close-alternative differences.
   */
  static generateComparativeSynthesis(processedOptions, situationContext = {}) {
    if (!processedOptions || processedOptions.length === 0) {
      return null;
    }

    const winner = processedOptions[0];
    const secondBest = processedOptions.length > 1 ? processedOptions[1] : null;
    const lowestPriority = processedOptions[processedOptions.length - 1];

    // Check if winner and second-best are tied or close
    const scoreDiff = secondBest ? Math.round(Math.abs(winner.finalScore - secondBest.finalScore) * 10) / 10 : 0;
    const isCloseDecision = secondBest && scoreDiff <= 4.0;

    let explanationOfDifferences = '';
    if (secondBest) {
      if (isCloseDecision) {
        explanationOfDifferences = `Close alternative scenario: "${winner.optionTitle}" leads "${secondBest.optionTitle}" by a narrow margin of ${scoreDiff} points. The key differentiator lies in ${
          winner.criteriaScores.find((c) => c.criterionId === 'risk_harm')?.score >
          secondBest.criteriaScores.find((c) => c.criterionId === 'risk_harm')?.score
            ? 'superior risk mitigation and downside protection'
            : 'stronger alignment with primary constraints and long-term payoff'
        }. Any adjustment in criteria weights or additional risk verification could invert this order.`;
      } else {
        explanationOfDifferences = `Decisive separation: "${winner.optionTitle}" holds a commanding advantage (+${scoreDiff} points) over "${secondBest.optionTitle}", driven by balanced excellence across moral integrity, feasibility, and outcome compounding.`;
      }
    } else {
      explanationOfDifferences = `Evaluated standalone benchmark for "${winner.optionTitle}".`;
    }

    // Identify value conflicts / ethical trade-offs
    const ethicalTradeOffs = [];
    const ethicalDisagreements = [];

    processedOptions.forEach((opt) => {
      const moral = opt.criteriaScores.find((c) => c.criterionId === 'moral_correctness')?.score || 0;
      const fin = opt.criteriaScores.find((c) => c.criterionId === 'financial_feasibility')?.score || 0;
      const risk = opt.criteriaScores.find((c) => c.criterionId === 'risk_harm')?.score || 0;
      const shortTerm = opt.criteriaScores.find((c) => c.criterionId === 'short_term_benefits')?.score || 0;
      const longTerm = opt.criteriaScores.find((c) => c.criterionId === 'long_term_benefits')?.score || 0;

      if (fin > 75 && moral < 60) {
        ethicalDisagreements.push(
          `For "${opt.optionTitle}": High financial attractiveness is tempered by ethical or moral compromises. Utilitarian financial gains conflict with de-ontological duty.`
        );
      }
      if (shortTerm > 80 && longTerm < 60) {
        ethicalTradeOffs.push(
          `"${opt.optionTitle}" offers quick short-term gratification at the expense of compound long-term sustainability.`
        );
      }
      if (risk < 50) {
        ethicalTradeOffs.push(
          `"${opt.optionTitle}" carries high tail-risk and potential harm that may disproportionately affect vulnerable stakeholders.`
        );
      }
    });

    if (ethicalDisagreements.length === 0) {
      ethicalDisagreements.push(
        'Ethical principles remain largely aligned across the primary alternatives without severe moral violations.'
      );
    }

    return {
      winner: {
        optionId: winner.optionId,
        optionTitle: winner.optionTitle,
        score: winner.finalScore,
        reason: `Ranks highest due to robust performance in ${
          winner.strengths?.[0] || 'core criteria balance'
        } and superior weighted score (${winner.finalScore}/100).`,
      },
      secondBest: secondBest
        ? {
            optionId: secondBest.optionId,
            optionTitle: secondBest.optionTitle,
            score: secondBest.finalScore,
            reason: `Second-ranked option (${secondBest.finalScore}/100); provides strong capabilities in ${
              secondBest.advantages?.[0] || 'specific criteria'
            } but trails in ${secondBest.weaknesses?.[0] || 'weighted trade-offs'}.`,
          }
        : null,
      lowestPriority: {
        optionId: lowestPriority.optionId,
        optionTitle: lowestPriority.optionTitle,
        score: lowestPriority.finalScore,
        reason: `Ranks lowest (${lowestPriority.finalScore}/100) due to significant constraints, elevated risks, or uncompetitive return-to-effort ratio.`,
      },
      scoreDifferenceWinnerVsSecond: scoreDiff,
      isCloseDecision,
      explanationOfDifferences,
      keyTradeOffs: ethicalTradeOffs.length > 0 ? ethicalTradeOffs : [
        'Balancing short-term resource investment against uncertain future compounding.',
        'Accepting operational friction in exchange for greater ethical certitude and risk reduction.',
      ],
      ethicalDisagreements,
      missingInformation: [
        'Real-time market or environment shifts that could alter feasibility estimates.',
        'Exact budgetary liquidity and tolerance for prolonged negative cashflow or delay.',
        'Qualitative stakeholder sentiment and interpersonal friction not captured by quantitative scores.',
      ],
      criticalTippingPoints: [
        `If the importance of short-term velocity increases by >30%, rankings may favor faster-execution alternatives.`,
        `Confirmation of verified funding or external guarantees would significantly elevate feasibility scores.`,
      ],
    };
  }
}

module.exports = ScoringService;
