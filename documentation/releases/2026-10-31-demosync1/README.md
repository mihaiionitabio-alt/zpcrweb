# MISSY 2026.10.31.demosync1

Both startup demos remain available: Guided demo and Voice commands. The voice demo uses a disposable frame containing the current application source, checks its live responses against embedded recordings, and stops on a mismatch. The build-identification recording still named twotones1 after the chartfocus1 update, so playback stopped at step 5. Updated the recording and bound metadata to the current build. All other 68 answers matched the current code.

Removed the stale “60 sound preferences” wording from the guided tour and its Chinese cue. It now says “sound preferences”, without a fixed inventory count.

Checks: the 30-lesson guided workflow passed, including synthetic-data report generation and parent-session isolation; all 69 voice steps passed live-response matching; all 138 operator/computer audio streams decoded offline with nonzero energy; the updated build recording advanced during media playback. Voice recognition remains emulated in the demo. The slower Calm narration is retained; the three chapters are each below 15 minutes, with about 21 minutes total. These durations are not shortened to satisfy older fast-speech timing assumptions.

Per-format scientific/result/export parity passed for IXO, EDS, EDT, RDML, CFX RDML and ZPCR; PCRD covers the locked-file cancellation path. Readers, calculations and results are unchanged. Research use only; not validated.
