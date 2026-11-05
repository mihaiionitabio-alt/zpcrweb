# MISSY unified testing build

[Open the unified HTML](https://mihaiionitabio-alt.github.io/zpcrweb/testing/Missy-unified.html?v=2026.11.05.unified-alpha9-compat1).

One unencrypted offline HTML contains two runtimes and selects one by browser capability. Full font coverage and local recorded audio remain embedded. Missing speech recognition alone does not force compatibility mode.

## New in alpha9

- Background preparation checks for work every 100 ms and prepares one chart at a time. Ordinary browsing does not pause it. Imports and foreground chart processing take priority.
- The modern runtime has a fixed 2 GiB estimated background chart-cache budget. Manually drawn charts can increase retained usage beyond that budget. The compatibility runtime keeps its 16 MiB cap.
- Prepared experiment charts have session-specific codes and voice numbers. The viewer shows **Open prepared chart** for a cache hit and **Draw selected chart** when it needs to render.
- Curve groups sort by stored curve count. Experiment chart cards show their names and availability, with full charts displayed separately.
- The Control Panel shortcut opens the curve-group workbench. Numerical analysis runs on demand and can use a worker-free path when worker startup fails.
- The compatibility runtime includes layout and dialog keyboard improvements, JSON history recovery notices, and Chinese translations for selected controls. The compatibility experiment viewer offers SVG and CSV downloads.

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
