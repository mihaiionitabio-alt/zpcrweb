# 2026.10.26.voicefacts2

21 of the previously guarded phrases now use read-only bindings. The 122-pair catalogue now has 65 working routes, 10 boundary responses and 47 explicit not-yet-implemented responses. This does not mean 65 distinct new scientific capabilities: routes include existing navigation, inventories and question handlers.

New commands:

- how many instruments; are these runs comparable
- which run is newest; which run is oldest; how long did run 3 take (also other spoken/digit run numbers)
- what protocol was used; what targets are loaded
- read the results; summarise the run; which samples should I repeat
- check the controls; did any control fail
- what does the profile require; is the run acceptable; does this profile apply
- how many standards; which chart is this
- where did this run come from; which target is the reference
- what will the export contain; run a diagnostic

Every command begins with Computer or Missy. Long lists are paged eight items at a time: say Computer more. Run summaries and origin requests require an unambiguous single-run graph, or exactly one loaded run; they do not silently select the first of several runs.

## Data basis and limits

Instrument counts are distinct recorded platform/instrument labels, not independently verified physical-device identities. Missing identifiers are counted separately. Protocol signatures use the existing ccProtocolKey representation. Matching signatures do not establish comparability, and missing metadata is never counted as a successful cohort check.

Newest/oldest uses existing runTimes start timestamps, falling back explicitly to experiment creation timestamps. Ties and missing timestamps are disclosed. This is not file-read time. Duration uses the existing recorded start-to-end duration and is unavailable for missing/negative intervals.

Results use existing sopSampleRows summaries within each run and current selection. They are not raw reaction counts. Repeat reports only exact Repeat outcomes in existing sopInterpretationRows; Invalid, Inconclusive and other outcomes are not silently added. Existing rule and reason fields accompany repeat findings.

Controls report existing evaluated control groups and exact Control fail outcomes. Existing control-presence criteria with fail/review status are counted separately. Missing controls or unavailable assessments do not become passes. Existing profile statuses, templates, selection-pending and not-applicable states are retained. Run acceptance is not release approval.

Profile requests read literal target/control definitions and declared Cq limits; blanks say unset. Reference roles come from the profile and do not prove detection. Standard counts are included stored rows with the exact Standard role; they are not unique concentration levels, usable calibration points or accepted curves. Omission/quality validity is not inferred from that count.

The export question describes differing existing export scopes without downloading anything. The diagnostic command reports an inventory and explicitly states that no new reader self-test, checksum scan or hardware diagnostic ran. Source metadata is reported as recorded, not independently authenticated.

## Validation

Loaded-file voice tests run separately for IXO, EDS, EDT, RDML, CFX RDML and ZPCR. In every format, all 21 new routes return bilingual answers, counts are checked against existing loaded-model assessments, and scientific snapshots and normalized export rows are equal before/after questions. Empty data and blank Cq limit tests pass without profile mutation. All 122 phrases have explicit routes. Existing contextual answers, stable recognition, wake barge-in, workspace controls and five-second highlights were regression-tested in Chrome.

No new microphone/transcription accuracy claim is made: recognition routing is emulated. Decoded PCRD was not rerun because no decoder key was provided; its reader implementation is unchanged. Independent cross-version format regression results are recorded alongside the release.

Only the voice module and publication-version meta change. All other HTML content is identical to b424165 after LF normalization, including readers, calculations, exported results, full font coverage and synthesized sounds. The application remains one offline HTML file.
