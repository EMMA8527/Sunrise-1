/* eslint-disable prettier/prettier */
export function calculateCompatibilityScore(
  quizA: Record<string, string[]>,
  quizB: Record<string, string[]>,
): number {
  if (!quizA || !quizB) return 0;

  let total = 0;
  let matches = 0;

  for (const key in quizA) {
    const answersA = quizA[key];
    const answersB = quizB[key];

    if (Array.isArray(answersA) && Array.isArray(answersB)) {
      total++;

      const normalizedA = answersA.map((a) => a.toLowerCase().trim());
      const normalizedB = answersB.map((b) => b.toLowerCase().trim());

      const common = normalizedA.filter((a) => normalizedB.includes(a));
      if (common.length > 0) matches++;
    }
  }

  return total === 0 ? 0 : Math.floor((matches / total) * 100);
}
