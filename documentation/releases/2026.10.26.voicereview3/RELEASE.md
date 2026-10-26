# 2026.10.26.voicereview3

Includes the 21 read-only commands published in voicefacts2. The original 122-pair readiness register remains 65 working routes, 10 boundary responses and 47 not-yet-implemented phrases. New operational phrases below are additional to that register; they do not silently implement the remaining higher-risk commands.

## Additional phrases

- Computer damage report: counts existing integrity mismatch findings, retained software faults and locked PCRD views. It does not run a new scan, certify other files intact, count all charts, diagnose hardware damage or say nothing else is impaired.
- Computer stations / review stations / battle stations / general quarters: opens Quality and forensic review, saving the prior presentation state. No open-finding count is invented.
- Computer as you were / belay that / belay my last: returns from that saved review navigation. Workspace graph selectors and Console chart selection/zoom are restored; Command and Assisted overlays are restored. It is not a general undo system. Data-session changes invalidate the saved return point. Profiles, selections, exports and data are never rolled back.
- Computer security alert / intruder alert: reports actual export pseudonymisation state. It makes no intrusion/no-risk claim, does not start an export, and respects the user's preference for original names in spoken lists. Export behavior is unchanged.
- Computer this is a drill / this is not a drill: changes a manual interface label. Manual alert button requests and observed alert state changes are tagged in a separate in-memory interface log, capped at 200 entries. It is not the scientific forensic record, is not exported by existing exports, and does not survive reload. Clearing drill mode does not erase earlier tags. Computer drill log reads it in pages of eight.
- Computer red alert: requests the existing manual looping alarm through its existing button, subject to the cue being enabled and browser audio being available. This is a manual request, not a detected scientific alarm. Existing synthesis is unchanged.
- Computer cancel red alert / stand down / all clear: stops the existing manual alarm and clears the drill label. It does not assert a passing scientific or green condition. These exact phrases are recognized before the generic negation guard; phrases such as do not cancel red alert remain blocked.
- Computer all hands / all decks: refreshes the small manual-state label in Workspace and Console status bars. It does not infer an automatic yellow/green condition or a count of unresolved issues.
- Computer all stop / full stop: stops voice, manual alert, ambience and previews, and requests demo pause where its existing pause API is available. It explicitly does not halt file reading, rendering or instrument acquisition; loaded data remains. It does not set a pretend halted flag or cancel the reader.

## Validation and preservation

Chrome tests cover round trips through Workspace, Console, Command and Assisted; actual manual-alarm start and cancellation; drill tags; exact negation exceptions; conservative damage reporting; disclosure state; and unchanged scientific snapshots. Voice transcription remains emulated. Per-format read-only voice bindings are rerun separately for IXO, EDS, EDT, RDML, CFX RDML and ZPCR. Decoded PCRD is not retested without its key; the PCRD reader is unchanged.

Only the voice module and publication meta differ from 3e27ffa. All other HTML bytes after LF normalization are unchanged, including scientific calculations, readers, export implementations, font coverage, audio synthesis and graphical styles. Everything remains inside one offline HTML file. The previous release's detailed readiness register is at ../2026.10.26.voicefacts2/VOICE_READINESS.md.
