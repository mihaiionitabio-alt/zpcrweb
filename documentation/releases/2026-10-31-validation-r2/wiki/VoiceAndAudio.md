# Voice and audio

Say **Computer** or **Missy**, then finish the command. The workflow distinguishes a wake cue, completion of the command, acknowledgement/restatement and the data-backed answer. Navigation has its own confirmation cue. Repeated recognition events must not repeat an action.

Examples: “Computer, show chart two”; “Computer, next graph”; “Computer, status report”; “Computer, is there a problem?” Answers depend on loaded evidence. Unsupported causal claims and release approval must be refused.

The current index contains **122 command-registry entries**, **221 recorded English phrases** and **515 sound-catalogue entries**. These are different units: aliases, recorded speech and sound cues are not interchangeable counts. Some sound entries are deliberate silence/background paths.

The interface is bilingual, but the embedded recorded speech bank is English. Selecting Chinese does not translate these recordings. Dynamic speech also depends on locally installed voices. Microphone use and an offline language pack depend on browser capabilities. Typed commands provide an alternative in training.

Headless emulation checks routing and state transitions; it does not prove recognition accuracy with a real microphone or what an operator hears through speakers. Per-asset audio licensing must be reviewed separately from the source-code licence.

Download pseudonymisation does not govern speech. Spoken answers can contain identifiers regardless of the download setting and can be heard or recorded. Headphones do not make speech subject to that setting.

## Embedded asset accounting

The frozen HTML contains 221 audio/mpeg data URIs totalling 10,858,473 decoded bytes and 14,478,272 Base64 characters. See AUDIO_ASSET_REGISTER.json for every asset hash and location. Encoding metadata alone cannot establish which tool or source produced a recording. Exact hash matching links 194 clips to preserved creation records and a script selecting Microsoft Zira Desktop through Windows SAPI. The other clips are not thereby attributed. Applicable voice redistribution rights remain an open check; no clean-licensing claim is made. The sound catalogue is `window.MISSY_COMPUTER_SOUND.catalog` (515 entries); this differs from recorded phrase counts.
