function zpcrReferenceRowMeans(read, referenceRows, channels) {
  if (!referenceRows) return null;
  const out = {};
  for (const c of channels) {
    const vals = [];
    for (let r = read.rows - referenceRows; r < read.rows; r++)
      for (let col = 0; col < read.cols; col++) vals.push(zpcrWellMean(read, c, r, col));
    out[c] = zpcrStats(vals);
  }
  return out;
}