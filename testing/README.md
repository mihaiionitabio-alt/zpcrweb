# MISSY unified testing build

[Open the unified HTML](https://mihaiionitabio-alt.github.io/zpcrweb/testing/Missy-unified.html?v=2026.11.05.unified-alpha9-directory1).

One unencrypted offline HTML contains two runtimes and selects one by browser capability. Full font coverage and local recorded audio remain embedded. Missing speech recognition alone does not force compatibility mode.

## New in alpha9

Run-specific charts prepare one at a time for each selected run after import. The modern runtime defaults to an estimated 512 MiB chart-cache budget, with a 1 GiB option. The compatibility runtime keeps 16 MiB. Numerical analysis remains on demand.

## Changes carried forward from alpha8

Console focus uses the native SVG palette without a second inversion. Nested SVG chart backgrounds, labels and grid lines follow the display theme. The saved chart background preference is respected on startup. Chromium checks covered focus in both themes and 25 chart outputs from an IXO fixture.

## Changes carried forward from alpha7

The full-screen import display shows elapsed time, files processed, and an estimate that updates after each file. The compatibility reader decodes ASCII IXO text faster and reuses the decompressed acquisition stream for control charts. The 13-file compatibility test produced 613 results with acquisition parity for all 13 files.

## Fixes carried forward from alpha3
- Internal-control shift checks use a median per target.
- Flag-only actions cannot become result verdicts; missing required controls cannot authorize a negative through flag-only settings.
- Outcome severity ranks unknown values last and includes control failure.
- SVG IDs no longer depend on rendering history.

It also retains alpha2's lossless runtime transport, chunked integrity check with surrogate-boundary protection, payload-reference cleanup, immutable whole-file download, fail-closed routing and graph-selection/SOP isolation.

## Not all issues are closed
Native IE11 has NOT been tested. Compatibility mode in Chromium does not establish IE11 support. Encrypted PCRD numerical decoding is not covered. Selection-scoped control-chart labels/export metadata remain a follow-up; SOP verdicts still use the complete batch. This is an experimental release, not validated laboratory software.

VALIDATION.json records the build identity, exact release hashes, test results and open issues. The root application remains the separate modern maintenance release.

Prepared experiment charts have session codes and voice numbers. The chart button distinguishes a cache hit from an on-demand draw. Ordinary browsing no longer delays background jobs.
