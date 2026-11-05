# MISSY unified testing build

[Open the unified HTML](https://mihaiionitabio-alt.github.io/zpcrweb/testing/Missy-unified.html?v=2026.11.05.unified-alpha3).

One unencrypted offline HTML contains two runtimes and selects one by browser capability. Full font coverage and local recorded audio remain embedded. Missing speech recognition alone does not force compatibility mode.

## Fixed in alpha3
- Internal-control shift checks use a median per target.
- Flag-only actions cannot become result verdicts; missing required controls cannot authorize a negative through flag-only settings.
- Outcome severity ranks unknown values last and includes control failure.
- SVG IDs no longer depend on rendering history.

It also retains alpha2's lossless runtime transport, chunked integrity check with surrogate-boundary protection, payload-reference cleanup, immutable whole-file download, fail-closed routing and graph-selection/SOP isolation.

## Not all issues are closed
Native IE11 has NOT been tested. Compatibility mode in Chromium does not establish IE11 support. Encrypted PCRD numerical decoding is not covered. Selection-scoped control-chart labels/export metadata remain a follow-up; SOP verdicts still use the complete batch. This is an experimental release, not validated laboratory software.

BUILD.json records exact release hashes. Missy_offline.html is retained only as the older testing1 snapshot. The root application remains the separate modern maintenance release.
