SYNTHETIC DEMO AND VALIDATION TOOLS - 2026.10.17

Three ZIPs: 24 IXO + 24 EDS + 48 RDML files: all are generated from invented identifiers and measurements, with no real laboratory run as input. RDML files are matching representations of the all 24 runs per platform; do not count both formats as independent experiments. Load IXO and EDS for hardware demos. RDML cannot preserve all proprietary hardware telemetry.

Download all .py tools into one folder. Imports were flattened for Zenodo individual downloads; generator logic is unchanged. Generator uses Python standard library. Verifiers require Python Playwright and Chromium:
 python -m pip install -r requirements.txt
 python -m playwright install chromium

Generate a fresh set and full matching RDML set:
 python generate.py demo --scale 1 --only LC96,QS96 --rdml demo_rdml
Generate trends:
 python generate.py drift --only LCDRIFT,QSDRIFT --drift-runs 50
Verify (supply your local index.html path):
 python verify.py index.html demo --no-exports --json report.json
 python verify.py index.html demo --self-test
 python verify_drift.py index.html drift

MANIFEST.tsv and EXPECTED.tsv describe the 48 vendor runs. Keep them alongside the vendor inputs for verifier runs. Synthetic scenarios deliberately include abnormal values: they are software tests, not calibration materials or manufacturer-certified runs. For RDML-only verification use an appropriate matching expectation subset rather than the full vendor expectation file.

Current release evidence: all 96 generated files imported with nonempty wells and zero browser errors. See SYNTHETIC_IMPORT_SMOKE_RESULTS.json for application checksum. This is an import smoke check; full current-build scenario correctness, graphs, exports, forecasts and statistical calibration are not established. The broader verification tools predate the newest sample-selection and duration-chart additions.

At least 20 matching vendor runs are generally needed for a default baseline. These vendor cohorts each contain 24 runs; individual metric availability and SOP eligibility still apply. Each RDML platform has 24 runs, but vendor hardware-only metrics need the corresponding IXO/EDS inputs.

DEMO SOP PROFILE: SYNTHETIC_DEMO_ONLY_SOP_PROFILE.json reclassifies LEC as an internal control and fixes its reference Cq at 23 for chart demonstrations. It changes interpretation rules and must not be used for laboratory samples.
