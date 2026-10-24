# Clarity and bilingual demo release — 24 October 2026

Build: `2026.10.24.clarity1`.

## Changes

- Offline voice probes the browser's actual local-recognition API and English-pack availability. Unsupported APIs, legacy-only APIs, unavailable packs, blocked checks, failed checks and missing installers have explicit English/Chinese explanations; unusable Start/pack controls are disabled. Probing never installs a pack or opens a microphone. Available/downloadable states retain the existing setup/start workflow. Desktop-view mode is not advertised as adding missing APIs.
- Current build labels read software-version metadata on session setup and beside the legal panel. Historical attribution dates remain intact and are explicitly distinguished from the current build.
- Readiness register reconciled against the implementation. Its old 14-increment count is labelled as a historical checkpoint. Six partial / eight unintegrated 0.3 work packages remain; no whole-package conformance or completion is claimed.
- All 30 demo narratives and 52 callouts have explicit Chinese translations. The demo inherits the selected language in its isolated iframe. Demo-only hardware/melting explanations and report-prepared messages are translated; source/sample/target identifiers and numbers are retained.
- guided_demo.cjs delegates to the authoritative 30-lesson test. guided_demo_suite.cjs covers English, Chinese, offline playback and reduced-motion title transitions; obsolete Welcome/39-step scene indexing is retired. PDF test transport uses base64 rather than millions of JSON numeric elements.

## Scope and checks

Scientific readers, result/calculation engines, existing exporters and full embedded font are unchanged at source level (CRLF-normalised comparison to commit 441a3ff). Only five UI/style modules differ, including the new read-only build-identity module; manifest/version and documentation/tests are updated separately.

Recorded evidence: CLARITY_SOURCE_BOUNDARY.json, VOICE_CAPABILITY_CHECKS.json, FINAL_FORMAT_CHECKS.json, DEMO_30_LESSONS_CHECKS.json and DEMO_30_LESSONS_ZH_CHECKS.json. Eight emulated capability cases; real microphone recognition and pack installation on a physical Android device are not claimed. All 30 EN/ZH lessons, existing artificial PDF construction, parent isolation, offline playback, title/reduced-motion behaviour, session setup and footer controls are checked. Separate format groups are IXO, EDS, EDT, RDML, CFX RDML, ZPCR and PCRD (74 sources / 92 views), comparing scientific results, export rows and normalised RDML with the baseline. These comparisons are regression evidence, not laboratory method validation.
