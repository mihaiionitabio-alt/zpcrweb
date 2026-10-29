# MISSY training controls, rewards and completion record

Build 2026.10.29.learning3 fixes the training-specific controls and evidence display without changing readers, scientific calculations or normal scientific exports.

## Interaction

The parent training header owns the single visible microphone control bar. The child MISSY document suppresses its voice widgets before they can flash and never starts a second recognizer. Exiting training stops the training recognizer and restores the normal control position. Recognition still requires a compatible browser and its local English pack; typed commands need no microphone or language pack.

Every lesson includes a Type a command box and Run command button; Enter runs the same handler used by spoken game commands. Examples: `open evidence`, `value 33`, `answer one`, `Computer, select well a one`, `select point 27`, `confirm`, `next`, `hint`. Chinese typed aliases include 打开证据、数值 33、答案 1、选择孔位 A1、确认、下一步. Recognition of Chinese speech is not claimed. Unrecognised typed commands get a visible response.

Sentinel lessons now use MISSY's native Quality & forensic review → Plate map menus, experiment selector, stored-Cq colouring and selectable well cells. Menu steps are numbered and outlined. Occupied-well lessons use the same native plate; standard lessons use normal Results filters, and melting lessons use the Tm-results column of the loaded-experiment table. The two integrity-manifest cases remain clearly labelled supplemental training exhibits. No custom lookalike table replaces the plate map.

## Reward feedback

Each correctly completed lesson awards 100 points once. Repeated Confirm events neither add points nor create duplicate attempts. A short original three-tone Web Audio cue accompanies a lavender/orange base-pair sequence animation. Reward sound can be switched off. No franchise recording, actor voice, audio download or new encoded sound asset is used.

The reward has a reserved, in-flow area in the training sidebar, below the answer buttons. It cannot cover native menus, charts or the plate. Desktop checks cover English and Chinese at 1280, 1536 and 1920 pixels; all relevant final-cycle plate positions remain visible. Timing is not scored.

## Completion PDF

After all 24 lessons are correct, the completion panel offers Download training PDF and editable report-only investigator/laboratory fields, prefilled from the identity entered before training. These fields do not rewrite the real session's laboratory profile.

The PDF includes the identity, all questions, submitted answers, reference answers, rules, optional reasoning, every attempt, per-step score, total score and one retained workspace image per lesson. It includes UTC start/end timestamps, a chronological session timeline and monotonic durations displayed as HH:MM:SS.mmm. The session time includes loading and pauses; it freezes at the last correct answer, not at the later download.

Workspace images are locally rendered from the actual training document by pinned html2canvas 1.4.1 (MIT), not native OS captures; unsupported browser drawing details can differ. The package SHA-512 integrity was checked, the source-map link removed and the complete MIT licence embedded inline. No screenshot service or external runtime resource is used. The existing PDF writer and full embedded Unicode font are reused unchanged. Images remain in the temporary training session until the user explicitly downloads the PDF. Navigation is briefly held while an image is captured so an answer cannot acquire an image from a different lesson.

This is a learning record on artificial data, not competency certification, identity authentication, instrument validation or laboratory release authorisation.

## Verification

- All 24 lessons completed in both languages with the browser context offline; 24 retained images and completion download in each language.
- Both PDFs: 25 rendered pages, 24 embedded images, correct test identity, total score and build version extracted; all pages visually reviewed.
- Typed command flow, number words, native well selection, original reward cue energy, monotonic time and no duplicate reward checked.
- Stubbed local-recognizer `onresult` events exercise the real recognition handler, including duplicate-final suppression and stopping on exit. No physical microphone or recognition-quality claim.
- Native mouse/keyboard selection, clean re-entry and an already-loaded parent's scientific/export snapshot remain unchanged.
- Separate IXO, EDS, EDT, generic RDML, CFX RDML and ZPCR before/after scientific/result/export snapshots match. PCRD locked/cancel path matches; decrypted PCRD regression was not run without a password. All reader, chart calculation, SOP, normal export and full-font source files remain byte-identical.
