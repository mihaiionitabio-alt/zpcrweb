function mlCohortNote(c){
  const bits=[`${c.n} run(s) on ${c.instrument}`];
  if(c.protocol)bits.push(`protocol filter: ${c.protocol}`);
  if(c.baseFrom)bits.push(`baseline from ${c.baseFrom} (${c.droppedByBaseline} earlier run(s) excluded)`);
  else bits.push("no baseline date set, so the whole history is used");
  return mlNote("Cohort: "+bits.join(" · ")+".")
    +(c.mixed?mlWarn("This cohort mixes "+c.keys.length+" protocol/firmware/software combinations ("+c.keys.join("; ")+"). A shift between them is a change of equipment or method, not necessarily a change in the process; record the intervention rather than reading it as deterioration."):"");
}