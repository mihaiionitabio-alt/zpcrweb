# Current public build: all five formats (21 October 2026)

Build `python build/build.py public` and open `dist/Missy-public.html`. This is a single offline HTML supporting **IXO, EDS/EDT, RDML, ZPCR and PCRD**, with the existing eight-tab MISSY design, Console/Command/Assisted modes and report exports. Encrypted PCRDs require a locally entered password; no CFX decryption material is bundled. The password remains in page memory only.

The baseline is [Zenodo 23437639](https://zenodo.org/records/23437639). ZPCR/PCRD research and adapted parsing are credited to [R. Byers and the zpcrweb contributors](https://github.com/RByers/zpcrweb). See [LICENSE](LICENSE), [NOTICE.txt](NOTICE.txt) and [Plotly-LICENSE.txt](Plotly-LICENSE.txt). This is a modified GPL-3.0 release; dependency notices are retained. Research Use Only; independent calculations and diagnostic charts do not replace vendor QC or validated laboratory procedures.

The byte-identical **Missy-all** and **Missy-LC** variants below are frozen baselines, not the latest all-format public release. They remain available for regression comparisons. PRO customer XML and LCRD are not enabled.

[ARCHITECTURE.md](ARCHITECTURE.md) explains the reader registry, explicit UI/report hooks and model v2 boundary checks. The public variant preserves numerical behaviour and the original design; frozen baseline builds remain byte-identical.

## Report workflow update (2026.10.21.workflow1)

- Preview graph returns to its Assisted or Command origin, retaining scroll, fields and selections. Close graph and Return both work; standalone Console keeps its normal behaviour.
- Assisted hides unavailable items and empty groups. The run selector filters figure choices by actual data; endpoint controls are hidden without a supported format.
- **Runs for standard figures** offers one run or **All loaded runs**. All repeats selected standard figures separately for every compatible run. Labelled acquisition comparisons retain their source groups; tables cover loaded data. Nothing pools incompatible protocols or serials.
- `run all` provides the same coverage in Command mode. Generated Bio-Rad scripts include it. Selection CSV retains scope and run.
- Reports and archives retain a full source manifest with filenames and SHA-256 hashes. Analytical selections still use selected wells; raw evidence and hardware scopes are unchanged.

## Hook/model update (2026.10.21.hooks1)

Global function replacement has been replaced by named, ordered hooks. The PDF writer exposes style and paragraph hooks directly. Reader validation checks result collections, positions, raw dimensions, source evidence and encrypted inventory before committing. See `tests/hooks_and_models.cjs` for malformed-model, hook ordering, context, duplicate, sealing and async cleanup tests.

## Public variant validation

- 27 original PCRDs: 6,090,706 stored numeric values match independent expectations.
- Seven ZPCRs: payloads, raw/hardware CSVs, graph SVGs and eligibility decisions match the previous working release.
- Legacy comparisons: IXO, two EDS files, an EDT template, and vendor/raw/reanalysed RDML; result/derived tables and RDML exports match the baseline except build-version/export-time fields.
- Mixed 61-file / 75-view load; all modes; two desktop Console rows at 1000/1280/1500/1920 px; no browser errors or unexpected network requests.
- Archive/CRC failures, renamed containers, password cancellation, wrong-password rejection and retry; no password in source download or web storage.
- Mixed PDFs: portrait pages, page numbers, RUO, full source filenames/checksums and no page/footer overflow or image fallbacks. Large tables are summarised by the existing writer; full numerical CSV remains available.

Tests under `tests/` need local experimental fixtures. Browser tests use Playwright and Chrome; configure their fixture paths for your machine. `MISSY_PCRD_PASSWORD_FILE` supplies a private local password for automated tests. Never add that file or its contents to source control. Runtime MISSY still asks users through its normal password dialog. `python tests/test_builder.py` requires only Python and source files.

---

# Missy, RUO: modular source

The published Missy page (Zenodo 23437639) is one 14,000-line HTML file.
This folder holds the same page split into small modules, and a build script
that joins them back into one self-contained, offline HTML file.

Nothing was rewritten. Each module is a run of lines copied verbatim from
the published page (`tools/split_from_original.py` records exactly which
lines). Building the **all** variant reproduces the published page byte for
byte; the build checks this every time.

## Layout

```
src/
  shell/        page skeleton: head, body markup, script tags
  vendor/       Plotly (unchanged)
  core/         vendor-neutral: SOP, results, control charts, review,
                exports, audit log, interface, advisory analytics
  readers/      one folder per file format (see src/readers/README.md)
    ixo/        LightCycler 480
    eds/        QuantStudio 3/5
    rdml/       RDML
    lcpro_xml/  LightCycler PRO customer data export: DRAFT, in no build yet
  variants/
    lc/         stand-ins used by the LC build for the readers it leaves out
build/
  build.py      joins modules → dist/*.html
  all.manifest  Missy-all: every reader (byte-identical to the published page)
  lc.manifest   Missy-LC: LightCycler only
  lc.replace.json  title/description text for the LC build
tests/
  compare_builds.py            same files, two pages, compare everything
  lc_rejects_other_formats.py  LC build refuses .eds/.rdml cleanly
  fixtures/                    synthetic LC PRO XML (from the manual, not real)
tools/
  split_from_original.py       the one-time split, kept for audit
dist/                          built pages
```

## Build

```
python build/build.py          # all variants
python build/build.py lc       # one variant
```

Python 3 only, no packages. A manifest is a plain list of module paths in
page order; editing a manifest is how a variant is defined.

## Variants

| Build | Reads | Notes |
|---|---|---|
| `Missy-all.html` | .ixo, .eds/.edt, .rdml | md5 `3bf60501a9eeb08166df9bb024fd8495`, identical to Zenodo 23437639 |
| `Missy-LC.html` | .ixo | QuantStudio and RDML readers left out; such files are refused with a clear message |

LightCycler PRO joins `Missy-LC` once its reader is checked against a real export.

## Verification done for this split (21 Oct 2026)

- `Missy-all.html` md5 equals the published page.
- `Missy-LC.html` vs the published page on 10 real LightCycler 480 runs
  (534 results), loaded through the real "Load files → Read" flow: decoded
  runs, well table, Tm table, metadata, SOP interpretations and run
  acceptance, control-chart rows, audit log, plate map, replicate review,
  orphan curves, integrity labels, instrument records, RDML export and all
  8 tabs are identical. No console or page errors. (The RDML `<dateMade>`
  export timestamp is excluded; it changes on every export.)
- `Missy-LC.html` given an .ixo, an .eds and an .rdml: reads the .ixo,
  refuses the other two with "not read by this build", no errors.

Re-run after any change:

```
pip install playwright
python tests/compare_builds.py dist/Missy-all.html dist/Missy-LC.html <some .ixo files>
```

## Still vendor-specific inside core/ (next steps)

The split moved code; it did not yet change how the core is organised. These
places in `core/` still know about specific vendors:

1. **Intake** (`core/intake.js`) names .ixo/.eds/.rdml directly. A small
   reader registry here is the one core change needed so that a new reader
   (LC PRO first) plugs in without touching the core again.
2. **Integrity events** (`core/integrity.js`) treat every non-.ixo file as
   a ZIP with CRC/Tamper records. The LC PRO export needs its own branch
   (no vendor checksum).
3. **Control-chart extraction** (`core/charts/extract.js`) and some
   review/graph code branch on `run.eds` or the LC480 temperature log. These
   should become per-reader hooks.
4. **Interface text** still mentions QuantStudio in a few controls and in
   the Chinese strings; the LC build only rewrites the title, description,
   drop zone and file filter.

Do 1 and 2 when the first real LC PRO export arrives, together with the
reader check, and re-run the comparison tests.


2026.10.21.overview1: Overview + comparisons preset (Command: overview) adds all-run coverage, cohort/role statistics and multi-run Cq comparisons. Targets, serials, decoded protocols, channels and stored/independent bases stay separate. Missing identity isolates sources. All public PDFs use MISSY branding; long titles and table cells wrap with repeated table headers.

2026.10.21.overview2: Separate-format validation (10 IXO, 2 EDS, 24 individual RDML, 7 ZPCR, 27 PCRD). PCRD overview cohorts use stored gene/target names, dye/channel, protocol and acquisition group; unnamed PCRD targets remain source-specific. Tests cover both UI report routes, all eligible comparison previews, independent statistics and PDF bounds.
