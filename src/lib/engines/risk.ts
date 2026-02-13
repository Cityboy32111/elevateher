/**
 * Risk Scoring Engine
 *
 * Computes a risk score (0-100) and tier (low/medium/high/critical) based on
 * the current check-in data and trends from the previous check-in.
 *
 * Factors considered:
 *  - Low mood, energy, sleep quality (inverse scoring)
 *  - High stress
 *  - Workload not manageable
 *  - Lack of manager support
 *  - Childcare instability
 *  - Performance anxiety
 *  - Negative trends (declining scores week-over-week)
 */

interface CheckInData {
  mood: number;            // 1-5 (5 = best)
  energy: number;          // 1-5
  sleepQuality: number;    // 1-5
  stress: number;          // 1-5 (5 = most stressed)
  workloadManageable: boolean;
  managerSupportPresent: boolean;
  childcareStable: boolean;
  performanceAnxiety: boolean;
}

interface RiskResult {
  score: number;           // 0-100
  tier: "low" | "medium" | "high" | "critical";
  factors: string[];       // human-readable contributing factors
}

/**
 * Determine the recommended trigger action for a given risk tier.
 */
export function triggerActionForTier(
  tier: "low" | "medium" | "high" | "critical"
): string {
  switch (tier) {
    case "medium":
      return "suggest_coach";
    case "high":
      return "book_session";
    case "critical":
      return "crisis_route";
    default:
      return "stabilize_path";
  }
}

/**
 * Compute a risk score from the current check-in, optionally comparing
 * against a previous check-in to detect negative trends.
 */
export function computeRiskScore(
  current: CheckInData,
  previous: CheckInData | null
): RiskResult {
  let score = 0;
  const factors: string[] = [];

  // --- Mood (inverted: low mood = higher risk) ---
  // 1 -> +20, 2 -> +15, 3 -> +5, 4 -> 0, 5 -> 0
  if (current.mood <= 2) {
    const points = current.mood === 1 ? 20 : 15;
    score += points;
    factors.push(`Low mood (${current.mood}/5)`);
  } else if (current.mood === 3) {
    score += 5;
  }

  // --- Energy ---
  if (current.energy <= 2) {
    const points = current.energy === 1 ? 15 : 10;
    score += points;
    factors.push(`Low energy (${current.energy}/5)`);
  } else if (current.energy === 3) {
    score += 3;
  }

  // --- Sleep Quality ---
  if (current.sleepQuality <= 2) {
    const points = current.sleepQuality === 1 ? 15 : 10;
    score += points;
    factors.push(`Poor sleep quality (${current.sleepQuality}/5)`);
  } else if (current.sleepQuality === 3) {
    score += 3;
  }

  // --- Stress (direct: high stress = higher risk) ---
  if (current.stress >= 4) {
    const points = current.stress === 5 ? 15 : 10;
    score += points;
    factors.push(`High stress (${current.stress}/5)`);
  } else if (current.stress === 3) {
    score += 3;
  }

  // --- Boolean flags ---
  if (!current.workloadManageable) {
    score += 10;
    factors.push("Workload not manageable");
  }

  if (!current.managerSupportPresent) {
    score += 8;
    factors.push("Lacking manager support");
  }

  if (!current.childcareStable) {
    score += 10;
    factors.push("Childcare instability");
  }

  if (current.performanceAnxiety) {
    score += 7;
    factors.push("Performance anxiety");
  }

  // --- Trend analysis (compare with previous check-in) ---
  if (previous) {
    const moodDelta = current.mood - previous.mood;
    const energyDelta = current.energy - previous.energy;
    const stressDelta = current.stress - previous.stress;

    // Declining mood
    if (moodDelta <= -2) {
      score += 8;
      factors.push("Significant mood decline");
    } else if (moodDelta === -1) {
      score += 3;
    }

    // Declining energy
    if (energyDelta <= -2) {
      score += 5;
      factors.push("Significant energy decline");
    }

    // Increasing stress
    if (stressDelta >= 2) {
      score += 5;
      factors.push("Significant stress increase");
    }

    // Lost support that was previously present
    if (previous.managerSupportPresent && !current.managerSupportPresent) {
      score += 5;
      factors.push("Lost manager support");
    }
    if (previous.childcareStable && !current.childcareStable) {
      score += 5;
      factors.push("Childcare became unstable");
    }
  }

  // Clamp score to 0-100
  score = Math.max(0, Math.min(100, score));

  // Determine tier
  let tier: RiskResult["tier"];
  if (score >= 70) {
    tier = "critical";
  } else if (score >= 45) {
    tier = "high";
  } else if (score >= 25) {
    tier = "medium";
  } else {
    tier = "low";
  }

  return { score, tier, factors };
}
