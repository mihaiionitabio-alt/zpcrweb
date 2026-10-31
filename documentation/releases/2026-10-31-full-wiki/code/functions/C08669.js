function zpcrWellStats(read, channel, row, col) {
  const i = (channel * (read.rows * read.cols) + row * read.cols + col) * 4;
  return { mean: read.wellData[i], sd: read.wellData[i + 1],
           min: read.wellData[i + 2], max: read.wellData[i + 3] };
}