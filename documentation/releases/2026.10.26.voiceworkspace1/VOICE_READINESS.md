# Evaluated voice phrases

122 supplied phrases: 44 working information/action routes (including existing handlers), 10 explicit boundary responses, 68 recognized but not yet backed by a verified binding. No illustrative example values are used.

| Phrase after Computer or Missy | Route | State |
|---|---|---|
| where am i | `q:where` | Working route; answer depends on available data |
| what can i do here | `q:help` | Working route; answer depends on available data |
| what views are there | `q:views` | Working route; answer depends on available data |
| where is pseudonymisation | `q:privacy` | Working route; answer depends on available data |
| what build is this | `q:build` | Working route; answer depends on available data |
| what time is it | `f:clock` | Working route; answer depends on available data |
| how long have you been open | `f:uptime` | Working route; answer depends on available data |
| this is doctor ionita | `guard:1 · Orientation and session` | Not implemented: explicit limitation |
| who is the operator | `q:operator` | Working route; answer depends on available data |
| what language are you speaking | `q:lang` | Working route; answer depends on available data |
| how many files | `f:files` | Working route; answer depends on available data |
| list the files | `f:listfiles` | Working route; answer depends on available data |
| what formats do you read | `q:formats` | Working route; answer depends on available data |
| read the files | `guard:2 · Files and intake` | Not implemented: explicit limitation |
| is there a problem with the files | `guard:2 · Files and intake` | Not implemented: explicit limitation |
| which file failed | `o:fault` | Working route; answer depends on available data |
| why was that file skipped | `o:fault` | Working route; answer depends on available data |
| how big is the largest file | `guard:2 · Files and intake` | Not implemented: explicit limitation |
| when were these files read | `guard:2 · Files and intake` | Not implemented: explicit limitation |
| are any files duplicated | `guard:2 · Files and intake` | Not implemented: explicit limitation |
| clear the experiments | `guard:2 · Files and intake` | Not implemented: explicit limitation |
| confirm | `guard:2 · Files and intake` | Not implemented: explicit limitation |
| how many runs | `q:counts` | Working route; answer depends on available data |
| identify run 3 | `o:identify run:3` | Working route; answer depends on available data |
| bracket the dates | `o:dates` | Working route; answer depends on available data |
| how many instruments | `guard:3 · Runs and identity` | Not implemented: explicit limitation |
| are these runs comparable | `guard:3 · Runs and identity` | Not implemented: explicit limitation |
| which run is newest | `guard:3 · Runs and identity` | Not implemented: explicit limitation |
| which run is oldest | `guard:3 · Runs and identity` | Not implemented: explicit limitation |
| how long did run 3 take | `guard:3 · Runs and identity` | Not implemented: explicit limitation |
| what protocol was used | `guard:3 · Runs and identity` | Not implemented: explicit limitation |
| next run | `nav:next run` | Working route; answer depends on available data |
| how many samples | `f:samples` | Working route; answer depends on available data |
| list the samples | `f:listsamples` | Working route; answer depends on available data |
| locate sample demo_sample_7 | `o:locate sample:demo_sample_7` | Working route; answer depends on available data |
| identify | `guard:4 · Samples and wells` | Not implemented: explicit limitation |
| read this well | `guard:4 · Samples and wells` | Not implemented: explicit limitation |
| which sample is this | `guard:4 · Samples and wells` | Not implemented: explicit limitation |
| compare b7 with b8 | `guard:4 · Samples and wells` | Not implemented: explicit limitation |
| are these replicates acceptable | `guard:4 · Samples and wells` | Not implemented: explicit limitation |
| which well amplified first | `guard:4 · Samples and wells` | Not implemented: explicit limitation |
| which well is the outlier | `guard:4 · Samples and wells` | Not implemented: explicit limitation |
| how many wells are empty | `guard:4 · Samples and wells` | Not implemented: explicit limitation |
| show me the positives | `guard:4 · Samples and wells` | Not implemented: explicit limitation |
| what targets are loaded | `guard:5 · Targets and channels` | Not implemented: explicit limitation |
| request all information on hmg | `o:request all information on:hmg` | Working route; answer depends on available data |
| which target is the reference | `guard:5 · Targets and channels` | Not implemented: explicit limitation |
| what channels were collected | `guard:5 · Targets and channels` | Not implemented: explicit limitation |
| compare fam with hex | `guard:5 · Targets and channels` | Not implemented: explicit limitation |
| is channel 4 noisy | `guard:5 · Targets and channels` | Not implemented: explicit limitation |
| what dye is on this channel | `guard:5 · Targets and channels` | Not implemented: explicit limitation |
| which targets are missing a reference | `guard:5 · Targets and channels` | Not implemented: explicit limitation |
| read the results | `guard:6 · Results and outcomes` | Not implemented: explicit limitation |
| summarise the run | `guard:6 · Results and outcomes` | Not implemented: explicit limitation |
| which samples should i repeat | `guard:6 · Results and outcomes` | Not implemented: explicit limitation |
| why was that flagged | `guard:6 · Results and outcomes` | Not implemented: explicit limitation |
| how many undetermined | `guard:6 · Results and outcomes` | Not implemented: explicit limitation |
| is there a problem | `f:report` | Working route; answer depends on available data |
| what is the problem | `f:report` | Working route; answer depends on available data |
| is there any indication of inhibition | `refuse:cause` | Boundary response |
| calculate the mean cq | `guard:6 · Results and outcomes` | Not implemented: explicit limitation |
| what is the efficiency | `guard:6 · Results and outcomes` | Not implemented: explicit limitation |
| compare stored against re-derived | `guard:6 · Results and outcomes` | Not implemented: explicit limitation |
| are these results validated | `refuse:validation` | Boundary response |
| check the controls | `guard:7 · Controls and acceptance` | Not implemented: explicit limitation |
| did the no-template control pass | `guard:7 · Controls and acceptance` | Not implemented: explicit limitation |
| did any control fail | `guard:7 · Controls and acceptance` | Not implemented: explicit limitation |
| what does the profile require | `guard:7 · Controls and acceptance` | Not implemented: explicit limitation |
| is the run acceptable | `guard:7 · Controls and acceptance` | Not implemented: explicit limitation |
| which profile is active | `q:profile` | Working route; answer depends on available data |
| does this profile apply | `guard:7 · Controls and acceptance` | Not implemented: explicit limitation |
| lock the profile | `guard:7 · Controls and acceptance` | Not implemented: explicit limitation |
| what changed in the profile | `guard:7 · Controls and acceptance` | Not implemented: explicit limitation |
| how many standards | `guard:7 · Controls and acceptance` | Not implemented: explicit limitation |
| chart seventeen | `chart:17` | Working route; answer depends on available data |
| which chart is this | `guard:8 · Charts and graphs` | Not implemented: explicit limitation |
| describe this chart | `q:analyse` | Working route; answer depends on available data |
| how many outliers | `q:analyse` | Working route; answer depends on available data |
| are there any alarms | `q:analyse` | Working route; answer depends on available data |
| is everything normal | `q:analyse` | Working route; answer depends on available data |
| why has this chart no limits | `q:analyse` | Working route; answer depends on available data |
| what is the magnification | `o:zoom` | Working route; answer depends on available data |
| zoom in | `nav:zoom in` | Working route; answer depends on available data |
| reset the view | `nav:zoom reset` | Working route; answer depends on available data |
| next chart | `nav:chart next` | Working route; answer depends on available data |
| white background | `theme:light` | Working route; answer depends on available data |
| show the amplification curves | `guard:8 · Charts and graphs` | Not implemented: explicit limitation |
| which curve is steepest | `guard:8 · Charts and graphs` | Not implemented: explicit limitation |
| check the integrity | `guard:9 · Integrity and provenance` | Not implemented: explicit limitation |
| verify this file | `guard:9 · Integrity and provenance` | Not implemented: explicit limitation |
| what is the hash | `guard:9 · Integrity and provenance` | Not implemented: explicit limitation |
| has anything changed | `guard:9 · Integrity and provenance` | Not implemented: explicit limitation |
| where did this run come from | `guard:9 · Integrity and provenance` | Not implemented: explicit limitation |
| was this reanalysed | `guard:9 · Integrity and provenance` | Not implemented: explicit limitation |
| access the run log | `o:log` | Working route; answer depends on available data |
| read the last event | `guard:9 · Integrity and provenance` | Not implemented: explicit limitation |
| save the status report | `guard:10 · Export and privacy` | Not implemented: explicit limitation |
| export the results | `guard:10 · Export and privacy` | Not implemented: explicit limitation |
| download the plate map | `guard:10 · Export and privacy` | Not implemented: explicit limitation |
| export the metadata | `guard:10 · Export and privacy` | Not implemented: explicit limitation |
| pseudonymise the names | `guard:10 · Export and privacy` | Not implemented: explicit limitation |
| download the mapping | `guard:10 · Export and privacy` | Not implemented: explicit limitation |
| download the offline copy | `guard:10 · Export and privacy` | Not implemented: explicit limitation |
| what will the export contain | `guard:10 · Export and privacy` | Not implemented: explicit limitation |
| status report | `f:report` | Working route; answer depends on available data |
| full report | `f:fullreport` | Working route; answer depends on available data |
| run a diagnostic | `guard:11 · Faults, diagnostics and state` | Not implemented: explicit limitation |
| run diagnostic on module readers | `o:run diagnostic on module:readers` | Working route; answer depends on available data |
| explanation for malfunction | `o:fault` | Working route; answer depends on available data |
| are there any faults | `o:fault` | Working route; answer depends on available data |
| memory status | `f:memory` | Working route; answer depends on available data |
| what are you doing | `q:status` | Working route; answer depends on available data |
| freeze | `guard:11 · Faults, diagnostics and state` | Not implemented: explicit limitation |
| resume | `guard:11 · Faults, diagnostics and state` | Not implemented: explicit limitation |
| override the profile | `o:override` | Boundary response |
| change this result to negative | `refuse:result` | Boundary response |
| delete this run | `refuse:delete` | Boundary response |
| is this sample contaminated | `refuse:cause` | Boundary response |
| has the instrument failed | `refuse:hardware` | Boundary response |
| what will happen next month | `refuse:forecast` | Boundary response |
| which instrument is best | `refuse:rank` | Boundary response |
| approve this run for release | `refuse:release` | Boundary response |
