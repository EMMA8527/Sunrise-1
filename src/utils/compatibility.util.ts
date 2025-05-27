/* eslint-disable prettier/prettier */
// src/utils/compatibility.util.ts

export function calculateCompatibilityScore(quizA: any, quizB: any): number {
  if (!quizA || !quizB) return 0;

  let total = 0;
  let matches = 0;

  const keysToCheck = Object.keys(quizA);

  for (const key of keysToCheck) {
    const aVal = quizA[key]?.toLowerCase() || '';
    const bVal = quizB[key]?.toLowerCase() || '';

    total++;

    if (aVal && bVal && (aVal.includes(bVal) || bVal.includes(aVal))) {
      matches++;
    }
  }

  return Math.floor((matches / total) * 100); // e.g. 80%
}
