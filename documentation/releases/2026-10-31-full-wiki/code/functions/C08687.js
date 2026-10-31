function zpcrStats(values) {
  const v = values.filter(Number.isFinite);
  if (!v.length) return null;
  const n = v.length;
  const mean = v.reduce((a, b) => a + b, 0) / n;
  const sd = n > 1 ? Math.sqrt(v.reduce((a, b) => a + (b - mean) * (b - mean), 0) / (n - 1)) : 0;
  const sorted = v.slice().sort((a, b) => a - b);
  return { n, mean, sd, min: sorted[0], max: sorted[n - 1],
           range: sorted[n - 1] - sorted[0],
           median: n % 2 ? sorted[(n - 1) / 2] : (sorted[n / 2 - 1] + sorted[n / 2]) / 2 };
}