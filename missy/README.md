# MISSY public modular edition — 21 October 2026

[Open the live page](https://mihaiionitabio-alt.github.io/zpcrweb/), or download [the single offline HTML](./MISSY_PUBLIC_MODULAR_2026-10-21.html) and open it locally. The older `MISSY_PUBLIC_2026-10-20.html` path is retained as an identical compatibility copy.

This edition starts from [Zenodo record 23437639](https://zenodo.org/records/23437639). The frozen full-baseline manifest reproduces its `index.html` MD5 `3bf60501a9eeb08166df9bb024fd8495` exactly. The new public manifest adds IXO, EDS/EDT, RDML, ZPCR and PCRD through versioned reader registration.

ZPCR/PCRD format research and adapted parsing credit: **R. Byers and the [zpcrweb contributors](https://github.com/RByers/zpcrweb)**. This is a separately maintained fork addition, not an upstream zpcrweb or Bio-Rad release.

## Source and build

The [preferred modular source](./source/) includes [architecture](./source/ARCHITECTURE.md), all modules, manifests, build scripts, licence notices and test harnesses.

```sh
cd missy/source
python build/build.py public
```

Open `dist/Missy-public.html`. Python 3 is sufficient; no packages, internet or secrets are required to build. Frozen all/LC variants remain for baseline comparisons. PRO XML/LCRD are not enabled.

## Passwords and design

Encrypted PCRD imports ask for a locally supplied password; no CFX-derived decryption state, vendor password or DLL is distributed. Passwords remain in page memory until forgotten or the page closes. Cancel keeps source inventory only; wrong passwords import no measurements. The prompt explains authorised access and RDML exports from licensed CFX software.

The shared eight-tab MISSY design, large two-row desktop Console controls, Command and Assisted modes and report workflows remain. Protocols and serials remain separate, channels are compared, and the endpoint default is N=7. Results distinguish raw acquisitions from stored vendor result tables and independently calculated Cq/Tm. UI and report extensions use named, ordered hooks rather than replacing global functions or PDF methods. The run-model v2 boundary validates source evidence, result collections, positions and raw dimensions before commitment. The binary readers do not replace the UI.

## Hooks/model update: 2026.10.21.hooks1

- 105 registrations across 35 explicit hooks; registry sealed after startup.
- Frozen baseline manifests remain byte-identical.
- Malformed models, duplicate hooks, context/order, double-next and async cleanup tested.
- Command/Assisted PDF downloads tested through the actual interface.
- Long run lists paginate above the footer; contents wrap.

## Hooks/model update: 2026.10.21.workflow1

- 105 registrations across 35 explicit hooks; registry sealed after startup.
- Frozen baseline manifests remain byte-identical.
- Malformed models, duplicate hooks, context/order, double-next and async cleanup tested.
- Command/Assisted PDF downloads tested through the actual interface.
- Long run lists paginate above the footer; contents wrap.

## Hooks/model update: 2026.10.21.overview1

- 105 registrations across 35 explicit hooks; registry sealed after startup.
- Frozen baseline manifests remain byte-identical.
- Malformed models, duplicate hooks, context/order, double-next and async cleanup tested.
- Command/Assisted PDF downloads tested through the actual interface.
- Long run lists paginate above the footer; contents wrap.

## Validation before deployment

- 27 original PCRDs; 6,090,706 stored numeric values match independent expectations.
- Seven ZPCRs; decoded payloads, raw/hardware CSVs, graph SVGs and eligibility match the previous working public release.
- Legacy IXO, two EDSs, an EDT template and vendor/raw/reanalysed RDML match the frozen baseline's result/derived tables and RDML exports except build-version/export-time fields.
- Mixed 61-file / 75-view load; all modes, desktop layouts at four widths, themes/focus/pan/zoom and report export.
- Nested/mixed/renamed archives, CRC rejection and password cancel/wrong/retry/privacy checks.
- Mixed PDFs: portrait pages, page numbers, RUO, filenames and checksums; pages rendered and checked for page/footer overflow. Existing table summaries remain; full numerical CSVs are available.

Real laboratory fixtures, passwords and generated experimental reports are not published with the source.

## Licence and intended use

[GNU GPL version 3](./source/LICENSE), with upstream attribution, [modification notices](./source/NOTICE.txt) and retained [Plotly MIT notices](./source/Plotly-LICENSE.txt).

Research Use Only. Independent Cq/Tm calculations and exploratory diagnostics do not constitute vendor certification, reproduce vendor analysis algorithms, or replace manufacturer QC reports or validated laboratory procedures.

## Preview and report coverage: 2026.10.21.workflow1

Preview graph returns to its Assisted/Command origin with scroll, fields and selections retained. Unavailable items and empty groups are hidden; preview buttons use the MISSY control style.

In Assisted mode, choose **All loaded runs** under **Runs for standard figures**, select figures/tables (or **Select all available**) and press **Build**. Selected standard figures repeat separately for every compatible run. One selected run limits the standard figures and visible figure choices; tables cover all loaded data, as stated in the UI/report. Native acquisition comparisons retain their labelled source groups; incompatible protocols and serials are not pooled.

Command mode supports `run all`; generated Bio-Rad scripts include it. Selection CSV persists scope/run. Reports/archives include a full source manifest with complete filenames and SHA-256 hashes. Analytical figures respect selected wells; raw exports and hardware scopes are unchanged.

Tests cover exact preview return via Close graph/Return, source-aware visibility, all-run IXO/EDS/RDML figure binding and actual mixed-format PDF downloads. The representative five-format all-run PDF has 21 portrait pages; full source identities and every page/footer boundary were checked.

## Separate-format validation: 2026.10.21.overview2

- Tested separate batches: 10 IXO, 2 EDS, 24 individual RDML, 7 ZPCR and 27 PCRD files.
- All eligible overview comparisons previewed through Console, Command and Assisted routes; both report downloads checked.
- PCRD overall statistics use stored gene/target names, dye/channel, protocol and acquisition group. Unnamed targets stay source-specific. Independent Cq/Tm algorithms and raw arrays are unchanged.
- Report statistics independently checked; 99 pages visually reviewed. Command/Assisted PDF images, layout and text match apart from the build timestamp.
