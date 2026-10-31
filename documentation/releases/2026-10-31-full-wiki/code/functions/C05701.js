function sopNoProfile(){
  const p=sopBase();p.name="No SOP selected";p.version="1.0";p.assay="";p.reviewOnly=true;p.evaluationMode="unconfigured";
  p.notes="Select a SOP profile before interpreting experiment results.";p.targets=[];p.controls=[];
  p.replicates={min:"",positiveMin:"",partialOutcome:"Inconclusive",maxSd:"",sdOutcome:"Repeat"};
  p.ic={referenceCq:"",maxShift:"",shiftOutcome:"Inconclusive",missingOutcome:"Invalid"};
  Object.assign(p.run,{minR2:"",effMin:"",effMax:"",minLogs:"",ntcGap:"",maxZoneSpread:""});return p;
}