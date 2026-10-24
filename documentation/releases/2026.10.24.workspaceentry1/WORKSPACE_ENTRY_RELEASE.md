# Workspace entry fix — 24 October 2026

Build `2026.10.24.workspaceentry1`.

Enter workspace now closes Console, Command and Assisted overlays, including a Console opened behind session setup for a microphone check. Closing Console stops that temporary recognition session and its microphone stream. The normal selected workspace page is retained; names are saved through the existing SOP identity path. Explicit mode buttons remain available afterwards.

Tests: English/Chinese name entry by Enter and click; fresh, Console, Command and Assisted origins; microphone-started setup exit; names, target/control/run rules preserved; normal workspace visibility; existing Console voice/focus and footer-command checks. Separate IXO, EDS, EDT, RDML, CFX RDML, ZPCR and PCRD scientific/export-data regressions passed (74 sources / 92 views).

Only session_setup.js changes among source modules; build metadata and tests/documentation update separately. Readers, calculations, results, exporters and full font are unchanged. Microphone recognition in tests is emulated.
