# Documentation and validation workflow

1. Freeze the current local HTML identity and publication commit. Preserve the original application.
2. Retrieve published Zenodo metadata. Compare all 17 manual bytes against published MD5 values, then calculate SHA-256.
3. Extract every PDF page and retain page-level provenance. Read historical validation limitations and inspect evidence ZIPs.
4. Reconstruct the current HTML from its manifest and require an exact byte match. Parse JavaScript with Node-bundled Acorn 8.18.0.
5. Index first-party and dependency function nodes separately. Compare canonical AST bodies with the archived HTML; retain ambiguous matches.
6. Instrument only a separate review HTML for function-entry counts. Run supplied suites against it. Preserve initial failures, test-only harness adjustments and subsequent results.
7. Attribute passing scenario IDs to functions without equating entry with correctness. Preserve unobserved code as a review gap.
8. Write current wiki chapters, archive inventories, change crosswalk and limitations. Do not rewrite old results as current results.
9. Package source, scripts, results and review questions. Exclude credentials and private instrument fixtures. Calculate hashes on exact delivered bytes.

## Reproduction entry points

- `index_missy_manuals.py`: historical PDF text/provenance indexing.
- `gather_wiki_evidence.py`: evidence archive acquisition and identity checks.
- `index_current_missy_functions.cjs`: exact build reconstruction, AST indexing and test-only instrumentation.
- `run_current_missy_validation.cjs`: initial suite run.
- `retest_current_missy.cjs`: selected reruns after preserved test-harness adjustments.
- `build_missy_documentation.py`: documentation and evidence crosswalk generation.

The scripts currently retain absolute Windows paths. For another computer, edit the declared input roots and Playwright location, supply lawful instrument fixtures, and reproduce the same dependency versions. Missing fixture/password coverage is explicitly incomplete. No credentials are supplied.

## Hash method

All SHA-256 values in SHA256SUMS.txt hash the complete raw bytes of the named file, without JSON canonicalisation or line-ending conversion. SHA256SUMS.txt excludes itself. This is independent of any application-internal identity field.

## R2 follow-up

Read R2_SCOPE.md and CLEAN_CONFIRMATION.md. Repaired fixtures/tests are in reproduction/missy_modular. Run generate_zip_fixtures.py then the two tests, followed by run_clean_missy_validation_r2.cjs for all 24 suites. No coverage preload is used. Original failures and R1 counters remain preserved. Audio provenance is linked by exact asset hash, not inferred from encoder tags.
