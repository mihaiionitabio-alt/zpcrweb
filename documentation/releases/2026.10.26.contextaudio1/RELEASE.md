# Context questions, speech interruption and verified audio previews

26 October 2026. This release remains one offline HTML file. No recordings or voice-model weights are embedded. Original synthesis is local; optional spoken output uses installed voices marked localService. An unsupported browser can still use typed questions and tones.

## Questions and commands

Use the footer **?** button to type a question. Supported offline recognition can be started there or in Console. Address a question or command to **Computer** or **Missy**. Examples:

- Computer, where am I?
- Missy, what can I do here?
- Computer, what is happening?
- Missy, how many runs are loaded?
- Computer, which profile is active?
- Missy, what graph is this?
- Computer, what formats do you read?
- Missy, say again.
- Computer, stop.

Questions read current view, mode and existing state at answer time. Counts explicitly describe stored result rows, not interpreted sample totals or separate melting/relative-quantity tables. Current Console option help comes from its actual buttons. No new Cq, classification, inhibition, outlier or acceptance calculation is added.

Unknown questions use the exact English fallback: **I'm sorry, my responses are limited. You must ask the right questions.** Chinese UI uses its Chinese equivalent. Missing labels and nonfinite values are not spoken as placeholders. If local speech is unavailable or muted, the answer is displayed; remote speech voices are not used.

The wake word plays one two-tone chime per recognition segment. Spoken **Acknowledged.** is attempted at most once in five minutes; the timestamp survives reload. A second wake inside the window still chimes. A four-second watchdog expires a pending acknowledgement if native speech never starts or reports completion. An answer can queue after its acknowledgement without cancelling it.

Speech echo is ignored while an answer is speaking, except for a new utterance beginning with Computer or Missy. That permits wake-word interruption, including **Computer, stop**, even when an earlier interim result at that index had been suppressed. Stop cancels speech and recognition and uses a short confirmation cue. Recognition must be active for voice interruption. Tests emulate recognition/TTS; physical microphone accuracy and acoustic echo rejection are not asserted.

## Sound controls and playback

There are 19 functional sound groups, each with bulk enable/disable controls. Individual switches persist and can override a bulk choice; another bulk operation intentionally updates all entries in that group. Preview bypasses group/individual mute and rate limiting, resumes the synthesis context, and toggles between Play and Stop. Eight intentional-silence entries are labelled **Silent**, not presented as active Play buttons. Status reports Playing, Tone complete, Stopped, or Audio unavailable. The dialogue also distinguishes a playing tone from unavailable spoken output. Alert playback has an explicit Stop control.

Installed local voices can be selected in sound settings. All speech uses a measured computer-style preset: rate 0.88, pitch 0.78, volume 0.8. These are system-voice parameters, not a clone of a performer. The supplied WAV/MP3 references were not embedded.

## Real audio changes (not just test changes)

- Normal event gain is 0.09 times each cue's authored volume, rather than 0.035. Per-cue values remain effective in both event and preview playback.
- Background-layer gain changed from 0.008 to 0.016 (twice the amplitude, about +6 dB), still off by default and ducked under events. Its preview uses that same primary background layer.
- Filtered-noise bandpass cues receive an 8x compensation for measured filter loss. Key-filter centres now follow their 2400/3000/3600/4200 Hz variants.
- Bed bases use their four declared pitches. Bed recipes gained a partial at four times their base frequency, including the preview-bank bed recipes. This is a real waveform change.
- Preview-only upward pitch shifting and flat gain were removed. Preview now uses the same pitch, gain, waveform and primary layer as the cue's ordinary playback.
- The Red alert preview is one bounded pulse of the same recipe used by the sustained manual alert. Preview does not start an indefinite alarm. Manual Red alert retains its play-until-stopped behavior.
- Fixed-order unity-gain mixing makes summation reproducible; buses disconnect when their sources finish. A short scheduling lead allows wiring to complete before playback.

## Measurement and reconciliation

**499 other audible recipes + 6 background recipes + 8 intentional silences = 513 catalogue entries.** The six backgrounds are included in the 505 audible total; they are not an extra six. Every catalogue ID appears once in the rendered rows and exactly one disjoint bucket.

The production scheduleCue path is rendered into OfflineAudioContext. renderInto defaults to normal playback, not preview; destination is explicitly passed through note into the offline graph. Each recipe is rendered separately as normal playback and preview. Six background measurements are also included and labelled. This measures synthesis, not device volume or what a person hears.

PCM hashing is explicit: mono Float32 samples, 48000 Hz, encoded little-endian; negative zero is normalized to positive zero and nonfinite samples are rejected. Raw hashes are retained as well. All event/preview pairs pass exact canonical PCM SHA-256 equality, with no amplitude tolerance. Three flagged recipes (map013/map030/map060) are self-rendered eight times and must produce one canonical hash each. Raw self-render hashes are retained for inspection.

Measured primary-playback peak range on the recorded Chrome version: 0.031384498–0.266565353. All 505 audible recipes exceed the 0.030 peak test floor; there is no unexpected silence, clipping, or preview more than three times louder than its normal primary playback. Quiet background results are recorded separately. This is not a cross-browser DSP bit-identity or psychoacoustic audibility guarantee.

## Regression scope

Separate scientific/export comparisons passed for IXO, EDS, EDT, RDML, CFX RDML and ZPCR. Decoded PCRD was not rerun without its test password; earlier locked-PCRD checks remain documented. Raw scientific records, calculated tables, profile identity, normalized exports and full font are unchanged. The source boundary check excludes only the four presentation modules; all other committed HTML is identical to 3fb21fd.

The complete preview bank, group/individual controls, acknowledgement gate/watchdog, context questions, exact unknown fallback, wake interruption, stable-number deduplication, sample/group checkbox feedback and loading pulse have dedicated Chrome tests. Native recognition and TTS control-flow tests use emulation; rendered synthesis tests use actual OfflineAudioContext processing.
