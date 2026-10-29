# MISSY learning workspace — 2026.10.29.learning2

The game previously displayed a separate question card while MISSY itself had no loaded data. Training now opens its own complete MISSY workspace and loads two embedded RDML files through normal intake and readers before presenting any question. All assets, profiles, data and instructions remain inside the one offline HTML.

## What the player sees

Loading screen → language/session setup → Learning game or Real data analysis. English and Chinese game UI are separate. The game has a persistent artificial-data label, actual MISSY on the left and a collapsible guide on the right. The header notice is not duplicated inside the frame. Controls wrap at desktop widths.

33 artificial runs / 789 stored result records are available in normal results, charts and review views. The original 32-run synthetic fixture supplies three repeat groups, one failed negative-control group, a 30-point primary history with four flagged points and a two-point short history with no ready baseline. One additional RDML run supplies 19 cycle-limit classifications and two retained final-cycle Cq values. Classification is read from the unchanged RDML reader's native fields; numerical equality alone is not used by the game to decide the split. These are artificial illustrations of the reader contract, not vendor validation.

## 24 lessons

Intake count; loaded-file identity; repeat count; repeat rule; failed negative control; observed signal versus cause; cycle-limit tokens; measured final-cycle values; select a well; baseline readiness; short-history count; instrument cohort; flagged-history count; select a plotted point; distinct occupied wells versus result rows; amplification graph; stored melting records; standards; profile applicability; altered-copy manifest; absent expected checksum; export review; actual training PDF generation; laboratory release boundary.

The checksum cases are clearly labelled supplemental training exhibits. The trusted digest is calculated from the exact embedded RDML source bytes; the changed-copy digest is calculated from those bytes with one appended space. They do not assert that a vendor seal or uploaded real file failed. The plate lesson counts occupied positions and does not pretend to simulate a CFX physical reference row.

## Beginner interaction and scoring

Every lesson starts with an Open evidence action. The real table/chart or a clearly labelled evidence card in the appropriate MISSY tab is highlighted. Answers use a short quiz, a number, a requested view, a well identity or an actual plotted-point index. Wrong answers remain retryable; no timer or leaderboard. Hints are free in guided mode. Reasoning and latency are recorded, never scored. Existing grading retains the strict hint-ceiling API for later challenge work. A correct response is required before Next. All attempts remain in the exported learning record.

## Voice

The existing optional local English recognizer routes to the active training context. Examples: Computer, open evidence; Computer, value thirty three; Computer, answer one; Computer, select well A1; Computer, select point twenty seven; Computer, confirm; Computer, next; Computer, hint. English recognition can be used with a Chinese display; this does not claim Chinese microphone recognition. Mouse and keyboard need no voice pack. The tests exercise routed transcript input, not physical microphone transcription.

## Isolation and unchanged calculations

Training owns a separate same-origin srcdoc and memory-only local/session storage. It reuses the existing readers, SOP engine, control-chart calculations and PDF builder. Supplemental artificial logs are generated only in the training child. Exiting destroys that workspace; an already-loaded parent session's scientific tables and export snapshot remain unchanged. Full font source coverage is unchanged.

## Verification

- 24 complete lessons in English and Chinese, with independent boot assertions of planted counts.
- Routed voice answers, well and plotted-point selection, actual mouse point click and keyboard well selection.
- Actual training PDF built in both languages.
- Guide collapse, retry gating, clean re-entry and preservation of an already-populated parent.
- Layout geometry at 1280/1536/1920, both languages: one notice, non-overlapping header controls, separate frame/sidebar.
- Separate IXO, EDS, EDT, generic RDML, CFX RDML and ZPCR scientific/result/export snapshots equal to the preserved before-build. PCRD locked/cancel path equal; decrypted PCRD comparison was not run without a password. Reader code is byte-identical for every format.

This is practice complementary to supervised training, not competency certification or laboratory release authorisation. Not every previously proposed teaching case is implemented: a full physical-reference-row simulator, preparation/chain-of-custody record editor, pre/post educational study and proof of learning effectiveness remain future work.
