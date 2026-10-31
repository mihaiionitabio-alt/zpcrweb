function maraSyncControlNames(p=SOP){
 for(const c of p.controls||[]){if(!['pos-qual-qc','pos-quant-qc'].includes(c.id))continue;
  const event=p.control_identity?.event||p.method.selected_event||'',pct=c.id==='pos-quant-qc'&&p.analyticalRole==='quantification'?p.calibrator?.certified_content_percent:c.id==='pos-qual-qc'?p.control_identity?.positive_percent:p.comparison?.control_content_percent;
  c.event=event;c.content_percent=pct??'';c.name=event?event+' · '+(pct!==''&&pct!=null?pct+' %':'% (not declared)'):'Positive control · event and content not declared';
 }
}