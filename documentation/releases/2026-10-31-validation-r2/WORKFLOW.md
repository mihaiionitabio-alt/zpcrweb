# Validation workflow

Freeze and hash the dist HTML; compare it with the Git-normalised bytes. Verify historical documentation identities separately. Index functions without equating entry coverage with correctness. Preserve original and rerun test results. Generate invented deterministic ZIP fixtures, compare current MARA profiles to pinned regression oracles, then run all suites against uninstrumented HTML. Retain failures and retries separately. Compare all production source files and the HTML hash with the pre-work snapshot. Publish only documentation, synthetic fixtures and necessary test code.

The public reproducible subset is described in README.md. Private native fixtures, credentials and detailed local workflow logs remain in the Claude review bundle. Their absence is a limit on reproducing the complete suite from this public subset.
