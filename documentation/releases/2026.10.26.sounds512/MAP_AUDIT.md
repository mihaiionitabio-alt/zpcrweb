# Supplied 300-row map audit

This register distinguishes the supplied proposal from implemented automatic triggers. Retaining a cue in the preview bank is not evidence that its proposed event detector exists. The final catalogue also includes the legacy 99 cues and a general control-feedback palette, totalling 512 choices.

| Map row | Proposed action | Audit status | Cue | Correction |
|---|---|---|---|---|
| 1 | wake word `computer` / `missy` matched | existing-cue | voiceAcknowledge |  |
| 2 | bare wake word, awaiting command | preview-only-unverified-event | map002 |  |
| 3 | command matched in grammar | preview-only-unverified-event | map003 |  |
| 4 | command not in grammar | preview-only-unverified-event | map004 |  |
| 5 | command incomplete, `Please specify` | preview-only-unverified-event | map005 |  |
| 6 | `#missy-console-voice-controls` ▶ start | existing-cue | voiceStart |  |
| 7 | `#missy-console-voice-controls` ■ stop | existing-cue | voiceStop |  |
| 8 | listening time limit reached | existing-cue | voiceTimeLimit |  |
| 9 | microphone permission blocked | existing-cue | voicePermission |  |
| 10 | `en-US` pack download begins (`setup`) | existing-cue | packInstalling |  |
| 11 | `en-US` pack ready | existing-cue | packReady |  |
| 12 | recognition result discarded by 400 ms debounce | silent | map012 | Current recognizer uses 700 ms stability and per-result deduplication, not the obsolete 400 ms description. |
| 13 | page parse begins | preview-only-unverified-event | map013 |  |
| 14 | startup stage 01 of 05 passes | preview-only-unverified-event | map014 |  |
| 15 | startup stage 02 of 05 passes | preview-only-unverified-event | map015 |  |
| 16 | startup stage 03 of 05 passes | preview-only-unverified-event | map016 |  |
| 17 | startup stage 04 of 05 passes | preview-only-unverified-event | map017 |  |
| 18 | startup stage 05 of 05 passes | preview-only-unverified-event | map018 |  |
| 19 | `[READY] Initialization complete` | existing-cue | ready |  |
| 20 | `[DATA] No experiment files read` | preview-only-unverified-event | map020 |  |
| 21 | boot log line appended | preview-only-unverified-event | map021 |  |
| 22 | boot log scrolled by operator | preview-only-unverified-event | map022 |  |
| 23 | MISSY logo clicked, entering setup | existing-cue | enter |  |
| 24 | `#language-select` changed | existing-cue | language |  |
| 25 | `Download offline HTML` pressed | preview-only-unverified-event | map025 |  |
| 26 | `Enter workspace` pressed | existing-cue | workspaceEnter |  |
| 27 | `Back to loading screen` pressed | existing-cue | workspaceBack |  |
| 28 | `Session setup` reopened from status bar | mapped-control-request | map028 |  |
| 29 | `#missy-forget-password` pressed | mapped-control-request | map029 |  |
| 30 | workspace idle, no files, 60 s | preview-only-unverified-event | map030 |  |
| 31 | `#tab-load` · 1 Load files | existing-cue | loadPage |  |
| 32 | `#tab-sop` · 2 SOP | existing-cue | sopPage |  |
| 33 | `#tab-results` · 3 Results | existing-cue | resultsPage |  |
| 34 | `#tab-panel` · 4 Control panel | existing-cue | panelPage |  |
| 35 | `#tab-graphs` · 5 Graphs | existing-cue | graphsPage |  |
| 36 | `#tab-review` · 6 Quality & forensic review | existing-cue | reviewPage |  |
| 37 | `#tab-export` · 7 Open formats | existing-cue | formatsPage |  |
| 38 | `#tab-integrity` · 8 File integrity | existing-cue | logs |  |
| 39 | tab change while a long render is pending | preview-only-unverified-event | map039 |  |
| 40 | tab blocked — nothing loaded | preview-only-unverified-event | map040 |  |
| 41 | `#review-tabs` sub-tab change | existing-cue | reviewOverview |  |
| 42 | `#statusbar` `Details` expanded | preview-only-unverified-event | map042 |  |
| 43 | `#statusbar` `Details` collapsed | preview-only-unverified-event | map043 |  |
| 44 | `#sb-toggle` command bar opened | preview-only-unverified-event | map044 |  |
| 45 | `#sb-toggle` command bar closed | preview-only-unverified-event | map045 |  |
| 46 | `#missy-public-license` opened | preview-only-unverified-event | map046 |  |
| 47 | `mgOpen()` — console opens | existing-cue | consoleOpen |  |
| 48 | `mgClose()` — console closes | existing-cue | consoleClose |  |
| 49 | console key 0 pressed | preview-only-unverified-event | map049 |  |
| 50 | console key 1 pressed | preview-only-unverified-event | map050 |  |
| 51 | console key 2 pressed | preview-only-unverified-event | map051 |  |
| 52 | console key 3 pressed | preview-only-unverified-event | map052 |  |
| 53 | console key 4 pressed | preview-only-unverified-event | map053 |  |
| 54 | console key 5 pressed | preview-only-unverified-event | map054 |  |
| 55 | console key 6 pressed | preview-only-unverified-event | map055 |  |
| 56 | console key 7 pressed | preview-only-unverified-event | map056 |  |
| 57 | console key 8 pressed | preview-only-unverified-event | map057 |  |
| 58 | console key 9 pressed | preview-only-unverified-event | map058 |  |
| 59 | console keys 10–15 pressed | preview-only-unverified-event | map059 |  |
| 60 | `#mg-sheet` opens | preview-only-unverified-event | map060 |  |
| 61 | `mgSheetClose()` | preview-only-unverified-event | map061 |  |
| 62 | `mgSheetPick()` — option chosen | preview-only-unverified-event | map062 |  |
| 63 | `#sb-command` · Command mode | existing-cue | commandOpen |  |
| 64 | `#sb-console` · Console mode | existing-cue | consoleOpen |  |
| 65 | `#sb-assist` · Assisted mode | existing-cue | assistedOpen |  |
| 66 | `#cmd-in` command submitted | preview-only-unverified-event | map066 |  |
| 67 | `#cmd-script-run` script executed | mapped-control-request | map067 |  |
| 68 | `mg-focus` entered — chrome hidden | silent | map068 | Transient cues and ambience mute in focus; explicit manual Red alert keeps playing until stopped, preserving user authorization. |
| 69 | `#drop` dragenter | preview-only-unverified-event | map069 |  |
| 70 | `#drop` dragleave | silent | map070 |  |
| 71 | file dropped on `#drop` | preview-only-unverified-event | map071 |  |
| 72 | `#file` chooser opened | preview-only-unverified-event | map072 |  |
| 73 | `#read` · Read the files | existing-cue | working |  |
| 74 | each file staged (`stageReaderFile`) | preview-only-unverified-event | map074 |  |
| 75 | `.ixo` decoded | preview-only-unverified-event | map075 |  |
| 76 | `.eds` decoded | preview-only-unverified-event | map076 |  |
| 77 | `.edt` decoded | preview-only-unverified-event | map077 |  |
| 78 | `.rdml` decoded | preview-only-unverified-event | map078 |  |
| 79 | `.zpcr` decoded | preview-only-unverified-event | map079 |  |
| 80 | `.pcrd` encrypted, reported and skipped | preview-only-unverified-event | map080 | PCRD may be unlocked; encryption alone is not evidence that a file was skipped. |
| 81 | `.zip` archive opened | preview-only-unverified-event | map081 |  |
| 82 | archive member filtered out | silent | map082 |  |
| 83 | archive file-count limit reached | preview-only-unverified-event | map083 |  |
| 84 | archive byte limit reached | preview-only-unverified-event | map084 |  |
| 85 | CRC mismatch on a member | preview-only-unverified-event | map085 |  |
| 86 | unsupported compression method | preview-only-unverified-event | map086 |  |
| 87 | unsafe archive path rejected | preview-only-unverified-event | map087 |  |
| 88 | all files read, `#readmsg` success | existing-cue | loaded |  |
| 89 | intake finished with errors | preview-only-unverified-event | map089 |  |
| 90 | `#csvread` · Read pasted values | mapped-control-request | map090 |  |
| 91 | `#csvfilebtn` · Upload a CSV instead | mapped-control-request | map091 |  |
| 92 | `#csvdemo` · worked example loaded | mapped-control-request | map092 |  |
| 93 | `Clear experiments` pressed | preview-only-unverified-event | map093 |  |
| 94 | clear confirmed, runs discarded | preview-only-unverified-event | map094 |  |
| 95 | `#sop-preset` profile selected | existing-cue | profileSelect |  |
| 96 | `#sop-apply-preset` · Use this starting point | existing-cue | affirmative |  |
| 97 | `#sop-open` · Open profile (JSON) | existing-cue | profileOpen |  |
| 98 | profile JSON parsed and valid | preview-only-unverified-event | map098 |  |
| 99 | profile JSON rejected | preview-only-unverified-event | map099 |  |
| 100 | `#sop-json-apply` · Apply JSON | mapped-control-request | map100 |  |
| 101 | `#sop-save` · Save profile (JSON) | existing-cue | profileSave |  |
| 102 | `#sop-dl-zip` · SOP bundle (ZIP) | existing-cue | resultBundle |  |
| 103 | `#sop-dl-xlsx` · SOP report (XLSX) | existing-cue | resultWorkbook |  |
| 104 | `#sop-dl-csv` · SOP tables (CSV) | existing-cue | resultCSV |  |
| 105 | `#sop-lock` locked | existing-cue | profileLock |  |
| 106 | `#sop-lock` unlocked | existing-cue | profileLock |  |
| 107 | profile hash recomputed | preview-only-unverified-event | map107 |  |
| 108 | `#sop-next` · next criterion | mapped-control-request | map108 |  |
| 109 | `#sop-prev` · previous criterion | mapped-control-request | map109 |  |
| 110 | `#sop-add-found` · Add a row for every target | mapped-control-request | map110 |  |
| 111 | `#sop-targets` row added | preview-only-unverified-event | map111 |  |
| 112 | `#sop-targets` row deleted | preview-only-unverified-event | map112 |  |
| 113 | `#sop-search` pattern edited | silent | map113 |  |
| 114 | profile not applicable to the run | preview-only-unverified-event | map114 |  |
| 115 | run acceptance evaluated, all pass | preview-only-unverified-event | map115 |  |
| 116 | run acceptance evaluated, failures | preview-only-unverified-event | map116 |  |
| 117 | `#mara-input-import` · Import method inputs | mapped-control-request | map117 |  |
| 118 | `#mara-input-export` · Export method inputs | mapped-control-request | map118 |  |
| 119 | `Download all MARA profiles (ZIP)` | preview-only-unverified-event | map119 |  |
| 120 | `#mara-decision-rules` expanded | preview-only-unverified-event | map120 |  |
| 121 | `#experiment-melting-rules` expanded | preview-only-unverified-event | map121 |  |
| 122 | `#sop-outcome` interpretation changed by operator | existing-cue | resultsFiltered | sop-outcome filters displayed results; it does not edit an interpretation. |
| 123 | `#sop-results` rendered | preview-only-unverified-event | map123 |  |
| 124 | `#ss-edit` · Edit sample selection | mapped-control-request | map124 |  |
| 125 | `#ss-select` · Select all matching | mapped-control-request | map125 |  |
| 126 | `#ss-unselect` · Unselect all matching | mapped-control-request | map126 |  |
| 127 | `#ss-enable` scope toggled | mapped-control-request | map127 |  |
| 128 | `#ss-apply` · Apply selection and analyse | mapped-control-request | map128 |  |
| 129 | `#ss-cancel` · Cancel edits | mapped-control-request | map129 |  |
| 130 | `#ss-next` page | mapped-control-request | map130 |  |
| 131 | `#ss-prev` page | mapped-control-request | map131 |  |
| 132 | `#ss-group` · Group unusual names | mapped-control-request | map132 |  |
| 133 | `#ss-names-enable` pseudonymisation on | mapped-control-request | map133 |  |
| 134 | `#ss-names-enable` pseudonymisation off | preview-only-unverified-event | map134 |  |
| 135 | `#ss-names-sensitivity` changed | mapped-control-request | map135 |  |
| 136 | sample marked repeat by the profile | preview-only-unverified-event | map136 |  |
| 137 | sample undetermined | preview-only-unverified-event | map137 |  |
| 138 | sample positive | preview-only-unverified-event | map138 |  |
| 139 | sample negative | preview-only-unverified-event | map139 |  |
| 140 | cycle-limit sentinel detected in a Cq field | preview-only-unverified-event | map140 |  |
| 141 | `#derived-run` changed | mapped-control-request | map141 |  |
| 142 | `Stored vs re-derived Ct` opened | preview-only-unverified-event | map142 |  |
| 143 | re-derived value differs from stored | preview-only-unverified-event | map143 |  |
| 144 | `#cmp-a` / `#cmp-b` comparison pair set | mapped-control-request | map144 |  |
| 145 | `Sample comparison` rendered | preview-only-unverified-event | map145 |  |
| 146 | `#stat-rep-limit` changed | mapped-control-request | map146 |  |
| 147 | `Statistics` recomputed | preview-only-unverified-event | map147 |  |
| 148 | `Recompute` pressed | preview-only-unverified-event | map148 |  |
| 149 | `#g-graph` graph selected | existing-cue | graphSelected |  |
| 150 | `#g-run` run changed | mapped-control-request | map150 |  |
| 151 | `#g-target` target changed | existing-cue | targetSelected |  |
| 152 | `#g-metric` metric changed | mapped-control-request | map152 |  |
| 153 | `#g-signal` signal layer changed | existing-cue | signalSelected | Current g-signal exposes stored and drn. Seven layer names are not inferred. |
| 154 | `detector_counts` layer selected | preview-only-unverified-event | map154 |  |
| 155 | `dark_corrected` layer selected | preview-only-unverified-event | map155 |  |
| 156 | `spectrally_unmixed` layer selected | preview-only-unverified-event | map156 |  |
| 157 | `reference_normalized` layer selected | preview-only-unverified-event | map157 |  |
| 158 | `baseline_corrected` layer selected | preview-only-unverified-event | map158 |  |
| 159 | `smoothed` layer selected | preview-only-unverified-event | map159 |  |
| 160 | `negative_first_derivative` layer selected | preview-only-unverified-event | map160 |  |
| 161 | `#g-log` log scale toggled | existing-cue | logDisplay |  |
| 162 | `#g-level` threshold moved | silent | map162 | g-level is a fluorescence-level selector, not a draggable threshold. |
| 163 | threshold released | preview-only-unverified-event | map163 |  |
| 164 | `#g-colourby` grouping changed | existing-cue | colourDisplay |  |
| 165 | chart render starts | preview-only-unverified-event | map165 |  |
| 166 | chart render completes | preview-only-unverified-event | map166 |  |
| 167 | chart render exceeds 3 s | preview-only-unverified-event | map167 |  |
| 168 | point beyond the SOP limit drawn | preview-only-unverified-event | map168 |  |
| 169 | `#g-dl-png` · Save as PNG | existing-cue | graphPNG |  |
| 170 | `#g-dl-svg` · Save as SVG | existing-cue | graphSVG |  |
| 171 | `#g-dl-csv` · Download chart data (CSV) | existing-cue | graphCSV |  |
| 172 | `#g-dl-all` · All graphs, all runs (ZIP) | existing-cue | graphBundle |  |
| 173 | `Amplification curves` opened | preview-only-unverified-event | map173 |  |
| 174 | `Plate heat map` opened | preview-only-unverified-event | map174 |  |
| 175 | `Plate map` opened | preview-only-unverified-event | map175 |  |
| 176 | `Run timeline` opened | preview-only-unverified-event | map176 |  |
| 177 | `Background and plateau` opened | preview-only-unverified-event | map177 |  |
| 178 | `Reset view` / `Restore defaults` | preview-only-unverified-event | map178 |  |
| 179 | `#cc-inst` instrument changed | mapped-control-request | map179 |  |
| 180 | `#cc-proto` protocol scope changed | mapped-control-request | map180 |  |
| 181 | `#cc-type` chart type changed | mapped-control-request | map181 |  |
| 182 | `#cc-variant` variant changed | mapped-control-request | map182 |  |
| 183 | `#cc-x` x axis changed | mapped-control-request | map183 |  |
| 184 | `#cc-filter` filter applied | preview-only-unverified-event | map184 |  |
| 185 | chart computed | preview-only-unverified-event | map185 |  |
| 186 | point outside the control limits | preview-only-unverified-event | map186 |  |
| 187 | run of points on one side of centre | preview-only-unverified-event | map187 |  |
| 188 | `#cc-rebase` · Start a new baseline | mapped-control-request | map188 |  |
| 189 | `#cc-reset` · Reset this chart to defaults | mapped-control-request | map189 |  |
| 190 | `#cc-remember` preference stored | mapped-control-request | map190 |  |
| 191 | `#cc-import` history imported (JSON) | mapped-control-request | map191 |  |
| 192 | `#cc-export` history exported (JSON) | mapped-control-request | map192 |  |
| 193 | `#cc-export-csv` history exported (CSV) | mapped-control-request | map193 |  |
| 194 | `#cc-csv` · Data (CSV) | mapped-control-request | map194 |  |
| 195 | `#cc-png` · chart PNG | mapped-control-request | map195 |  |
| 196 | `#cc-svg` · chart SVG | mapped-control-request | map196 |  |
| 197 | `#cc-zip` · All control charts (ZIP) | mapped-control-request | map197 |  |
| 198 | `#cc-zip-png` · All chart images (ZIP) | mapped-control-request | map198 |  |
| 199 | `#cc-ml` advisory layer opened | mapped-control-request | map199 |  |
| 200 | `#cc-ml` advisory produced a note | preview-only-unverified-event | map200 | No alarm is inferred merely from opening an advisory layer. |
| 201 | `Block temperature — LightCycler` opened | preview-only-unverified-event | map201 |  |
| 202 | `Block, cover and zones — QuantStudio` opened | preview-only-unverified-event | map202 |  |
| 203 | `#review-overview` opened | existing-cue | reviewOverview |  |
| 204 | `#review-runs` · Runs and QC | existing-cue | reviewRuns |  |
| 205 | `#review-curves` opened | existing-cue | reviewCurves |  |
| 206 | `#review-plate` opened | existing-cue | reviewPlate |  |
| 207 | `#review-rising` · Rising curves without result | existing-cue | reviewRising |  |
| 208 | `#open-rising-review` opened | mapped-control-request | map208 |  |
| 209 | `#review-instrument` · Instrument records | existing-cue | reviewInstrument |  |
| 210 | `#review-statistics` opened | existing-cue | reviewStatistics |  |
| 211 | `#review-compare` opened | existing-cue | reviewCompare |  |
| 212 | `#issue-overview` grouped problems opened | mapped-control-request | map212 |  |
| 213 | `#issue-category` changed | mapped-control-request | map213 |  |
| 214 | `#issue-all-runs` scope widened | mapped-control-request | map214 |  |
| 215 | `#issue-clear-runs` scope cleared | mapped-control-request | map215 |  |
| 216 | forensic event, severity info | preview-only-unverified-event | map216 |  |
| 217 | forensic event, severity warning | preview-only-unverified-event | map217 |  |
| 218 | forensic event, severity error | preview-only-unverified-event | map218 |  |
| 219 | acquisition interrupted in the record | preview-only-unverified-event | map219 |  |
| 220 | firmware change detected in the record | preview-only-unverified-event | map220 |  |
| 221 | `#control-category-editor` opened | preview-only-unverified-event | not added as a separate choice |  |
| 222 | `#reset-control-categories` pressed | mapped-control-request | map222 |  |
| 223 | `#dl-rising-csv` / `#dl-rising-png` | mapped-control-request | map223 |  |
| 224 | `#dl-review-all` · Review tables (ZIP) | mapped-control-request | map224 |  |
| 225 | `#dl-curves-csv` · Download curves (CSV) | mapped-control-request | map225 |  |
| 226 | `#dl-curves-png` · Combined rising curves (PNG) | mapped-control-request | map226 |  |
| 227 | `#dl-plate-csv` · Plate map (CSV) | mapped-control-request | map227 |  |
| 228 | `#dl-plate-png` · Plate map (PNG) | mapped-control-request | map228 |  |
| 229 | `#dl-derived` · Derived values (CSV) | existing-cue | derivedTable |  |
| 230 | `#dl-derived-all` · For all runs (CSV) | existing-cue | allDerivedTables |  |
| 231 | `#dl-statistics` · Statistics (CSV) | mapped-control-request | map231 |  |
| 232 | `#dl-compare` · Comparison (CSV) | mapped-control-request | map232 |  |
| 233 | `#dl-runs` · Runs and forensic log (CSV) | mapped-control-request | map233 |  |
| 234 | `#dl-instrument` · Instrument records (ZIP) | mapped-control-request | map234 |  |
| 235 | `#dl-issue-overview` · Grouped problems (CSV) | mapped-control-request | map235 |  |
| 236 | `#dl-lj-csv` / `#dl-lj-png` | mapped-control-request | map236 |  |
| 237 | `#dl-temp-png` · Temperature chart (PNG) | mapped-control-request | map237 |  |
| 238 | `#dl-metadata` · Dataset metadata (JSON-LD) | mapped-control-request | map238 |  |
| 239 | `#dl-pseudo-map` · Pseudonym mapping (CSV) | mapped-control-request | map239 | Mapping download request uses a distinct attention cue; no actual privacy judgment is inferred. |
| 240 | `#dl-integrity` · File-integrity list (CSV) | mapped-control-request | map240 |  |
| 241 | `#dl-py` · Download Python script | mapped-control-request | map241 |  |
| 242 | `#dl-r` · Download R script | mapped-control-request | map242 |  |
| 243 | `#dl-site` / `#missy-source-download` | mapped-control-request | map243 |  |
| 244 | `Download HTML source` | preview-only-unverified-event | not added as a separate choice |  |
| 245 | `#prev-py` / `#prev-r` preview shown | mapped-control-request | map245 |  |
| 246 | `#sb-save` · Save status report | existing-cue | statusSave |  |
| 247 | `#diag-save` · Save diagnostics (JSON) | mapped-control-request | map247 |  |
| 248 | `#diag-refresh` · Refresh diagnostics | mapped-control-request | map248 |  |
| 249 | export blocked — nothing to write | preview-only-unverified-event | not added as a separate choice |  |
| 250 | export produced an empty file | preview-only-unverified-event | not added as a separate choice |  |
| 251 | download suppressed by the browser | preview-only-unverified-event | not added as a separate choice |  |
| 252 | any export completes | preview-only-unverified-event | not added as a separate choice | Browser download completion is not established by a click; automatic completion cue remains unbound. |
| 253 | `#integrity-summary` computed | preview-only-unverified-event | not added as a separate choice |  |
| 254 | all files match their stored checksum | preview-only-unverified-event | not added as a separate choice |  |
| 255 | one file fails its checksum | preview-only-unverified-event | not added as a separate choice |  |
| 256 | archive integrity comparison fails | preview-only-unverified-event | not added as a separate choice |  |
| 257 | no stored checksum present in a file | preview-only-unverified-event | not added as a separate choice |  |
| 258 | `#integrity-list` row expanded | preview-only-unverified-event | not added as a separate choice |  |
| 259 | manifest hash recomputed | preview-only-unverified-event | not added as a separate choice |  |
| 260 | declared byte length disagrees with the file | preview-only-unverified-event | not added as a separate choice |  |
| 261 | duplicate identifier found | preview-only-unverified-event | not added as a separate choice |  |
| 262 | reference does not resolve | preview-only-unverified-event | not added as a separate choice |  |
| 263 | content identity recomputed and matches | preview-only-unverified-event | not added as a separate choice |  |
| 264 | content identity differs from declared | preview-only-unverified-event | not added as a separate choice |  |
| 265 | two archives resolve to the same content | preview-only-unverified-event | not added as a separate choice |  |
| 266 | declared source name differs from container | preview-only-unverified-event | not added as a separate choice |  |
| 267 | demo started | existing-cue | demoBegin |  |
| 268 | `Next / 下一步` | mapped-control-request | map268 |  |
| 269 | `Previous / 上一步` | mapped-control-request | map269 |  |
| 270 | `Pause / 暂停` | existing-cue | demoPlayback |  |
| 271 | resume from pause | existing-cue | demoPlayback |  |
| 272 | chapter card appears | preview-only-unverified-event | not added as a separate choice |  |
| 273 | `LOOK HERE / 看这里` callout appears | preview-only-unverified-event | not added as a separate choice |  |
| 274 | callout dismissed | preview-only-unverified-event | not added as a separate choice |  |
| 275 | lesson changed in the selector | mapped-control-request | map275 |  |
| 276 | step time changed | mapped-control-request | map276 |  |
| 277 | `Pointer motion` toggled | mapped-control-request | map277 |  |
| 278 | artificial file staged | preview-only-unverified-event | not added as a separate choice |  |
| 279 | artificial evidence read | preview-only-unverified-event | not added as a separate choice |  |
| 280 | final step of a lesson reached | preview-only-unverified-event | not added as a separate choice |  |
| 281 | `Exit demo / 退出演示` | existing-cue | demoExit |  |
| 282 | demo auto-advance tick | silent | map282 |  |
| 283 | workspace idle 60 s, nothing loaded | opt-in-background | map283 |  |
| 284 | workspace idle, runs loaded | opt-in-background | map284 |  |
| 285 | Graphs view idle | opt-in-background | map285 |  |
| 286 | Control panel view idle | opt-in-background | map286 |  |
| 287 | long render in progress > 3 s | opt-in-background | map287 |  |
| 288 | intake in progress | opt-in-background | map288 |  |
| 289 | random idle blip, 20–45 s interval | preview-only-unverified-event | not added as a separate choice |  |
| 290 | random idle blip, variant | preview-only-unverified-event | not added as a separate choice |  |
| 291 | random idle blip, variant | preview-only-unverified-event | not added as a separate choice |  |
| 292 | random idle blip, variant | preview-only-unverified-event | not added as a separate choice |  |
| 293 | memory above the soft limit | preview-only-unverified-event | not added as a separate choice |  |
| 294 | fault recorded while idle | preview-only-unverified-event | not added as a separate choice |  |
| 295 | `#sb-faults` count increments | preview-only-unverified-event | not added as a separate choice |  |
| 296 | `#sb-state` phase changes to busy | preview-only-unverified-event | not added as a separate choice |  |
| 297 | `#sb-state` phase returns to ready | preview-only-unverified-event | not added as a separate choice |  |
| 298 | `#sb-progress` crosses 25 / 50 / 75 % | preview-only-unverified-event | not added as a separate choice |  |
| 299 | tab hidden (`visibilitychange`) | silent | map299 |  |
| 300 | tab visible again | preview-only-unverified-event | not added as a separate choice |  |
