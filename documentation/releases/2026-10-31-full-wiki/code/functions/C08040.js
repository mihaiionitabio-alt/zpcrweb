async function rdmlEntries(ab,archive){
  /* the intake ZIP reader already verifies CRC-32 and rejects unknown compression */
  return readZipFiltered(ab,archive,/^[^/]*\.xml$/i);
}