function zpcrWellMean(read, channel, row, col) {
  const idx = channel * (read.rows * read.cols) + row * read.cols + col;
  return read.wellData[idx * 4];
}