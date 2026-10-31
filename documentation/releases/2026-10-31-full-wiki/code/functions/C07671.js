function issueCategoryOf(e){
  const text=(`${e&&e.area||""} ${e&&e.finding||""} ${e&&e.evidence||""}`).toLowerCase();
  if(/contaminat|assay control|no-template|ntc|blank|positive control|calibrator/.test(text))return "Controls / contamination";
  if(/amplif|curve|rising|channel assignment|detection format|stored result|analysis membership|signal/.test(text))return "Amplification / curve shape";
  if(/integrity|acquisition|sample role|file|archive|checksum|container/.test(text))return "File / structure";
  if(/sop|stored call|uncertain|replicate|interpret/.test(text))return "SOP / result interpretation";
  if(/timeline|traceability|batch|copied data|duplicate name/.test(text))return "Timing / traceability";
  return "Other";
}