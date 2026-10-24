# MISSY 2026.10.25.browsercursor1

## Changes
- Early, ES5-compatible bilingual Internet Explorer / Edge IE-mode warning. It replaces the unusable application view when document.documentMode is present; no redirect or network dependency.
- Guided-demo pointer enlarged to 38 x 46 CSS pixels, with a persistent contrasting ring.
- Pointer movement takes 1.2 seconds; demonstration clicks wait 1.4 seconds before activating the existing action.
- A bilingual Pointer motion switch follows the operating-system reduced-motion preference initially. The user may explicitly enable pointer movement without enabling other reduced-motion effects. No preference is saved to the real workspace.
- Each highlighted target establishes a rendered starting position before movement, so transitions remain observable after hidden cues and lesson changes.

## Validation
- All 30 lessons at the recording's 1365 x 953 desktop viewport, normal motion and reduced motion with explicit pointer-motion override. Intermediate coordinates verify actual gradual movement; final cursor bounds stay within the demo viewport. Motion can also be switched off.
- Bilingual IE message: documentMode 9 / 11 simulated in Chromium; normal Chromium startup unaffected. Guard also parsed/executed in Windows JScript with a minimal DOM stub. This is not an actual Internet Explorer rendering test.
- Workspace entry EN/ZH and Console voice/focus regression passed (recognition emulated).
- Offline demo navigation/autoplay, title cards and reduced-motion title behavior passed.
- Seven direct file-format regression groups passed independently: IXO 10 sources/10 views; EDS 2/2; EDT 1/1; RDML 3/7; CFX RDML 24/38; ZPCR 7/7; PCRD 27/27. Scientific results, export rows and normalized RDML match the established precision1 baseline.
- Four builder tests passed.
- Full Chinese 30-lesson workflow passed, including artificial report generation, voice/alarm actions and unchanged parent storage/data.

## Boundary
Only four source modules changed: the new browser guard, its startup include, guided_demo.js and mission_theme.css. Readers, calculations, interpretation/results code, exporters and the full font were unchanged. The build remains a single offline HTML file.

The supplied recorder files contain viewport/navigation plus 11 clicks, and are reference evidence rather than executed instructions. Testing used their viewport and the current guided-demo workflow.
