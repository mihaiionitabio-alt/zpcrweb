/* ============================================================
   A2. Sample roles
   ------------------------------------------------------------
   The decoder already carries the instrument's own sample type
   (QuantSampleTypeProperty -> instrRole). That is authoritative when it is set,
   because it is what the operator entered in the Sample Editor. Many routine
   runs leave every well as "Unknown", so the sample name is used as a fallback
   - and only as a fallback, since a name is a label and a sample type is a
   declaration. Where the two disagree the instrument wins and the disagreement
   is recorded, so it can be reported rather than silently resolved.
   ============================================================ */
const NAME_ROLE_RULES=[
  {role:"NTC",             re:/\b(ntc|no\s*template|blank\s*pcr|h2o|water)\b/i},
  {role:"Blank",           re:/\b(blank|ebc|extraction\s*blank)\b/i},
  {role:"Negative control",re:/\b(neg(ative)?(\s*control)?|nc|cn|nk)\b/i},
  {role:"Positive control",re:/\b(pos(itive)?(\s*control)?|pc|pk)\b/i},
  {role:"Calibrator",      re:/\b(cal(ibrator)?|crm|erm)\b/i},
  {role:"Standard",        re:/\b(std|standard|s[1-9]\b)/i}
];
function roleFromName(name){
  const s=String(name||"");
  for(const r of NAME_ROLE_RULES)if(r.re.test(s))return r.role;
  return "Unknown";
}
function assignRoles(runs){
  runs.forEach(run=>{
    const touch=w=>{
      const byInstrument=w.instrRole||"";
      const byName=roleFromName(w.sample);
      w.roleInstrument=byInstrument;
      w.roleName=byName;
      /* The instrument's types are coarse: a no-template control and a matrix
         negative are both written as qsNegative. Where the name is more
         specific WITHIN the same family, the name refines the type rather than
         contradicting it - and the distinction matters, because an NTC must be
         silent in every analysis while a matrix negative must still amplify for
         a reference gene. Outside the family the instrument still wins. */
      const refine=byInstrument&&byName!=="Unknown"
        &&NEGATIVE_FAMILY.includes(byInstrument)&&NEGATIVE_FAMILY.includes(byName)
        &&byInstrument!==byName;
      w.role=refine?byName:(byInstrument&&byInstrument!=="Unknown"?byInstrument:byName);
      w.roleSource=refine?"instrument sample type, refined by the name"
        :(byInstrument&&byInstrument!=="Unknown"?"instrument sample type":"sample name");
      w.roleDisagrees=!!(byInstrument&&byInstrument!=="Unknown"&&byName!=="Unknown"
        &&byInstrument!==byName
        &&!(NEGATIVE_FAMILY.includes(byInstrument)&&NEGATIVE_FAMILY.includes(byName)));
    };
    run.wells.forEach(touch);
    (run.tmWells||[]).forEach(touch);
  });
  return runs;
}

