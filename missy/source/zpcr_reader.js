/* ============================================================================
 * zpcr_reader.js — Bio-Rad CFX `.zpcr` run reader (inventory + raw curves)
 *
 * Standalone, dependency-free, offline. Runs in a browser (DecompressionStream)
 * and in Node >= 18. Nothing here derives a Cq, applies a threshold, issues a
 * call, or defines an acceptance limit: it reads what the instrument wrote and
 * reports it, and says REVIEW where the file does not establish a fact.
 *
 * Format sources: zpcrweb's docs/icff.md, docs/plateread.md (R. Byers, GPL-3.0).
 * Every structural claim below was re-verified independently against the seven
 * sample archives — see test_zpcr.js for the known-answer checks.
 *
 * NOT IMPLEMENTED, deliberately:
 *   - `.pltd` / `.prcl` / `.pcrd` payloads. Those are ZipCrypto-encrypted and
 *     the decryption key is not in this file, not in zpcrweb, and not derived
 *     here. An encrypted entry is reported as encrypted and skipped.
 *   - Any interpretation of CHANNELMASK as a bitmask (see qcScannedChannels).
 * ========================================================================= */

'use strict';

/* ---------- 1. byte helpers ------------------------------------------------ */

const ZPCR_TD = new TextDecoder('utf-8');
const ZPCR_LATIN = new TextDecoder('iso-8859-1');

function zpcrAsciiZ(u8, off, len) {
  let end = off;
  const stop = off + len;
  while (end < stop && u8[end] !== 0) end++;
  return ZPCR_LATIN.decode(u8.subarray(off, end));
}

/* ---------- 2. ZIP container ----------------------------------------------- */
/* A `.zpcr` is a plain ZIP. Across all seven sample archives (570 entries)
 * not one entry is encrypted; entries are stored (0) or deflated (8). The
 * reader still checks the encryption flag per entry rather than assuming. */

async function zpcrInflateRaw(u8) {
  if (typeof DecompressionStream !== 'function')
    throw new Error('This browser does not support DecompressionStream.');
  const ds = new DecompressionStream('deflate-raw');
  const reader=new Blob([u8]).stream().pipeThrough(ds).getReader(),parts=[];let total=0;
  while(true){const {done,value}=await reader.read();if(done)break;total+=value.length;if(total>64*1024*1024){await reader.cancel();throw Error('ZPCR inflated member exceeds limit');}parts.push(value);}
  const buf=new Uint8Array(total);let at=0;for(const part of parts){buf.set(part,at);at+=part.length;}

  return new Uint8Array(buf);
}

/**
 * Read a ZIP's central directory and return every entry's bytes.
 * `inflate` is injectable so a host page can pass its own raw-deflate routine.
 */
async function zpcrReadArchive(arrayBuffer, inflate = zpcrInflateRaw) {
  const u8 = new Uint8Array(arrayBuffer);
  const dv = new DataView(u8.buffer, u8.byteOffset, u8.byteLength);
  let eocd = -1;
  for (let i = u8.length - 22; i >= Math.max(0, u8.length - 65557); i--) {
    if (dv.getUint32(i, true) === 0x06054b50) { eocd = i; break; }
  }
  if (eocd < 0) throw new Error('Not a ZIP container: no end-of-central-directory record');
  if (dv.getUint16(eocd+4,true)||dv.getUint16(eocd+6,true)) throw Error('Multi-disk ZIP unsupported');
  const count = dv.getUint16(eocd + 10, true);
  if(count===65535 || count>10000) throw Error('ZIP entry limit or ZIP64 unsupported');
  const cdSize=dv.getUint32(eocd+12,true),cdOffset=dv.getUint32(eocd+16,true);
  if(cdOffset+cdSize>eocd)throw Error('ZIP central directory bounds');
  let expanded=0;
  const seen=new Set();
  let p = dv.getUint32(eocd + 16, true);
  const files = Object.create(null);
  const manifest = [];
  for (let k = 0; k < count; k++) {
    if(p+46>eocd)throw Error('Truncated ZIP index');
    if (dv.getUint32(p, true) !== 0x02014b50) throw new Error('Corrupt ZIP central directory');
    const flags  = dv.getUint16(p + 8,  true);
    const method = dv.getUint16(p + 10, true);
    const crc    = dv.getUint32(p + 16, true);
    const csize  = dv.getUint32(p + 20, true);
    const usize  = dv.getUint32(p + 24, true);
    const nLen   = dv.getUint16(p + 28, true);
    const eLen   = dv.getUint16(p + 30, true);
    const cLen   = dv.getUint16(p + 32, true);
    const lho    = dv.getUint32(p + 42, true);
    if(p+46+nLen+eLen+cLen>eocd)throw Error('ZIP name bounds');
    const name   = ZPCR_TD.decode(u8.subarray(p + 46, p + 46 + nLen));
    p += 46 + nLen + eLen + cLen;
    if(seen.has(name))throw Error('Duplicate ZIP member: '+name);seen.add(name);
    expanded+=usize;
    if(usize>64*1024*1024||expanded>256*1024*1024)throw Error('ZPCR expanded-size limit');
    if (name.endsWith('/')) continue;
    const encrypted = (flags & 0x1) === 1;
    const rec = { name, method, crc, csize, usize, encrypted };
    manifest.push(rec);
    if (encrypted) continue;                       /* reported, never guessed at */
    if(lho+30>cdOffset)throw Error('ZIP local header bounds');
    if (dv.getUint32(lho, true) !== 0x04034b50) throw new Error('Bad local header: ' + name);
    const start = lho + 30 + dv.getUint16(lho + 26, true) + dv.getUint16(lho + 28, true);
    if(start+csize>cdOffset)throw Error('ZIP payload bounds');
    const raw = u8.subarray(start, start + csize);
    let data;
    if (method === 0) data = raw.slice();
    else if (method === 8) data = await inflate(raw);
    else throw new Error(`ZIP entry ${name} uses unsupported compression method ${method}`);
    if (data.length !== usize) throw new Error(`ZIP entry ${name} size mismatch`);
    if(zpcrCRC(data)!==crc)throw Error('ZIP CRC-32 mismatch: '+name);
    files[name] = data;
  }
  return { files, manifest };
}

function zpcrCRC(a){let c=0xffffffff;for(const b of a){c^=b;for(let j=0;j<8;j++)c=(c>>>1)^((c&1)?0xedb88320:0);}return (c^0xffffffff)>>>0;}

/* ---------- 3. ICFF container ---------------------------------------------- */
/* Values first, self-describing index at the end, last 8 bytes point back at
 * it. Index bookkeeping is little-endian. An absent field has LENGTH zero —
 * offset zero is where the first field of every file legitimately sits. */

const ZPCR_ICFF_STRIDE = 264;

function zpcrParseIcff(u8) {
  if (u8.length < 8) return null;
  const dv = new DataView(u8.buffer, u8.byteOffset, u8.byteLength);
  const indexOffset = dv.getUint32(u8.length - 8, true);
  const stride      = dv.getUint32(u8.length - 4, true);
  if (stride !== ZPCR_ICFF_STRIDE) return null;
  if (indexOffset + 4 > u8.length - 8) return null;
  if (zpcrAsciiZ(u8, indexOffset, 4) !== 'ICFF') return null;
  if((u8.length-8-indexOffset-4)%stride)throw Error('Partial ICFF index');
  const fields = Object.create(null);
  const order = [];
  for (let p = indexOffset + 4; p + stride <= u8.length - 8; p += stride) {
    const name = zpcrAsciiZ(u8, p, 255);
    const offset = dv.getUint32(p + 255, true);
    const length = dv.getUint32(p + 259, true);
    const flag   = u8[p + 263];
    if (!name) continue;
    if(fields[name])throw Error('Duplicate ICFF field');
    if(offset+length>indexOffset)throw Error('ICFF payload bounds: '+name);
    fields[name] = { offset, length, flag };
    order.push(name);
  }
  return { fields, order, indexOffset, stride };
}

/* ---------- 4. `.Plateread` ------------------------------------------------- */
/* Scalar metadata is BIG-endian. WELLDATA/DARKDATA are LITTLE-endian float32
 * arrays introduced by a LITTLE-endian uint32 float count that sits AT the
 * descriptor's own offset; the floats start four bytes later. Each record is
 * four floats: mean, stddev, min, max. */

function zpcrIcffInt(u8, dv, f)   { return dv.getInt32(f.offset, false); }
function zpcrIcffFloat(u8, dv, f) { return dv.getFloat32(f.offset, false); }
function zpcrIcffText(u8, f)      { return zpcrAsciiZ(u8, f.offset, f.length); }

function zpcrFloatArray(u8, dv, f) {
  if (!f || f.length < 4) return null;
  const count = dv.getUint32(f.offset, true);
  const floats = (f.length - 4) / 4;
  if (!Number.isInteger(floats)) return null;
  const out = new Float32Array(floats);
  for (let i = 0; i < floats; i++) out[i] = dv.getFloat32(f.offset + 4 + i * 4, true);
  return { count, values: out, declaredCount: count, actualCount: floats };
}

function zpcrDecodePlateread(bytes, name) {
  const u8 = bytes;
  const dv = new DataView(u8.buffer, u8.byteOffset, u8.byteLength);
  const icff = zpcrParseIcff(u8);
  if (!icff) throw new Error(`REVIEW: ${name} has no ICFF index`);
  const F = icff.fields;
  const has = k => F[k] && F[k].length > 0;        /* length, not offset */
  const I = k => (has(k) && F[k].length===4 ? zpcrIcffInt(u8, dv, F[k]) : null);
  const T = k => (has(k) ? zpcrIcffText(u8, F[k]) : null);
  const f32 = k => (has(k) ? zpcrIcffFloat(u8, dv, F[k]) : null);

  const rows = I('NUMBERROWS');
  const cols = I('NUMBERCOLUMNS');
  const well = zpcrFloatArray(u8, dv, F['WELLDATA']);
  const dark = zpcrFloatArray(u8, dv, F['DARKDATA']);
  if (!well) throw new Error(`REVIEW: ${name} has no readable WELLDATA`);
  if (well.declaredCount !== well.actualCount)
    throw new Error(`REVIEW: ${name} WELLDATA count word ${well.declaredCount} ` +
                    `disagrees with payload ${well.actualCount}`);
  const records = well.actualCount / 4;
  if (!Number.isInteger(records))
    throw new Error(`REVIEW: ${name} WELLDATA is not a whole number of 4-float records`);
  if (!(rows > 0 && cols > 0) || records % (rows * cols) !== 0)
    throw new Error(`REVIEW: ${name} grid ${rows}x${cols} does not divide ${records} records`);
  const channels = records / (rows * cols);
  if(rows>65||cols>48||channels>16)throw Error('Unsupported ZPCR geometry');
  if(dark && (dark.declaredCount!==dark.actualCount || dark.actualCount!==channels*4 || Array.from(dark.values).some(x=>!Number.isFinite(x))))throw Error('Invalid DARKDATA');

  /* Alignment self-check: for every record mean must lie within [min,max] and
   * stddev must be non-negative. A four-byte misread fails this immediately —
   * it is how the off-by-one-float error in the first draft of this reader was
   * caught. Measured: 0 failures in 294 plate reads across seven archives. */
  let misaligned = 0;
  for (let r = 0; r < records; r++) {
    const m = well.values[r * 4], sd = well.values[r * 4 + 1];
    const lo = well.values[r * 4 + 2], hi = well.values[r * 4 + 3];
    if (!(sd >= 0 && hi >= lo && m >= lo - 1e-3 && m <= hi + 1e-3)) misaligned++;
  }
  if (misaligned) throw new Error(`REVIEW: ${name} WELLDATA misaligned (${misaligned}/${records} records fail mean-in-[min,max])`);

  const temps = {};
  for (const k of icff.order) if (/TEMP/.test(k) && has(k) && F[k].length === 4) {
    const asFloat = zpcrIcffFloat(u8, dv, F[k]);
    const asInt   = zpcrIcffInt(u8, dv, F[k]);
    /* A measured temperature is a plausible float; a set point is a small int
     * whose float reinterpretation is a denormal. At most one can be sane. */
    const floatOk = Number.isFinite(asFloat) && Math.abs(asFloat) > 1e-3 && Math.abs(asFloat) < 1e4;
    temps[k] = floatOk ? { kind: 'measured', c: asFloat } : { kind: 'setpoint', c: asInt };
  }

  const leds = [];
  for (let n = 1; n <= 16; n++) {
    const k = 'LEDCURRENT' + String(n).padStart(2, '0');
    if (has(k)) leds.push(I(k));
  }

  const dateText = T('DATETIME');
  const epochMs = dateText ? Date.parse(dateText) : NaN;

  return {
    name,
    bytes: u8.length,
    fieldCount: icff.order.length,
    fieldNames: icff.order,
    version: { file: I('PRFILEVERSION'), plateread: I('PLATEREADVERSION'), crc: I('CRC') },
    serials: {
      run: T('RUNGUID'), base: T('BASESERIALNUMBER'),
      alpha: T('ALPHASERIALNUMBER'), head: T('HEADSERIALNUMBER'),
    },
    firmware: T('FIRMWAREVERSIONS'),
    scanIndex: I('SCANINDEX'),
    cycle: I('CYCLE'),
    step: I('STEP'),
    stepIdentification: I('STEPIDENTIFICATION'),
    scanMode: I('SCANMODE'),
    retrievalType: I('RETRIEVALTYPE'),
    errorNumber: I('ERRORNUMBER'),
    errorDescription: T('ERRORDESCRIPTION'),
    channelMaskRaw: I('CHANNELMASK'),   /* verbatim; never interpreted here */
    rows, cols, channels, records,
    temps, leds,
    fan: { state: I('FANSTATE'), offTemp: I('FANOFFTEMP'), onTemp: I('FANONTEMP') },
    lid: { state: I('LIDSTATE'), force: I('LIDFORCE'), position: I('LIDPOSITION') },
    dateText,
    epochMs: Number.isFinite(epochMs) ? epochMs : null,
    dateBasis: /GMT|UTC|[+-]\d{2}:?\d{2}$/.test(dateText || '') ? 'offset-qualified' : 'unresolved',
    deltaTime: I('DELTATIME'),
    filePath: T('FILEPATH'),
    wellData: well.values,
    darkData: dark ? dark.values : null,
  };
}

/** mean fluorescence for one (channel,row,col); row-major within a channel. */
function zpcrWellMean(read, channel, row, col) {
  const idx = channel * (read.rows * read.cols) + row * read.cols + col;
  return read.wellData[idx * 4];
}
/** the full 4-tuple the instrument stored for one well. */
function zpcrWellStats(read, channel, row, col) {
  const i = (channel * (read.rows * read.cols) + row * read.cols + col) * 4;
  return { mean: read.wellData[i], sd: read.wellData[i + 1],
           min: read.wellData[i + 2], max: read.wellData[i + 3] };
}

/* ---------- 5. RunInfo.xml -------------------------------------------------- */
/* Flat <KeyValuePairs><Key/><Value/></KeyValuePairs> list. Parsed with the
 * platform DOM parser where there is one, else a narrow fallback. Values are
 * kept as written; nothing is coerced or enriched. */

function zpcrParseRunInfo(text) {
  const kv = Object.create(null);
  if (typeof DOMParser === 'function') {
    const dom = new DOMParser().parseFromString(text, 'application/xml');
    if (dom.querySelector('parsererror')) throw new Error('REVIEW: RunInfo.xml does not parse');
    for (const pair of dom.querySelectorAll('KeyValuePairs')) {
      const k = pair.querySelector('Key');
      const v = pair.querySelector('Value');
      if (k && k.textContent.trim()) kv[k.textContent.trim()] = v ? v.textContent.trim() : '';
    }
  } else {
    const re = /<KeyValuePairs>\s*<Key>([^<]*)<\/Key>\s*<Value\s*\/>|<KeyValuePairs>\s*<Key>([^<]*)<\/Key>\s*<Value>([^<]*)<\/Value>/g;
    let m;
    while ((m = re.exec(text))) {
      if (m[1] !== undefined) kv[m[1].trim()] = '';
      else kv[m[2].trim()] = (m[3] || '').trim();
    }
  }
  return kv;
}

/**
 * FactoryRefRowCal is a flat comma list of mean,min,max,sd per reference spot.
 *
 * Measured across all seven archives: 312 numbers = 78 quads = 13 slots x 6
 * channels, laid out SLOT-MAJOR (slot 1 channels 1..6, slot 2 channels 1..6, …).
 * The thirteenth slot is all zeros in every file — the block has twelve
 * reference columns, and the table carries one unused trailing slot. The layout
 * is therefore derived from the channel count, and a trailing all-zero slot is
 * reported rather than silently dropped.
 */
function zpcrFactoryRefRow(kv, channels) {
  const raw = kv['FactoryRefRowCal'];
  if (!raw) return null;
  const n = raw.split(',').map(s => Number(s.trim()));
  if (!n.length || n.length % 4 || n.some(x => !Number.isFinite(x))) return null;
  const quads = [];
  for (let i = 0; i < n.length; i += 4)
    quads.push({ mean: n[i], min: n[i + 1], max: n[i + 2], sd: n[i + 3] });
  if (!channels || quads.length % channels) return { quads, slots: null, channels: channels || null, trailingEmptySlots: null };
  const slotCount = quads.length / channels;
  const slots = [];
  let trailingEmpty = 0;
  for (let s = 0; s < slotCount; s++) {
    const row = [];
    for (let c = 0; c < channels; c++) row.push(quads[s * channels + c]);
    slots.push(row);
  }
  for (let s = slotCount - 1; s >= 0; s--) {
    if (slots[s].every(q => q.mean === 0 && q.min === 0 && q.max === 0 && q.sd === 0)) trailingEmpty++;
    else break;
  }
  return { quads, slots, channels, slotCount, trailingEmptySlots: trailingEmpty,
           populatedSlots: slotCount - trailingEmpty };
}

/* ---------- 6. scanned-channel determination -------------------------------- */
/* CHANNELMASK is 63 in six-channel runs but 129 in the 2019 qualification run,
 * which is not 0b111111 and not a plain six-bit mask. This reader therefore
 * does NOT decode it. A channel counts as scanned when it carries a non-zero
 * reading somewhere in the run; a channel that is exactly zero in every well of
 * every read was not acquired and is excluded rather than charted as a zero.
 * This is the same failure mode as reading an inactive filter slot as data. */

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

/* ---------- 7. top-level parse ---------------------------------------------- */

const ZPCR_RUNINFO = 'RunInfo.xml';
const ZPCR_PROTOCOL = 'ProtocolRunDefinition.txt';

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

/* ---------- 8. QC metric extraction ----------------------------------------
 * Values the run states about itself, summarised. NO acceptance limit, no
 * verdict, no baseline is defined here — a limit for a CFX block cannot be
 * inferred from seven third-party files and must come from the laboratory's
 * own qualified history. Metrics are scoped to ONE protocol step, because a
 * run that reads the plate in two different steps is two populations: pooling
 * them manufactures a spread the instrument never had.
 * ------------------------------------------------------------------------ */

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

/** Mean of a channel's reference-row wells for one read, scanned channels only. */
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

/**
 * Per-run QC metrics for a chosen protocol step.
 * `step` defaults to the step that holds the most plate reads.
 */
function zpcrQcMetrics(run, step) {
  if (!run.reads.length) return { step: null, metrics: {}, notes: ['no plate reads'] };
  const counts = new Map();
  for (const r of run.reads) counts.set(r.step, (counts.get(r.step) || 0) + 1);
  const chosen = step !== undefined ? step
    : Array.from(counts.entries()).sort((a, b) => b[1] - a[1])[0][0];
  const S = run.reads.filter(r => r.step === chosen);
  const notes = [];
  if (counts.size > 1)
    notes.push(`run holds plate reads in ${counts.size} protocol steps (${Array.from(counts.keys()).join(', ')}); metrics below cover step ${chosen} only`);

  const metrics = {};

  /* 8.1 thermal — one series per temperature field the firmware emitted. */
  const tempKeys = new Set();
  for (const r of S) for (const k of Object.keys(r.temps)) tempKeys.add(k);
  for (const k of tempKeys) {
    const kinds = new Set(S.map(r => r.temps[k] && r.temps[k].kind).filter(Boolean));
    if (kinds.size !== 1) { notes.push(`${k} is measured in some reads and a set point in others; not summarised`); continue; }
    const kind = Array.from(kinds)[0];
    const st = zpcrStats(S.map(r => r.temps[k] ? r.temps[k].c : NaN));
    if (!st) continue;
    metrics['temp.' + k] = { kind, unit: 'degC', ...st,
      quantised: st.n > 2 && S.every(r => Number.isInteger(r.temps[k].c)) };
  }

  /* 8.2 cycle interval, from the instrument's own per-read timestamps.
   * DATETIME has one-second resolution, so a sub-second difference is not
   * observable and the spread below is bounded from below by that. */
  if (S.length > 1 && S.every(r => r.epochMs !== null)) {
    const iv = [];
    for (let i = 1; i < S.length; i++) iv.push((S[i].epochMs - S[i - 1].epochMs) / 1000);
    metrics['timing.readInterval'] = { unit: 's', resolution: 1, ...zpcrStats(iv) };
    metrics['timing.runSpan'] = { unit: 's', seconds: (S[S.length - 1].epochMs - S[0].epochMs) / 1000 };
  } else if (S.some(r => r.epochMs === null)) {
    notes.push('one or more reads carry an unparseable DATETIME; interval metrics withheld');
  }

  /* 8.3 detector dark level, per scanned channel. */
  if (S[0].darkData) {
    for (const c of run.scannedChannels) {
      const v = S.map(r => (r.darkData && r.darkData.length > c * 4 ? r.darkData[c * 4] : NaN));
      const st = zpcrStats(v);
      if (!st) continue;
      metrics[`dark.ch${c}`] = { unit: 'counts', ...st,
        driftPct: st.n > 1 && v[0] ? 100 * (v[v.length - 1] / v[0] - 1) : null };
    }
  }

  /* 8.4 reference-row level and within-run drift, per scanned channel. */
  const refRows = run.grid && run.grid.referenceRows;
  if (refRows) {
    for (const c of run.scannedChannels) {
      const per = S.map(r => {
        const vals = [];
        for (let row = r.rows - refRows; row < r.rows; row++)
          for (let col = 0; col < r.cols; col++) vals.push(zpcrWellMean(r, c, row, col));
        const st = zpcrStats(vals);
        return st ? st.mean : NaN;
      });
      const st = zpcrStats(per);
      if (!st) continue;
      metrics[`reference.ch${c}`] = { unit: 'RFU', ...st,
        withinRunDriftPct: st.n > 1 && per[0] ? 100 * (per[per.length - 1] / per[0] - 1) : null };
    }
  } else {
    notes.push('reference rows not established; reference-level metrics withheld');
  }

  /* 8.5 live reference row vs the factory calibration table.
   * Slot-major, one slot per plate column; the trailing empty slot is skipped.
   * This is a DEVIATION, not a verdict: a deviation can mean optical ageing,
   * but equally a dirty or wet reference window, and the file cannot tell them
   * apart. */
  if (refRows && run.factoryRefRow && run.factoryRefRow.slots) {
    const F = run.factoryRefRow;
    const dev = {};
    for (const c of run.scannedChannels) {
      const perCol = [];
      for (let col = 0; col < Math.min(F.populatedSlots, S[0].cols); col++) {
        const live = zpcrStats(S.map(r => {
          const vals = [];
          for (let row = r.rows - refRows; row < r.rows; row++) vals.push(zpcrWellMean(r, c, row, col));
          return vals.reduce((a, b) => a + b, 0) / vals.length;
        }));
        const fac = F.slots[col] && F.slots[col][c];
        perCol.push(live && fac && fac.mean
          ? { column: col + 1, live: live.mean, factory: fac.mean,
              deviationPct: 100 * (live.mean / fac.mean - 1) }
          : { column: col + 1, live: live ? live.mean : null,
              factory: fac ? fac.mean : null, deviationPct: null });
      }
      dev[c] = perCol;
    }
    metrics['referenceVsFactory'] = { unit: '%', byChannel: dev,
      note: 'deviation of the live reference row from FactoryRefRowCal; cause not established by the file' };
  }

  /* 8.6 configuration fingerprint — constant within a run, so a between-run
   * comparison, never a within-run chart. */
  metrics['config'] = {
    ledCurrents: S[0].leds,
    channelMaskRaw: S[0].channelMaskRaw,
    scannedChannels: run.scannedChannels.slice(),
    grid: { rows: S[0].rows, cols: S[0].cols, channels: S[0].channels, referenceRows: refRows },
    firmware: S[0].firmware,
    fan: S[0].fan,
    platereadVersion: S[0].version.plateread,
  };

  return { step: chosen, reads: S.length, stepCounts: Object.fromEntries(counts), metrics, notes };
}

/* ---------- 8. exports ------------------------------------------------------ */


/* Conservative completion evidence and acquisition identity; no filename-derived facts. */
function zpcrExpectedReads(text){
 const tokens=String(text||'').split(';').map(s=>s.trim()).filter(Boolean),steps=[];
 const modifiers=new Set(['METHOD','HOTLID','VOLUME','INC','RATE','EXT','BEEP']);
 for(const token of tokens){const op=token.split(/\s+/)[0].toUpperCase();if(modifiers.has(op))continue;if(!['TEMP','GRAD','PLATEREAD','GOTO','END'].includes(op))return {supported:false,reason:'Unsupported protocol directive '+op};steps.push({op,token});}
 if(!steps.length||steps.at(-1).op!=='END')return {supported:false,reason:'Missing terminal END directive'};
 const loops=[];for(let i=0;i<steps.length;i++)if(steps[i].op==='GOTO'){const m=/^GOTO\s+(\d+)\s*,\s*(\d+)$/i.exec(steps[i].token);if(!m||+m[1]<1||+m[1]>i||+m[2]>10000)return {supported:false,reason:'Unsupported GOTO bounds'};steps[i].target=+m[1]-1;steps[i].repeat=+m[2];loops.push([+m[1]-1,i]);}
 for(let i=0;i<loops.length;i++)for(let j=i+1;j<loops.length;j++)if(loops[i][0]<=loops[j][1]&&loops[j][0]<=loops[i][1])return {supported:false,reason:'Overlapping/nested loops require additional validation'};
 let pc=0,visits=0;const counters={},groups=[];
 while(pc<steps.length&&visits++<200000){const s=steps[pc];if(s.op==='END')return {supported:true,total:groups.reduce((n,g)=>n+g.count,0),groups};if(s.op==='PLATEREAD'){const last=groups.at(-1);if(last?.instruction===pc+1)last.count++;else groups.push({instruction:pc+1,count:1});}
 if(s.op==='GOTO'){const done=counters[pc]||0;if(done<s.repeat){counters[pc]=done+1;pc=s.target;continue;}}pc++;}
 return {supported:false,reason:'Protocol expansion limit'};
}
async function zpcrEvidence(files,reads,info,protocol,manifest){
 const digest=async bytes=>{const c=typeof crypto!=='undefined'?crypto:require('crypto').webcrypto;return Array.from(new Uint8Array(await c.subtle.digest('SHA-256',bytes)),b=>b.toString(16).padStart(2,'0')).join('');};
 const frameSize=reads.reduce((n,r)=>n+4+files[r.name].length,4),frame=new Uint8Array(frameSize),dv=new DataView(frame.buffer);dv.setUint32(0,reads.length,true);let at=4;for(const r of reads){const b=files[r.name];dv.setUint32(at,b.length,true);frame.set(b,at+4);at+=4+b.length;}
 const acquisitionSHA256=await digest(frame),reasons=[],notes=[],expected=zpcrExpectedReads(protocol),has=n=>manifest.some(e=>e.name===n&&!e.encrypted),first=reads[0];
 if(!has('begun'))reasons.push('Missing begun marker');if(!has('ended'))reasons.push('Missing ended marker; completion is unestablished');if(!reads.length)reasons.push('No acquisition records');
 if(!expected.supported)reasons.push(expected.reason);else if(expected.total!==reads.length)reasons.push('Expected '+expected.total+' reads but decoded '+reads.length);
 const groups=[];for(const read of reads){const g=groups.at(-1);if(g?.step===read.step)g.reads.push(read);else groups.push({step:read.step,reads:[read]});}
 if(expected.supported&&(groups.length!==expected.groups.length||groups.some((g,i)=>g.reads.length!==expected.groups[i]?.count)))reasons.push('Observed acquisition groups differ from the expanded protocol');
 if(groups.some(g=>g.reads.some((r,i)=>r.cycle!==i+1)))reasons.push('Cycle sequence is incomplete or duplicated within an acquisition step');
 if(reads.some((r,i)=>!Number.isInteger(r.scanIndex)||r.scanIndex!==i+1))reasons.push('Scan indices are incomplete or duplicated');
 if(reads.some((r,i)=>r.epochMs===null||r.dateBasis!=='offset-qualified'||(i&&r.epochMs<reads[i-1].epochMs)))reasons.push('Acquisition timestamps are missing, unresolved or reversed');
 const compare=(key,field)=>{if(!info[key]){reasons.push('Missing RunInfo '+key);return;}if(reads.some(r=>r.serials[field]!==info[key]))reasons.push('RunInfo '+key+' conflicts with acquisition serials');};compare('BaseSerialNumber','base');
 if(info.OHSerialNumber&&reads.some(r=>r.serials.head!==info.OHSerialNumber))reasons.push('Head serial conflicts with RunInfo');
 if(reads.some(r=>r.serials.base!==first?.serials.base||r.serials.head!==first?.serials.head||r.rows!==first?.rows||r.cols!==first?.cols||r.channels!==first?.channels))reasons.push('Acquisition identity or geometry changes within the archive');
 const norm=t=>String(t||'').split(';').map(t=>t.trim().replace(/\s+/g,' ').toUpperCase()).filter(Boolean).join(';');if(info.RunDefinition&&norm(info.RunDefinition)!==norm(protocol))reasons.push('RunInfo protocol conflicts with ProtocolRunDefinition');
 const start=Date.parse(info.RunStartTime||'');if(!Number.isFinite(start)||!/(GMT|UTC|[+-]\d{2}:?\d{2})$/i.test(info.RunStartTime||''))reasons.push('Run start timestamp is unresolved');else if(first?.epochMs!==null&&start>first?.epochMs)reasons.push('RunInfo start is later than the first acquisition');
 const logs=[];for(const name of Object.keys(files).filter(n=>/\.alf$/i.test(n))){const lines=new TextDecoder('iso-8859-1').decode(files[name]).split(/\r?\n/).filter(x=>x.trim()),h=(lines[0]||'').split('*'),status=lines[2]||'';logs.push({member:name,sha256:await digest(files[name]),baseSerial:h[12]||'',status:status.split('*')[0].trim(),timestampBasis:'Unqualified local log times; not used to infer UTC completion'});if(h[12]&&h[12]!==info.BaseSerialNumber)reasons.push('ALF base serial conflicts with RunInfo');if(status&&!/^\s*No errors reported\./i.test(status))reasons.push('ALF status is not a recognised no-error statement');}
 if(!logs.length)notes.push('No ALF log; eligibility relies on matching markers, protocol/read counts and acquisition identity, not vendor certification');
 notes.push('Identifier is retained as an opaque metadata value, not assumed unique. Declared DataFile may be renamed or reference a saved PCRD.');
 return {version:1,acquisitionSHA256,hashMethod:'SHA-256 of LE uint32 read count followed by each ordered raw member as LE uint32 length + bytes; filenames excluded',declaredDataFile:info.DataFile||'',identifier:info.Identifier||'',baseSerial:info.BaseSerialNumber||'',firstReadTimestamp:first?.dateText||'',lastReadTimestamp:reads.at(-1)?.dateText||'',markers:{begun:has('begun'),ended:has('ended')},expected,observedGroups:groups.map(g=>({step:g.step,reads:g.reads.length})),completionSupported:!reasons.length,reasons,notes,logs,status:reasons.length?'REVIEW; excluded from completed-run baselines':'Completion supported by available evidence; not vendor QC certification'};
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    zpcrExpectedReads, zpcrEvidence, parseZpcr, zpcrReadArchive, zpcrParseIcff, zpcrDecodePlateread,
    zpcrParseRunInfo, zpcrFactoryRefRow, zpcrScannedChannels,
    zpcrWellMean, zpcrWellStats, zpcrQcMetrics, zpcrStats, zpcrReferenceRowMeans,
  };
}
