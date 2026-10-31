# MISSY validation and documentation R2 — 31 October 2026

Application build: **2026.10.31.demolabels1**. Application behaviour, readers, calculations and stored results are unchanged. This release repairs test infrastructure and updates documentation; it is not a new application build.

## Checks

The latest clean attempts pass all 24 suites. The initial R2 batch passed 23; evidence-keyboard exceeded its 180-second process allowance and passed an isolated retry in 83.5 seconds. Both attempt records are retained. These results concern asserted software contracts and supplied fixtures, not scientific validation or laboratory accreditation.

- ZIP: eleven reproducible synthetic containers; CRC/size/method guards, nested UTF-8 paths, stored/deflated intake and direct artificial RDML result parity. Intake limits use scaled test-only budgets. Virtual ../ paths are retained as metadata, not rejected or extracted to disk. Native vendor archive quirks remain outside this replacement fixture.
- MARA: 32 pinned shipped-profile hashes, synthetic run outcomes, raw-record immutability, bilingual loading and JSON/ZIP exports. No removed SC preset was restored. A pinned baseline is a regression oracle, not an independent proof of scientific correctness.
- PCRD keyboard checks cover locked-file cancellation without a password fixture. They do not validate successful decryption.

Read CLEAN_CONFIRMATION.md and R2_SCOPE.md for the boundaries. The function-entry counts are the preserved R1 instrumented snapshot, separate from R2 uninstrumented assertions. AST equivalence is many-to-one. Audio provenance and voice redistribution terms are not assumed from encoder tags; 194 exact creation-manifest matches were found locally.

## Reproduce the two repaired tests

Run from this directory with Python 3, Node.js and Playwright available:

```sh
python tests/generate_zip_fixtures.py
node tests/zip_regression.cjs
node tests/mara_definitions.cjs
```

Tests target the repository's index.html by default. `MISSY_TEST_URL` can select another exact build. `MISSY_PLAYWRIGHT_MODULE` can point to an installed Playwright module; `MISSY_CHROME_EXECUTABLE` can select Chrome. Otherwise Windows uses the standard Chrome path and other platforms use Playwright's installed Chromium. Install these dependencies separately if needed; they are not part of the offline application.

Do not set `MISSY_RECORD_MARA_ORACLE` during verification. That explicit maintenance mode rewrites the pinned oracle. Private native fixtures, credentials and original laboratory files are not published here. The complete 24-suite evidence came from the documented local environment; this public subset supplies the two repaired tests and their synthetic inputs.

## Identity and documentation

BUILD_IDENTITY.json separates the exact local CRLF HTML from the LF-normalised Git/Pages HTML. Equal text after newline conversion does not mean equal raw-byte hashes. Download the repository HTML rather than saving a browser DOM snapshot containing extensions or session state.

The wiki Markdown is a current supplement to the seventeen historical volumes at https://zenodo.org/records/23437639. Those volumes and https://zenodo.org/records/23623413 predate this build. The local Claude review bundle additionally retains original logs and harness diffs.

Research use only. MISSY is not validated.

SHA256SUMS.txt hashes the published Git bytes with LF text line endings. A checkout configured to convert text to CRLF changes those byte hashes; use LF-preserving checkout settings when verifying the public manifest.
