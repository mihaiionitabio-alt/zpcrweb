# R2 scope and review disposition

Production HTML is unchanged. Production source files are compared with the R1 source snapshot in SOURCE_UNCHANGED.json. Test-only changes and diffs are retained.

## ZIP

The missing fixture is replaced by a committed deterministic Python generator and a manifest of eleven invented ZIP files. The test boots the entire frozen HTML and calls the actual public readZip/readZipFiltered functions. It tests default/explicit filters, UTF-8 paths, stored and deflated members, CRC mismatch, unsupported method, malformed archive, declared member size limit and decoded-size mismatch. It stages/reads artificial RDML and compares wells, analyses, cycle count and curves against the same direct XML bytes; threshold cycle 25.5 is checked explicitly.

Intake expanded-byte and file-count guards use temporarily reduced in-memory test budgets; defaults are restored in finally. The member-size test uses the actual 512 MiB declared-size threshold without allocating that payload. The count guard currently retains the first accepted member and reports the error. Tests assert that behaviour rather than falsely claiming atomic rejection.

A ../ path is accepted as virtual source metadata and its basename is used. No archive member is extracted to the operating-system filesystem. There is no traversal-rejection guard to claim as passed. This should be reconsidered if disk extraction is ever added.

This synthetic suite does not replace the missing historical native batch archives, CFX archive-manifest binding checks, mixed-endianness ICFF payload quirks, variable thermal headers, undeclared compression, ZIP64/encryption or successful PCRD decryption. Separate direct-reader regression suites are not substitutes for those archive-specific cases.

## MARA

All 32 current MARA_PROFILE_LIBRARY entries are checked against pinned production sopHash values. The normal test cannot rewrite the oracle. Explicit oracle recording is available only through MISSY_RECORD_MARA_ORACLE=1 and was performed after asserting Positive outcomes and raw-record immutability for all mathematical fixtures. These baseline outcomes are regression oracles, not an independent determination that the standards were implemented correctly.

Each entry is evaluated through sopEvaluateRun with explicitly supplied curve evidence and context. The test checks failed acceptance checks, decision code/outcome and unchanged raw records, then exercises bilingual profile loading, JSON save/import and ZIP export. The removed SC preset is not restored. Synthetic fixture profile adaptations are separate from the pinned shipped profile hashes.

## PCRD and log differences

The keyboard suite cancels password-required PCRD input when no password fixture is provided. A pass is evidence of keyboard navigation/cancellation only, not decrypted data or pcrdCRC/pcrdDecryptContainer correctness. R1 entry counters remain unchanged; clean contract evidence is linked separately.

Initial run_ logs and clean_ logs did not merely differ because of preload output: voice mocks were fixed between attempts, Playwright require paths changed, and PCRD cancellation was introduced. For MARA, the initial failure was a missing runtime path; the next failure was the removed SC accessor. Compare run_, retest_, clean_ and clean_r2_ with HARNESS_ADJUSTMENTS.json. The first R2 keyboard attempt exceeded its 180-second process allowance; its log/result is retained. A separate clean retry uses a 600-second allowance and is combined by suite ID only in CLEAN_R2_FINAL_RESULTS.json. R2 logs are a new attempt; old logs are not rewritten.

## Remaining review findings

Use only the frozen dist build, never a browser Save Page/DOM snapshot that may contain extension scripts or loaded session state. Recorded audio provenance and redistribution terms remain unresolved pending creation-time evidence. The catalogue is exposed as window.MISSY_COMPUTER_SOUND.catalog; use .length to check the 515-entry count. Download pseudonymisation does not govern spoken names. Baseline AST matching is many-to-one, not an unchanged-function cardinality.
