# Modular public regression checks

`python tests/test_builder.py` runs without dependencies and checks the frozen baseline digest and builder path/cycle rejection.

The `.cjs` scripts need Node, Playwright and Chrome. `MISSY_PLAYWRIGHT_MODULE` and `MISSY_CHROME` can override the local defaults. These development dependencies are not required to use or build the offline HTML.

- `hooks_and_models.cjs`: dependency-free hook ordering/context/sealing/double-next/async-cleanup checks, malformed-model rejection and atomic multi-run validation.
- `report_modes.cjs`: actual password prompt with three original PCRDs, decoded records/Console navigation and real Command/Assisted PDF downloads; `MISSY_TEST_URL` can point to Pages.
- `legacy_regression.cjs`: original versus public results/derived tables, RDML exports and visible tabs for IXO, EDS, EDT and three RDML processing states.
- `integration_all_formats.cjs`: 27 original PCRDs against `fixtures/PCRD_EXPECTATIONS.json`, mixed 61-file input, all modes, desktop layout, graph controls and a mixed report.
- `zpcr_golden.cjs`: seven original ZPCRs against the pre-port working public HTML, including raw/hardware export bytes, graph SVGs and eligibility decisions.
- `archive_and_password.cjs`: nested/mixed/renamed archives, corrupt CRC, content detection and password cancellation/rejection/retry/storage checks.
- `compare_builds.py`: general baseline comparison helper, with both pages required to decode nonempty runs without errors.
- `lc_rejects_other_formats.py`: frozen LC-only build rejects omitted formats.
- `inspect_report.py`: PDF extraction, page-bound checks, full source identities and page rendering/contact sheets. Requires PyMuPDF and Pillow.

Real experimental files, the old reference HTML and PCRD passwords are not bundled. Configure fixture paths for your machine. The integration runner supports `MISSY_PCRD_SAMPLE_ROOT`, `MISSY_PCRD_EXTRA_ROOT`, `MISSY_PCRD_EXPECTATIONS` and `MISSY_TEST_HTML`; the ZPCR runner supports `MISSY_ZPCR_SAMPLES` and `MISSY_ZPCR_REFERENCE_URL`. Other local fixture paths are listed explicitly in the scripts so a missing fixture fails rather than silently skipping a format.

For password tests set `MISSY_PCRD_PASSWORD_FILE` to a private local text file. The test enters that value through the real browser password input. Do not commit the password file or enable logging/tracing that captures password values. The source package contains no vendor password or CFX-derived initial state.

Golden digests validate these particular sample payloads and regressions. They do not demonstrate vendor-equivalent Cq/Tm algorithms, acceptance limits or instrument qualification.
