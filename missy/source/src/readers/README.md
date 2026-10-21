# Readers

A reader turns one vendor file into the **run object** that the whole core
works on. The core never looks at vendor bytes; it only reads run objects.
Adding an instrument means adding a reader here, not changing the core.

| Folder | Format | In builds | Status |
|---|---|---|---|
| `ixo/` | Roche LightCycler 480 `.ixo` | all, LC | in use |
| `eds/` | Applied Biosystems QuantStudio 3/5 `.eds` / `.edt` | all | in use |
| `rdml/` | RDML 1.0–1.4 (`.rdml`, or a ZIP holding `rdml_data.xml`) | all | in use |
| `zpcr/` | Bio-Rad raw ZPCR | public | registered; raw sample/reference, telemetry, completion/identity evidence |
| `pcrd/` | Bio-Rad PCRD | public | registered; local password, 48/96/384 geometry, CRC/size checked |
| `lcpro_xml/` | LightCycler PRO "Customer data export" XML | none | **draft**, written from the manual, never run on a real export |
| `lcrd/` | LightCycler PRO `.lcrd` | — | not started; format undocumented |

Some readers are split into several files because the original page kept
their code in several places (for example `ixo/integrity.js` and
`ixo/cc_extract.js`). The build joins them back in page order.

## The run object (contract)

Every reader returns one object per run with these fields. `decodeIxo`
(`ixo/decode.js`) and `decodeEds` (`eds/to_run_model.js`) are the reference
implementations. `validateRunBoundary` (`core/ui/state.js`) checks the minimum.

**Identity and provenance**
- `file`, `sourcePath`, `sourceArchive`, `zip`
- `platform`: e.g. `"LightCycler 480"`, `"QuantStudio"`, `"LightCycler PRO"`
- `meta`: `name, UID, Created, CreatedByName, LastModified, LastModifiedByName,
  SWVersion, AppliedTemplates, State, Notes, RunCreated, StartTime, EndTime,
  InstrumentName, InstrumentVersion, InstrumentID, PlateID, Technician,
  InstrCalibrationDate, sourceCRC32, sourceSHA256, sourceBytes` (+ vendor extras)
- `integrity`: `{kind, stored, computed, ok, note}`. `ok` is `true`, `false`,
  or `null` (nothing to verify)
- `format`: `{signature, version}`

**Plate**
- `rows`, `cols`, `maxPos`, `blockId`, `namedPositions`
- `plate`: `{[pos]: {name, sampleId, notes, channels: {[ch]: {sampleType, targetName, targetType}}, subsets}}`
- `subsets`, `identities`, `duplicates`

**Results** (stored values, never recomputed)
- `wells[]`: one per well × target with a Cq result:
  `kind, well, pos, row, col, sample, target, analysis, analysisShort,
  analysisUid, analysisKind, analysisGroup, analysisGroupName, channel,
  filterName, filterComb, instrType, instrRole, givenConc, targetName,
  targetType, IsIncluded, manual, warnCodes, warnDesc, CpRaw, Cp, callCode,
  call, curve, CalcConc, ConcStatus, StandardConc, ...`.
  `call` uses the page vocabulary `CALL` (Negative / Uncertain / Positive / NotCalculated)
- `tmWells[]`: Tm peaks (`tms, heights, areas, widths, nPeaks, ...`)
- `genoResults[]`, `rqResults[]`, `otherResults[]`
- `analyses[]`: one per analysis/target, with `stdCurve` when stored

**Curves and acquisition**
- `allCurves`: `{"ch|pos": {channel, pos, curve, amplitude}}`, every stored
  curve, including channels without a result (the "rising curves without
  result" review depends on this)
- `nCycles, acqStats, acqError, acqMelt, acqSegments, acqAcquisitions, acqScalingFactors`
- `protocol`: `{programs, channels, block:{rowCount, colCount, ...}, setup, detectionFormatName, analysisModes, hasTemperatureLog}`

A vendor may add one private field for its own extras (`run.eds`, `run.lcpro`).
The core may read it only behind a guard (`if (run.eds) ...`).

## Adding a reader

1. Write `readers/<format>/reader.js` returning the object above.
2. Register it in `readers/register_public.js` using the versioned `core/readers_registry.js` boundary. The frozen baseline intake is retained only for baseline builds. Provide a content probe, extensions, and a decoder returning one run or an array of runs; never refresh the UI from a decoder.
3. Add the folder to the manifests of the builds that should read it.
4. Add test files with known values to `tests/` and run the comparison.

## Public run-model additions

The public registry attaches `reader: {id, version, modelVersion}` and availability capabilities. Bio-Rad raw arrays live in `run.zpcr` / `run.pcrd`, not in fabricated vendor-result rows. Independent Cq/Tm outputs are derived separately in core analysis. A cancelled password produces `run.pcrdLocked` with source/container inventory only. New readers should return explicit unavailable data rather than guessing geometry, calls, well assignments or acceptance profiles.
