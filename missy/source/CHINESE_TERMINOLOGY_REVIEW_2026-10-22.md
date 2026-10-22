# MISSY terminology review — 22 October 2026

This review changes English/Chinese presentation, not file decoding, raw values, result algorithms, acceptance limits or laboratory decisions. The supplied manuals are reference material, not operational instructions for MISSY.

## Sources and selected sections

| Supplied document | Selected sections / pages | Use in MISSY |
|---|---|---|
| `ch_1.pdf` — Roche LightCycler PRO Development Software, software 1.4, publication 4.0 (2026) | pp. 81–85 sample roles; 138–140 colour compensation/reference analysis; 154–155 and 208–212 Cq methods; 219–220 display/fluorescence views; 368–370 flags | Chinese molecular-biology vocabulary; distinctions between controls, standards, Cq methods and fluorescence views |
| `ch_2.pdf` — Roche LightCycler PRO System, software 1.4, publication 3.0 | pp. 109–111 table/view labels; 215–223 results/review; 228–231 flags | Chinese sample/target/result/flag/review labels; no PRO approval workflow or flag rules imported |
| `ch_3_qc.pdf` — Roche PRO Quick Guide, publication 3.0 | pp. 11–12 research-data workflow; 16 and 19 review/export workflow | Chinese run data, analysis settings, results review and export vocabulary. This is a quick guide, not an acceptance-profile certificate. |
| `10000134783.pdf` — Bio-Rad CFX Opus Dx operating manual, May 2022, software 2.3 | printed pp. 22–23 thermal/optical terms (PDF 24–25); 52 file types (PDF 54); 67 dye calibration (PDF 69); 77–78 program steps (PDF 79–80); 84–93 program/temperature settings (PDF 86–95); 107–109 run status; 139 logs/recovery (PDF 141) | Chinese Bio-Rad hardware, read-plate, gradient, ramp-rate, sample/block temperature and heated-lid terms. Not a CFX Maestro analysis-algorithm specification. |
| `real-time-pcr-handbook.pdf` — Thermo Fisher Scientific, 2014 | §1.4 (PDF 10–13), §1.7 passive reference dyes (PDF 19), §1.9 endogenous controls (PDF 22), §4.3 HRM (PDF 48–49), §5.2 analysis settings (PDF 58–61) | English scientific wording; distinction between threshold/baseline, optical reference dye, reference gene, end-point signal and evidence of specificity |

Roche page numbers above match the PDF page index. Bio-Rad and handbook PDF indices are specified separately where their printed page numbers differ. The manuals themselves and their extracted text are not bundled in the public site/source.

## LC480-specific primary references added during review

- `Microsoft Word - LC 480.pdf`: LC480 operating manual, software **1.0**, Traditional Chinese. PDF pp. 145–148 describe absolute quantification, crossing point and maximum second derivative; pp. 152–154 discuss quantification; p. 167 describes colour compensation. Normalize wording to Simplified Chinese for MISSY, without claiming this historical version matches every loaded experiment.
- `W020190620571713272282.pdf`: LC480 II brochure plus operating/workflow material. PDF pp. 13 and 15 identify acquisition/analysis modes; pp. 18–20 distinguish second-derivative and fit-points quantification, stored Cp, reference analysis and colour compensation. Brochure performance claims are not installed as QC limits.
- `52cfa3a2-a678-4fb3-976c-c85eea947b87.pdf`: LC480 quick operation guide V2.0. PDF pp. 11–15 name analysis modules, second-derivative and fit-points methods, reference pairing, external standards and Tm peaks.

These LC480 sources take priority for **legacy IXO** terminology. PRO sources supplement general vocabulary. The manuals themselves do not prove kit lot, acceptance-profile provenance or a software-version match for a particular IXO.

## Decisions

- Use **样本**, **孔位置**, **微孔板设置**, **定量循环（Cq）**, **Cq 阈值**, **标准曲线**, **重复孔**, **颜色补偿**, **结果审核** consistently.
- Keep generic **靶标** for the multiformat application: not every target is a named gene. Stored target/gene names remain verbatim.
- Distinguish **无模板质控（NTC）**, **阳性模板质控（PTC）**, **阴性过程质控（NPC）**, **阳性过程质控（PPC）**, **定量标准品**, **运行校准品** and **解链标准品**. Existing generic positive/negative roles are not silently reclassified into PRO-specific control types.
- Use **内部质控（IC）** for an internal control, **内源参照／参照基因** for an endogenous reference, and **被动参比染料** for an optical reference dye. They are different functions.
- Use **熔解曲线（解链曲线）**, **熔解峰（解链峰）**, **熔解温度（Tm，亦称解链温度）** and **高分辨率熔解（HRM）**. HRM is not inferred from an ordinary melt trace.
- Distinguish baseline subtraction from baseline division/normalization. PRO's displayed baseline-divided definition is not automatically applied to LC480, QuantStudio or Bio-Rad data. The UI changes wording only.
- Preserve the stored method names `Partial baseline`, `Partial fluorescence increase`, `2nd derivative PRO` and legacy `Abs Quant/2nd Derivative Max ...`. PRO's second-derivative method and the LC480 method are not represented as numerically identical (Roche ch_1 p. 154).
- Bio-Rad **升降温速率** means temperature change per time; an ordered temperature increment per read is not relabelled as a measured ramp rate. Stored sample-temperature fields are not called direct measurements: the Opus manual distinguishes calculated-sample and block-control modes.
- **暗信号** is not automatically a PCR baseline or a validated estimate of temporal detector noise. This is MISSY's careful translation of decoded raw-field labels, not a claim that the manual defines those raw fields.
- Raw optical channel numbers do not establish dye identity. Detector counts, processed fluorescence and normalized reporter signals remain distinct.
- English control/reference Cq wording now describes an elevated value as a review flag, not proof of inhibition. The description accurately refers to per-target medians and the configured positive shift, not a symmetric ± band.
- English end-point/Cq wording no longer claims the plot alone distinguishes true/specific amplification. NTC/melt/assay evidence is still needed.
- Handbook example baseline windows, threshold choices, efficiency ranges and Opus hardware specifications are not installed as universal MISSY defaults or QC acceptance limits.

## Preservation and verification

- One offline HTML; same MISSY design and shared modes.
- Original sample names, targets, filenames, instrument identities, checksums and script commands retained. Identity-bearing table cells are excluded from text localization; role labels can still be translated.
- English/Chinese switch is reversible. Numerical run models, summary statistics and CSV data are unchanged.
- Exact translations plus anchored UI-context patterns use an explicit `i18n.phrase` hook; no global function replacement.
- Legacy IXO/EDS/EDT/RDML regression checks, seven-file ZPCR golden checks, Chinese mode/layout checks and separate-format Chinese smoke tests are recorded alongside the source tests.


## Coverage follow-up — 2026.10.22.zhcoverage2

- Rechecked the GMO references in `D:/IXO/CHINESE/gmo`: Ministry of Agriculture and Rural Affairs announcement 1012-16-2026 (`P020260708599398824623.pdf`, PDF p. 5, definitions/principle) and 1012-17-2026 (`P020260708599399150770.pdf`, PDF p. 7, controls and result wording). References support distinctions among endogenous reference genes, species references, positive/negative/blank controls, detection and repeat testing. Their numerical criteria and experimental procedures are not installed as MISSY rules.
- Rechecked the Roche LC480 and PRO sections listed above for Cp/Cq, colour compensation, quantification and control vocabulary. Stored method names, gene symbols and scientific species names remain unchanged.
- Added exact UI translations and narrowly anchored templates for status counts, SOP explanations, target interpretations, baseline collection, forensic review and file integrity. The model and CSV exports remain language independent.
- Removed three verbose implementation-oriented export descriptions (RDES, RDML/LinRegPCR and qpcR wide tables) from both languages. Export actions and file content are unchanged. Safety/review caveats remain visible.
- The three Chinese-interface mascots now use accessible buttons with click/keyboard responses and reduced-motion support. A ResizeObserver tracks the actual footer height, including wrapped layouts, so the animals and toast sit above it. They are omitted from printing.
- All eight main tabs, English/Chinese round trips, four footer widths, and Console/Command/Assisted separate-format checks are covered by `tests/zh_coverage.cjs`, `tests/zh_terminology.cjs` and `tests/zh_format_smoke.cjs`. Source field names, script syntax, licence text and original identifiers can intentionally remain in their original language; this is not a translation of raw file contents.
