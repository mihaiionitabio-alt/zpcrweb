# Published MISSY review fixes — 2026.11.05.reviewfix1

This updates the documented modern page, not the experimental unified/IE11 build. The previous URL query was a cache hint, not an archived build identity. The development snapshot under testing/ is unchanged.

## Changes
- Internal-control shift checks now compare each target with its own target median. Different IC assays no longer share a threshold-cycle baseline. Row exports carry the corresponding IC median. The pooled diagnostic summary field is retained for compatibility; the decision uses row-level target medians.
- A profile action `flag` is not a verdict. Late/low-quantity flagging retains the measured interpretation and reason. Missing required reference/control with flag resolves to Invalid; shifted control and incomplete detection resolve to Inconclusive. Thus a flag-only setting cannot authorize an unsupported negative. Unknown configured outcomes fall back to the applicable rule's default.
- Sample severity uses one explicit ranking, includes Control fail, and puts unknown values last rather than index -1 ahead of Invalid run.
- SVG clip IDs are deterministic from plot content (two 32-bit hashes), independent of a global render counter. Stored data and plotted coordinates are untouched; SVG bytes deliberately change.

## Evidence and limitations
Synthetic cases exercise mixed IC targets, a shifted IC, missing/shift/partial/late/quantity flag settings, unknown outcome ranking and repeated SVG after unrelated rendering. The published pre-fix build and this candidate were also compared on 13 IXO runs / 613 stored results: all 19 canonical/CSV/RDML checks match for that supplied SOP and dataset. EDS, EDT template, RDML, raw-only ZPCR and locked PCRD cancellation were checked separately. Encrypted PCRD measured results are not covered. These datasets do not exercise every SOP configuration; the defect-specific synthetic tests cover the intentional behavior changes.

No raw instrument readings were changed. Affected SOP interpretations can change deliberately: mixed-IC false shift warnings and invalid `flag` verdicts are corrected. This is research-use software, not validated laboratory authorization.

## Reproduce
Install test dependencies under review-fixes/. Supply MISSY_FIXTURES pointing to the local fixture set (ATASAT.zip, SC_embedded_v1.4.sop.json, and vendor/ files). Preserve the pre-fix published HTML as review-fixes/published-before.html. Then run regression.cjs, fixture-parity.cjs, format-parity.cjs from the repository root. Input files are deliberately excluded from this public change. apply-fixes.py records the idempotent source transformations; index.html remains the complete unencrypted application source.

Chromium cold boot: zero exceptions; startup completed; SVG repeatability verified. Full font/audio payloads (297 long encoded assets) are byte-identical to the previous build. Recorded demo narration remains historical; this change does not relabel its audio clips.
