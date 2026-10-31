function zpcrScannedChannels(reads) {
  if (!reads.length) return [];
  const ch = reads[0].channels;
  const scanned = [];
  for (let c = 0; c < ch; c++) {
    let nonZero = false;
    for (const r of reads) {
      const base = c * r.rows * r.cols * 4;
      const end = base + r.rows * r.cols * 4;
      for (let i = base; i < end; i++) if (r.wellData[i] !== 0) { nonZero = true; break; }
      if (nonZero) break;
    }
    if (nonZero) scanned.push(c);
  }
  return scanned;
}