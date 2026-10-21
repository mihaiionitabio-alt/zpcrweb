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

The shared eight-tab MISSY design, large two-row desktop Console controls, Command and Assisted modes and report workflows remain. Protocols and serials remain separate, channels are compared, and the endpoint default is N=7. Results distinguish raw acquisitions from stored vendor result tables and independently calculated Cq/Tm. Core presentation adapters retain documented compatibility composition points; the binary readers do not replace the UI.

## Validation before deployment

- 27 original PCRDs; 6,090,706 stored numeric values match independent expectations.
- Seven ZPCRs; decoded payloads, raw/hardware CSVs, graph SVGs and eligibility match the previous working public release.
- Legacy IXO, two EDSs, an EDT template and vendor/raw/reanalysed RDML match the frozen baseline's result/derived tables and RDML exports except build-version/export-time fields.
- Mixed 61-file / 75-view load; all modes, desktop layouts at four widths, themes/focus/pan/zoom and report export.
- Nested/mixed/renamed archives, CRC rejection and password cancel/wrong/retry/privacy checks.
- Mixed PDF: 27 portrait pages, 41 images, page numbers, RUO, filenames and checksums; pages rendered and checked for overflow. Existing table summaries remain; full numerical CSVs are available.

Real laboratory fixtures, passwords and generated experimental reports are not published with the source.

## Licence and intended use

[GNU GPL version 3](./source/LICENSE), with upstream attribution, [modification notices](./source/NOTICE.txt) and retained [Plotly MIT notices](./source/Plotly-LICENSE.txt).

Research Use Only. Independent Cq/Tm calculations and exploratory diagnostics do not constitute vendor certification, reproduce vendor analysis algorithms, or replace manufacturer QC reports or validated laboratory procedures.
