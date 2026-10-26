# MISSY 512-choice offline synthesis release

26 October 2026. There is no fixed browser maximum of 512 sounds; 512 is a practical library size, not a platform limit. The catalogue contains **504 audible choices and 8 intentional silences**. It retains the 99 previous cues, adds 201 choices informed by the supplied map, 211 quiet control-feedback tones, and one file-activity pulse. Shared sound families intentionally reuse shapes; this does not claim 504 perceptually unique sound designs.

## What is now connected

83 explicit control-request routes were tested against routing fixtures, in addition to previous event mappings. A generic fallback covers otherwise-unmapped buttons, links acting as controls, and selects. Checkbox change events are captured before a sample table can replace its DOM: individual sample rows, group inclusion, sample review, and other ordinary checkbox controls use a rising on cue and falling off cue. Sound-preference controls are excluded from that feedback so disabling sound does not itself add a beep. Typing, continuous dragging, pointer movement and dragleave remain silent. Drag entry is deduplicated.

File staging/reading gets a quiet, nonverbal, approximately one-second activity pulse. It observes APP_STATE.phase without wrapping or changing readers. It stops outside staging/reading and is suppressed when a page dialog is waiting for input. Its individual cue can be disabled. Browser main-thread work can delay timer delivery; it is not a timing measurement, progress percentage or assertion that a particular file decoded successfully.

## Synthesis and control

Oscillators, deterministic filtered-noise buffers, glides and envelopes are generated locally in one reused AudioContext. There are no sampled recordings, base64 audio blobs, remote audio assets or copied character voices. Existing spoken responses still use suitable installed local system voices; a full TTS voice engine is not embedded.

Events are limited to one cue per 150 ms, with one pending slot replaced by the latest request. Background audio is off by default. The settings menu offers six explicit background choices; choosing one enables that cue. Only one background loop can run. It ducks by 12 dB under event cues, stops on hiding the tab and on Console focus mode, and cleans up nodes on replacement or page exit. Other loop recipes have bounded previews, not automatic sustained playback. The explicit manual Red alert preserves its previously requested play-until-stopped behavior, including in focus mode. Global sound, individual cue switches and previews remain available.

## Scope of the supplied map

The complete 300-row proposal is audited in MAP_AUDIT.md / SOUND_MAP_AUDIT.json. Unverified integrity, sentinel, firmware-change and hardware-failure events remain unbound; they are not inferred from clicks. Seven signal layers are not invented from the current two-option graph selector. The result-outcome control filters displayed results; it does not change an interpretation. A download request is not proof that a browser saved a file. Preview-only entries are labelled and disabled by default. The library size is not the number of implemented scientific event detectors.

The TrekCore index and pasted taxonomy were considered as categories, not copied recordings: https://www.trekcore.com/audio/ . The user explicitly requested original synthesis. No claim is made that every source recording was used. Catalogue and code add about 105.0 KiB compared with f06308c; zero audio payload does not mean zero additional code or metadata.

## Checks

Chrome tests passed for every catalogue preview, silent entries, default-off entries, synthesized noise, bounded loop previews, one AudioContext, cleanup, first/latest queue behavior, opt-in background playback, focus cleanup, manual alert persistence and scientific snapshot equality. Real sample-row and group checkbox tests passed despite immediate DOM replacement. The one-second pulse and stop test uses simulated lifecycle phases; actual native file intake is exercised separately. Existing addressed voice-command stability tests passed with emulated recognition. Physical microphone accuracy is not asserted.

Only three presentation modules differ from f06308c; readers, calculations, results, exports, fonts and voice-command parsing remain byte-identical. Separate scientific/export regressions cover IXO, EDS, EDT, RDML, CFX RDML and ZPCR. Decoded PCRD is not rerun without its test password; previously tested locked-PCRD behavior remains documented. The page is still one offline HTML file.

Editable sources and tests are included. To change catalogue text/recipes in the modular tree, edit sound_catalogue.json, run tools/sync_sound_catalogue.py, then python build/build.py public. expand_sound_map.py records the earlier 300-choice compilation stage and is not the final 512-choice synchronizer.
