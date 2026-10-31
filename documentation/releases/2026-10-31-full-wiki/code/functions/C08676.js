async function parseZpcr(arrayBuffer, opts = {}) {
  const { files, manifest } = await zpcrReadArchive(arrayBuffer, opts.inflate || zpcrInflateRaw);
  const names = Object.keys(files);

  const readNames = names.filter(n => /\.plateread$/i.test(n)).sort();
  const hasRunInfo = Object.prototype.hasOwnProperty.call(files, ZPCR_RUNINFO);
  const hasProtocol = Object.prototype.hasOwnProperty.call(files, ZPCR_PROTOCOL);
  if (!readNames.length && !hasRunInfo && !hasProtocol)
    throw new Error('REVIEW: not a .zpcr run (no plate read, RunInfo.xml or protocol)');

  const issues = [];
  const encrypted = manifest.filter(e => e.encrypted).map(e => e.name);
  if (encrypted.length)
    issues.push(`${encrypted.length} archive entr${encrypted.length === 1 ? 'y is' : 'ies are'} encrypted and were not read: ${encrypted.join(', ')}`);

  const reads = [];
  for (const n of readNames) {
    try { reads.push(zpcrDecodePlateread(files[n], n)); }
    catch (e) { issues.push(e.message); }
  }
  reads.sort((a, b) => (a.scanIndex ?? 0) - (b.scanIndex ?? 0) ||
                       a.name.localeCompare(b.name));

  const runInfo = hasRunInfo ? zpcrParseRunInfo(ZPCR_LATIN.decode(files[ZPCR_RUNINFO])) : {};
  const protocol = hasProtocol ? ZPCR_LATIN.decode(files[ZPCR_PROTOCOL]) : null;

  /* Reference rows: RunInfo.xml states how many; without it the count is not
   * established and the trailing rows are left unlabelled rather than assumed. */
  const refDeclared = runInfo['NumberReferenceRows'];
  let referenceRows = null;
  if (refDeclared !== undefined && /^\d+$/.test(refDeclared)) referenceRows = Number(refDeclared);
  else if (reads.length) issues.push('NumberReferenceRows not stated in RunInfo.xml; reference row not labelled');

  if(referenceRows!==null && reads.length && (referenceRows<0||referenceRows>=reads[0].rows))throw Error('Invalid reference row count');
  const scanned = zpcrScannedChannels(reads);
  if (reads.length && scanned.length !== reads[0].channels)
    issues.push(`${reads[0].channels - scanned.length} of ${reads[0].channels} channels contain only zero data; acquisition status is not established (CHANNELMASK reads ${reads[0].channelMaskRaw}; this reader does not interpret that value)`);

  /* One run must speak with one voice about its own identity. */
  const distinct = k => Array.from(new Set(reads.map(r => JSON.stringify(k(r)))));
  for (const [label, get] of [
    ['base serial', r => r.serials.base],
    ['head serial', r => r.serials.head],
    ['grid',        r => [r.rows, r.cols, r.channels]],
    ['LED currents', r => r.leds],
  ]) {
    if (distinct(get).length > 1) issues.push(`REVIEW: plate reads disagree on ${label}`);
  }

  const first = reads[0] || null;
  return {
    kind: 'zpcr',
    evidence: await zpcrEvidence(files,reads,runInfo,protocol,manifest),
    archive: { entries: manifest.length, names, encrypted },
    runInfo,
    factoryRefRow: zpcrFactoryRefRow(runInfo, first ? first.channels : null),
    protocolText: protocol,
    instrument: {
      base: first ? first.serials.base : (runInfo['BaseSerialNumber'] || null),
      head: first ? first.serials.head : null,
      alpha: first ? first.serials.alpha : (runInfo['AlphaSerialNumber'] || null),
      block: runInfo['BlockDescription'] || null,
      firmware: first ? first.firmware : null,
      dspFirmware: runInfo['DspFirmwareVersion'] || null,
    },
    grid: first ? { rows: first.rows, cols: first.cols, channels: first.channels,
                    referenceRows, sampleRows: referenceRows === null ? null : first.rows - referenceRows }
                : null,
    scannedChannels: scanned,
    reads,
    issues,
  };
}