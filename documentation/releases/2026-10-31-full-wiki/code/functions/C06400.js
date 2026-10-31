function graphAnalysisControl(w){
  const name=String(w&&w.sample||"");
  const role=String(w&&w.role||"");
  const byRole=/^(NTC|Blank|Negative control)$/i.test(role);
  const byName=/\b(NTC|no\s*template|blank|H2O|water)\b/i.test(name);
  return byRole||byName;
}