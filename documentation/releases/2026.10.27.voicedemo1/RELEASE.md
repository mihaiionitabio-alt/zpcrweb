# MISSY voice-command workflow demo - 2026.10.27.voicedemo1

A second loading-screen button, **Voice commands / 语音命令**, sits next to the original Guided demo. The original 30-lesson demo remains intact. Both demos use disposable iframes with isolated in-memory preferences; the voice demo also shows session setup and its real form before the workspace.

## Delivered workflow

The second demo contains 69 steps: 55 executable voice-command utterances and 14 clearly labelled scripted actions/narration, in three chapters. It proceeds from the loading page and fictional session identity through intake, profile setup, results, control charts, optical drift, an incomplete baseline, amplification, plate mapping, review, export scope, integrity, Command and Assisted modes, and actual PDF generation. Unimplemented production voice bindings for file selection, profile editing and report creation are explicitly shown as scripted actions, not falsely promoted as supported voice commands.

Data is generated first: 32 artificial run views, 768 stored result rows, three actual Repeat groups, one actual Control fail group, four flagged primary-cohort optical points, and a separate two-run cohort with an unready control baseline. The synthetic protocol and instrument metadata are explicit. A fixed virtual clock reads 26 October 2026 at 10:00 UTC, prominently identified as a demonstration clock. Analytic waveforms use no random-number generator. None of these are laboratory records or device qualification evidence.

Every executable command is preflighted against MISSY_CONSOLE_VOICE.interpret/ask. Its actual returned English and Chinese answer is captured, checked against the engine's actual fallback constants in both locales, and used for dialogue and subtitles. No illustrative numbers from the request were transcribed into answers. Lists use one record per spoken page in this voice-demo sandbox, with real Computer more commands; ordinary workspace paging remains eight entries. Persistent artificial-data labels remain on the interactive demo and MP4. The research-use, cause-inference, rule-override and release-approval boundaries appear near the report chapter.

## Audio, timing and video

138 original generated MP3 clips are embedded directly in the HTML: one operator clip and one MISSY clip per step. Build-time installed offline English Windows SAPI voices were resolved by language and role, not a hard-coded voice-name dependency. This build uses distinct David and Zira voices with fixed role rates/pitches. A one-voice fallback is explicit if a future build lacks a second voice. No film recording, actor imitation, cloud TTS, external audio URL, microphone or language-pack download is used for demo playback. Normal live voice recognition retains its existing browser/pack requirements.

The operator speaks before the action executes; MISSY's recorded answer plays after the live answer is produced. Exact English/Chinese answer comparisons stop playback if the live demo and baked recording diverge. Pause/play, previous/next, lesson selection, dialogue mute and actual PDF preview are available. Replaying earlier steps reconstructs the isolated synthetic session rather than reusing stale loaded state. Manual alarm generation uses the existing sound engine; the MP4 mixes that same rendered recipe at the recorded alert interval at a reduced level for dialogue clarity.

The final MP4 is **859.15 seconds (14:19.15)**, with three chapter markers. Its longest actual step is **26.976 seconds**. Four response clips exceed 20 seconds; none exceeds the 30-second step cap. The untrimmed browser capture includes 48.81 seconds of idle PDF-transfer/teardown footage; only that idle tail was removed. Dialogue samples and clip-start timestamps are recorded in the manifests. English/Chinese subtitle segments align to those clip boundaries; intra-utterance line splits are proportional, not phoneme-forced alignment.

DIALOGUE_MANIFEST records each utterance, intent, actual bilingual answer, planned start/duration, voice settings and MP3 hashes. VIDEO_MANIFEST adds actual operator/reply timestamps, video/audio hashes and both exact local-build and normalized publication-build SHA-256 values. The hash methods are explicit. Fixed data/clock/script/voice settings and tool versions support reproducible review; cross-machine or browser-bit-identical video is not claimed.

## Validation

- Strict script preflight passes all 69 steps with nonempty audio and verified intent bindings. Both English and Chinese fallback constants and visible fallback locales are tested.
- All 138 MP3 clips decode to nonempty, non-silent finite samples and progress through real HTMLAudioElement playback in offline Chrome. No device speaker-volume or microphone/transcription accuracy claim is made.
- The complete live workflow capture has zero page errors and zero external page requests. Its actual 8-page PDF is 6,595,717 bytes. Parent loaded runs and saved preferences are unchanged after exit.
- The final MP4 fully decodes; seven representative encoded frames were inspected. All eight PDF pages were rendered and visually inspected. Existing Poppler installation emitted font-substitution configuration warnings, but the rendered pages showed no clipped or overlapping content.
- The original 30-lesson demo passes, including its six drifting runs, report creation and voice/alarm controls.
- IXO, EDS, EDT, RDML, CFX RDML and ZPCR pass separate read-only voice and independent cross-version scientific/export regressions. Decoded PCRD was not rerun without its decoder key; its reader is unchanged.

## Preservation and small voice corrections

Readers, scientific formulas, stored calls/results, export implementations, existing sound synthesis and full PDF font coverage remain unchanged. The normal typed-question helper now returns the actual view acknowledgement after a successful numbered action instead of leaving a stale prior answer; the underlying numeric command action remains unchanged. Who am I aliases the existing investigator-field response. Report/control wording is shorter without changing its assessment or data basis; rule/source identifiers remain in the structured status findings. The new data and profile additions are conditional on the voice-demo flag and never affect laboratory runs or the first demo.

The app is still **one offline HTML file**, approximately 18.7 MB including the new dialogue. The MP4 and subtitle/manifest files are optional separate viewing artifacts, not runtime dependencies.
