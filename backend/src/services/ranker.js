function recencyScore(year) {
  const currentYear = new Date().getFullYear()
  const safeYear = Number(year) || currentYear
  const age = Math.max(0, currentYear - safeYear)

  return Math.max(0, 1 - Math.min(age, 10) / 10)
}

function credibilityScore(result) {
  const sourceWeights = {
    PubMed: 1,
    OpenAlex: 0.85,
    ClinicalTrials: 0.9,
  }

  const sourceWeight = sourceWeights[result.source] || 0.5
  const citationScore = Math.min(Number(result.citationCount) || 0, 200) / 200
  const trialBoost = result.status ? 0.1 : 0

  return Math.min(1, sourceWeight * 0.7 + citationScore * 0.2 + trialBoost)
}

function rankResults(scoredPool) {
  return scoredPool
    .map((result) => ({
      ...result,
      recencyScore: Number(recencyScore(result.year).toFixed(4)),
      credibilityScore: Number(credibilityScore(result).toFixed(4)),
      finalScore: Number(
        (
          result.semanticScore * 0.65 +
          recencyScore(result.year) * 0.2 +
          credibilityScore(result) * 0.15
        ).toFixed(4)
      ),
    }))
    .sort((a, b) => b.finalScore - a.finalScore)
    .slice(0, 8)
}

module.exports = {
  rankResults,
  recencyScore,
  credibilityScore,
}
