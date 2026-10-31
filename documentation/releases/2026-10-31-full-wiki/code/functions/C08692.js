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