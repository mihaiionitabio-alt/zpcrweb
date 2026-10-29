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


## Read-only evidence inventory

`core/ui/evidence_summary.js` reads the decoded run model without changing readers,
measurements, calculations, SOPs, source priority, sample selection or chart settings.
A collapsed inventory under Load files shows reader/source identity, retained result
families, available physical/sample layouts, native read-component counts and explicit
interpretation limits. A declared source-name difference is informational, not a
corruption verdict. Missing evidence means not exposed by this decoded view.

The `evidence` command prints the same inventory. An optional report table and CSV
are available through the existing catalogue hooks; they are not selected automatically.
English/Chinese display strings are separate from original filenames, source hashes,
reader identifiers and machine status codes. This is not a MISSY 0.3 package adapter
or conformance assessment. No new analysis or strict legacy validation is enabled.

## Read-only provenance display

The public build adds `core/ui/provenance_details.js`: a collapsed source-identity panel, optional CSV/PDF table and `provenance` command. It reads existing version, source, checksum, native fingerprint and calibration-count metadata. Native fingerprint methods remain distinct; no digest, decoding, calculation, grouping or result decision is changed. See `RELEASE_VERIFICATION.md` in the local release package for scope and differential checks.

## Read-only native reading inspector

The public build adds `core/ui/native_inspector.js`. It looks up one selected decoded ZPCR/PCRD read/channel/physical position and its original components/dark values. PCRD uses original arrays and native tuple widths, with unknown component meanings kept opaque. Selectors are isolated in a WeakMap; no reader, analytical state or existing export is modified. The new CSV/PDF item is optional and explicitly an excerpt.

## Read-only thermal and optical context

The public build adds `core/ui/instrument_context.js`: bounded excerpts from retained IXO/EDS logs/settings and the currently inspected native ZPCR/PCRD read/channel. It distinguishes display-thinned traces, existing parser summaries, reader-interpreted measured/setpoint fields and unknown sensor bases. No parsing, interpolation, diagnostic calculation, gain/calibration correction or result decision is added. `context` and the optional CSV/PDF table expose the same retained fields.

## Read-only current scope

`core/ui/scope_snapshot.js` displays current configuration, applied/draft/pending sample-mask state, stored-record inclusion counts and report selection count. It calls only the existing mask predicate; it does not evaluate a method, apply a mask, change revisions/options, invoke independent engines or create audit history. Optional CSV/PDF snapshots and the `scope` command use the same read-only state.

## Static evidence glossary

`core/ui/evidence_guide.js` adds eight bilingual evidence definitions under Load files, collapsed by default. It describes processing and limitations of the existing evidence views. It uses static text and DOM only, does not read run data or install export/command/catalogue handlers, and adds no conformance, validation or calculation rules. It complements partial P01/P14 display work; it does not complete any 0.3 package.

## Registered-reader inventory

`core/ui/reader_inventory.js` reads registration IDs, adapter versions, extensions, model version and display build from the existing registry. It never probes/decodes files, inspects run data, infers capabilities or changes the registry. The collapsed bilingual panel offers a literal CSV snapshot. ZIP batch intake is explicitly distinguished from registered readers and MISSY package support. This is partial P01/M01 evidence, not validation of every declared file variant or vendor conformance.

## Optional evidence-export dictionary

`core/ui/export_dictionary.js` provides a static bilingual companion dictionary for six existing optional evidence CSVs. It documents literal column keys, first-row header selection, native availability variants, numbering bases, state/value/basis meanings and evidence limits. It reads no loaded data and changes no CSV serializer, old export, registry, selection or calculation. The JSON companion has its own descriptive schema ID, not a MISSY acquisition-package/schema-validation claim.

## Source metadata identity comparisons

`core/ui/source_matches.js` compares existing source SHA-256 metadata for decoded views and displays retained byte counts. It never rehashes files or accesses scientific data, never groups/suppresses results, and never changes source/companion/cohort priority. Shared metadata is not authenticated acquisition identity or a duplicate-analysis verdict; one file may contain several views. The explicit CSV is a new inventory only. Missing/invalid hashes have unavailable match counts. Byte-count conflicts are descriptive and do not gate anything.

## Retained calibration metadata

`core/ui/calibration_metadata.js` shows at most 20 QuantStudio retained calibration headers (file/name/id/version/raw timestamp/raw expiry) and the existing PCRD calibration-record count. It does not call existing calibration-table helpers, convert dates, judge expiry/traceability, parse native source data or apply coefficients. Operator identities/coefficients are outside the excerpt. Other formats remain not exposed by this view; templates/locked inventories are explicit. A new button-only CSV does not change existing exports/report selection or calibration checks.

## ZIP helper namespace and compatibility

The public filtered archive helper is named readZipFiltered; public intake and RDML container extraction call it explicitly. A compatibility wrapper preserves global/__qc.readZip (async, arity 2, array return), and readExperimentArchive remains bound to it. The QuantStudio readZip is local to the EDS IIFE and unchanged. This is namespace clarification, not evidence of a live shadowing defect: baseline full-page ZIP staging/loading already works. The historic all/LC source and font remain unchanged.

## Guided learning workspace

`core/ui/learning_workspace.js` loads embedded artificial RDML through the normal intake/reader pipeline in a separately owned, same-origin srcdoc MISSY document. Its localStorage/sessionStorage are memory-only. The parent session and profile remain intact. `core/ui/learning_game.js` supplies grading; the workspace has 24 short bilingual-in-source, single-language-in-display lessons derived from the child model. The guide is beside the actual charts/results, can be collapsed, and records identity-based well/point evidence and unscored reasoning/time. Existing offline voice routing delegates to the active game without altering recognition or analysis rules. Supplemental integrity exhibits hash exact original RDML bytes and a one-byte-altered copy and are explicitly labelled as training exhibits, not vendor verification. No evidence snapshot or answer is used to overwrite real records. `tests/learning/` covers both languages, voice text routing, real chart interaction, parent preservation and separate-format scientific/export parity.

## Training interaction and completion record

The training child hides its microphone widgets; the parent owns the one active recognizer. Typed and spoken game commands share the same handler. Native review/plate menus and well cells are used for sentinel and occupied-well lessons, and standard/melting lessons use existing results/load tables. Menu path markers are training-only DOM decoration. A reserved score panel in the guide shows original Web Audio reward cues; each lesson awards points once.

`core/ui/learning_report.js` calls the existing `pdfDoc` writer and embedded Unicode font without changing scientific exports. `vendor/html2canvas.js` (MIT, pinned 1.4.1; `html2canvas-LICENSE.txt`) locally renders the actual training child viewport to JPEG after each correct answer. These are DOM-rendered workspace images, not native OS captures. Captures are retained only in the temporary session. The completion PDF includes entered identity, every question/attempt, retained images, score, UTC timestamps and monotonic elapsed time as HH:MM:SS.mmm. Tests cover all 24 lessons offline in both languages, recognition-event routing, idempotent rewards, rendered PDF pages, and guide/menu separation at three desktop widths.
