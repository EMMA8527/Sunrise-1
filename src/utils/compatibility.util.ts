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

export function calculateDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Radius of the earth in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
    Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) *
    Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c); // Distance in km
}

