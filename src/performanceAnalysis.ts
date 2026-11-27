export interface StudentScore {
  id: string;
  name: string;
  score: number;
}

const bands = [
  { label: '0–<50', upper: 50 },
  { label: '50–<70', upper: 70 },
  { label: '70–<85', upper: 85 },
  { label: '85–100', upper: Infinity },
];

const labels = [
  ['Tek puan grubu'],
  ['Düşük performans', 'Yüksek performans'],
  ['Düşük performans', 'Orta performans', 'Yüksek performans'],
];

function average(rows: readonly StudentScore[]): number {
  return rows.length ? rows.reduce((sum, row) => sum + row.score, 0) / rows.length : 0;
}

export function passRate(rows: readonly StudentScore[], cutoff: number): number {
  return rows.length ? rows.filter(({ score }) => score >= cutoff).length / rows.length * 100 : 0;
}

// The panel already sorts by descending score for the results table.
export function summarize(ranked: readonly StudentScore[]) {
  const mean = average(ranked);
  const middle = Math.floor(ranked.length / 2);
  const median = ranked.length % 2
    ? ranked[middle].score
    : ((ranked[middle - 1]?.score ?? 0) + (ranked[middle]?.score ?? 0)) / 2;
  const variance = ranked.reduce((sum, { score }) => sum + (score - mean) ** 2, 0) / (ranked.length || 1);
  const distribution = bands.map(({ label }) => ({ label, count: 0 }));
  for (const { score } of ranked) {
    distribution[bands.findIndex(({ upper }) => score < upper)].count++;
  }
  return {
    mean, median, deviation: Math.sqrt(variance), distribution,
    top: ranked.slice(0, 3), bottom: ranked.slice(-3).reverse(),
  };
}

// Adapted from Huriye Kayadelen’s one-dimensional K-means implementation.
export function clusterStudents(ranked: readonly StudentScore[]) {
  const distinct = [...new Set(ranked.map(({ score }) => score))].reverse();
  const count = Math.min(3, distinct.length);
  if (count === 0) {
    return [];
  }

  let centers = Array.from({ length: count }, (_, index) =>
    distinct[Math.round(index * (distinct.length - 1) / Math.max(1, count - 1))]);

  function assignStudents() {
    const groups: StudentScore[][] = centers.map(() => []);
    for (const student of ranked) {
      let nearest = 0;
      for (let index = 1; index < centers.length; index++) {
        if (Math.abs(student.score - centers[index]) < Math.abs(student.score - centers[nearest])) {
          nearest = index;
        }
      }
      groups[nearest].push(student);
    }
    return groups;
  }

  for (let iteration = 0; iteration < 30; iteration++) {
    const next = assignStudents().map((group, index) => group.length ? average(group) : centers[index]);
    const stable = next.every((center, index) => Math.abs(center - centers[index]) < 0.0001);
    centers = next;
    if (stable) {
      break;
    }
  }

  const groups = assignStudents().filter((group) => group.length);
  return groups.map((students, index) => ({
    label: labels[groups.length - 1][index],
    average: average(students),
    students,
  }));
}
