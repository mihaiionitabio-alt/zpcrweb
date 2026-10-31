r=>`  - ${r.meta.name||r.file} (${r.rows}x${r.cols}, ${r.nCycles||"?"} cycles, `
  +`${r.wells.length} results, ${uniqueCurveCount(r)} result-linked curves, ${acquiredCurveCount(r)} acquired channel/well curves, `
  +`UID ${sourceUidOf(r)||"not recorded"}, SHA-256 ${sourceSHA256Of(r)||"not recorded"}, CRC-32 ${sourceCRCOf(r)||"not recorded"})`