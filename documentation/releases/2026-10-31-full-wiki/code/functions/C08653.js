function zpcrAsciiZ(u8, off, len) {
  let end = off;
  const stop = off + len;
  while (end < stop && u8[end] !== 0) end++;
  return ZPCR_LATIN.decode(u8.subarray(off, end));
}