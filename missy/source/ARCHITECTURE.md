# MISSY modular public architecture

## Frozen baseline and deliverables

Zenodo record 23437639 `index.html` is the source of the split. `build/all.manifest` rebuilds its MD5 `3bf60501a9eeb08166df9bb024fd8495`; the expected digest remains enforced. `lc.manifest` retains the legacy LC-only variant. Neither frozen variant advertises Bio-Rad support.

`build/public.manifest` produces `dist/Missy-public.html`, one offline HTML containing the baseline modules plus the registered ZPCR/PCRD readers and shared presentation adapters. Sources are readable; no minification, bundler, network or external runtime dependency is required to build. Python 3 is sufficient.

## Import boundary

`core/readers_registry.js` defines versioned registration, content-first probing, ambiguity rejection and one-to-many decoding. `readers/register_public.js` registers IXO, EDS/EDT, RDML, ZPCR and PCRD. Unknown formats are rejected; LC PRO XML/LCRD remain disabled.

`variants/public/intake.js` stages direct files or supported members of bounded archives, preserves source bytes and provenance, performs CRC checks, binds native CFX RDML manifest evidence by SHA-256, and dispatches decoding. It checks the import generation before committing asynchronously decoded runs. A decoder failure does not cause a different format to reinterpret the same source.

Run objects carry reader ID/version, model version 2 and availability capabilities. `core/run_model.js` checks all result collections, plate geometry/positions, source byte counts and hash syntax, sample/reference boundaries, raw read tuple lengths and numeric types. The registry verifies claimed source hashes against the input bytes and validates every run from a source before annotating or committing any of them. Missing measurements, NaN sentinels and EDT templates remain supported; encrypted inventory cannot contain decoded measurements. Stored vendor results remain separate from raw acquisition arrays and independently calculated outputs. Native CFX RDML normalisation is a reader adapter; it does not replace the generic RDML parser.

## Password and integrity

`core/ui/local_password.js` obtains a user-supplied password, in page memory only. `readers/pcrd/reader.js` derives ordinary ZipCrypto state from that input and verifies decoded CRC/size. No vendor password, CFX-derived state, DLL or installation credentials are distributed. Cancel retains only source inventory. A wrong password imports no measurements and clears the cached password.

`variants/public/integrity.js` distinguishes a locally computed source hash from archive verification and unavailable vendor authentication. Absence of a vendor seal is not a failed ZIP CRC. `variants/public/processing_state.js` marks raw-only Bio-Rad records as raw rather than instrument-calculated results.

## UI, chart and report compatibility

Shared numerical, SOP and export functions use the baseline code. Bio-Rad-specific presentation adapters remain in `core/biorad/`; see its README for the named integration hooks. Pure readers neither create tabs nor replace global UI functions. `lifecycle.js` integrates completed imports explicitly. PDF styling extensions are scoped to reports containing Bio-Rad records; legacy-only reports retain the baseline writer.

`core/hooks.js` defines named extension points with unique registration IDs and explicit integer ordering. Higher-order registrations surround lower-order ones; `next` preserves the dispatcher context and can be called at most once. Replacements register a provider that intentionally does not call `next`. Unknown/duplicate registrations fail; the registry is sealed after startup. Core dispatcher identities stay stable. Public-only core seam copies live in `variants/public/hooks/`, leaving both frozen baseline manifests byte-identical.

Catalogue, Console, Command and Assisted integrations register through these hooks rather than capturing and replacing global functions. Reports use direct `report.style` and `report.paragraph` seams; PDF text/page/paragraph methods are not reassigned. Report construction hooks use explicit `try/finally` for scoped selection flags. `genericScript.onclick` is bound once to a dispatcher. Ordinary DOM event handlers remain ordinary event handlers. `MISSY_HOOKS.inspect()` exposes names, IDs and ordering for diagnostics.

The legal panel embeds GPL/attribution text. Downloadable HTML source is captured before experiment import; the HTML does not embed a second copy of itself. The preferred source distribution includes all modules, manifests, build script, notices and tests. Browser password state and imported experiment data are not part of that source snapshot.

## Validation

Tests cover frozen baseline identity, stored/derived legacy outputs, all 27 original PCRD measurements against independent expectations, all seven ZPCR decoded payloads/exports/graphs against the previous working public release, mixed input, archive failures, password workflows, all modes, desktop layouts and PDF rendering. Real laboratory fixtures and passwords are local and not distributed with the source. Test reports state their scope; they do not establish vendor-equivalent algorithms or laboratory accreditation.

## Report coverage and preview lifecycle

`core/ui/report_workflow.js` supplies explicit hook registrations for preview close/return, available-item rendering and full-source provenance. `unifiedBrowse` captures the originating Assisted/Command DOM, scroll and focus before opening the shared Console viewer. Close/Return restores that DOM without rebuilding it. Intentional navigation to another page clears the return target; standalone Console has no return target.

`SEL_STATE.figureScope` is `selected` or `all`. Standard catalogue items carry their graph definition. Availability renders against a concrete run and requires evidence rows; raw-only inputs do not advertise generic stored-result figures. Availability is cached by run/graph with generation, run count, sample-selection revision, SOP hash, options and endpoint window in the key. Native acquisition items keep their existing source group; unrelated items are hidden for a selected run. Empty groups are omitted.

Selection expansion binds an explicit run index into each run-level figure closure, with a unique export ID and full source note. It never changes `SEL_STATE.run` while building a report and never merges protocols, serials or raw arrays. Across-run comparison graphs retain their original scope. Table coverage remains all loaded data and is stated beside the selector and on the report cover. Selection CSV records figure scope/run for repeatable export.

A full source manifest accompanies selected report/archive material. It prints complete filenames and SHA-256 in wrapped notes, independently of abbreviated table cells. The frozen all/LC build variants do not include these public UI changes.
