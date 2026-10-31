# Validation evidence and scope

## Current build checks

The clean R2 run passes all 24 suites. Initial results and subsequent attempts are retained separately; the R1 result was 22 passes with two harness infrastructure gaps. The latest result per suite is listed below. A passing suite validates only its asserted contracts and supplied fixtures.

| Suite | Latest result | Elapsed seconds |
|---|---|---:|
| voice-demo | Pass | 44.78 |
| formats | Pass | 71.47 |
| guided-tour | Pass | 235.05 |
| voice-routing | Pass | 5.94 |
| voice-state | Pass | 10.32 |
| ack-queue | Pass | 5.36 |
| clarification | Pass | 6.27 |
| voice-bargein | Pass | 7.28 |
| command-finish | Pass | 11.07 |
| chart-focus | Pass | 30.41 |
| evidence-keyboard | Pass | 83.47 |
| readonly-evidence | Pass | 0.22 |
| scope-snapshot | Pass | 0.17 |
| source-matching | Pass | 0.20 |
| reader-inventory | Pass | 0.19 |
| calibration | Pass | 0.18 |
| precision | Pass | 11.94 |
| zip | Pass | 4.88 |
| model-contracts | Pass | 0.22 |
| mara-math | Pass | 0.27 |
| mara-definitions | Pass | 32.59 |
| game-mechanics | Pass | 0.22 |
| training | Pass | 571.95 |
| quantstudio | Pass | 222.71 |

**3688 of 6180 first-party function nodes** were entered during passing instrumented browser scenarios. This is execution coverage, not 3688 independent correctness proofs. Static and VM tests may validate contracts without browser-entry records. Unobserved functions remain explicitly indexed.

The current checks include reader/results/export comparisons, guided and voice demos, bilingual learning/reporting, recognition state handling, read-only evidence and mathematical unit tests. PCRD password cancellation is distinct from successful decryption.

## Historical evidence: record 23437639

All seventeen published PDF files were matched to the record's MD5 checksums and all **6,437 pages** were text-indexed. The historical function volume lists 676 harness symbols plus 29 uncovered symbols; these include constants and cannot be compared directly with the current nested-function AST count.

The archived material reports 105 engine assertions, 50 panel assertions, 17 regression checks, 14 name-pattern checks, 13 selection-edge checks, 16 property checks, 27 synthetic-run checks and 89 RDML cases. These are separate historical checks, sometimes covering overlapping behaviours. Do not add them into a count of independently validated features. Duplicate regression records are not additional tests.

Archived import smoke sets contain 96 main-demo files and 200 drift files. The complete manual atlas describes 356 native synthetic runs. Matching RDML exports are representations of those runs, not independent experiments.

The screenshot archive contains 4,000 PNGs and **537 skipped states**. Skips include unavailable views and a chart-render error. Zero errors in a final resumed capture is not proof of an uninterrupted error-free capture.

The manual itself warns that a harness “pass” may mean only that a call did not throw. An inappropriate synthetic call returning NaN was still marked pass historically. Those verdicts are preserved as historical evidence, not promoted to current scientific validation.

## Later archived evidence: record 23623413

The October 24 package documents seven groups with 74 source files and 92 decoded views, plus the then-current 30-lesson demo. It is not the October 31 build. Its broader PCRD fixture coverage must not be attributed to a current locked-file cancellation test.

## Outstanding gaps

- The generated ZIP fixture now passes container guards and artificial RDML parity. Historical native archive quirks remain untested by this replacement; see R2_SCOPE.md.
- MARA definitions now checks all 32 current profiles and pinned synthetic outcomes. These are regression oracles, not laboratory validation.
- Native microphone transcription, device speaker volume, clinical performance, intended-use validation and laboratory acceptance are outside these automated results.
- Historical findings D1–D12 require individual current checks before any claim that all are resolved.

## QuantStudio melting comparison detail

The passing comparison log records 288 additional vendor peaks and 11,328 stored-versus-export derivative differences for one SYBR fixture. Passing means the test preserves and checks those declared representations; it does not mean every derivative value is identical. These differences need interpretation in their original test context, not suppression from a summary.

## QuantStudio melting comparison detail

The passing comparison log records 288 additional vendor peaks and 11,328 stored-versus-export derivative differences for one SYBR fixture. Passing means the test preserves and checks those declared representations; it does not mean every derivative value is identical. These differences need interpretation in their original test context, not suppression from a summary.

## Attempt comparison

Initial and clean logs differ because the harness changed between attempts, not merely because instrumentation prints output. See HARNESS_ADJUSTMENTS.json and R2_SCOPE.md. PCRD keyboard passes cover password cancellation only.

The 3,688 entry observations are the preserved R1 instrumented snapshot. R2 runs are uninstrumented; ZIP contract evidence is linked separately and does not manufacture new hit counts.
