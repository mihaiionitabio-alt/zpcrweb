function maraControlMatches(c,w,p){
 if(sopMatcher(c.match)(String(c.matchBy==='role'?w.role||'':w.sample||'')))return true;
 const primary=(p.analyticalRole==='identification'&&c.id==='pos-qual-qc')||((p.analyticalRole==='quantification'||p.method.standard_number===16)&&c.id==='pos-quant-qc');
 if(!primary)return false;
 const event=p.control_identity?.event,pct=p.analyticalRole==='quantification'?p.calibrator?.certified_content_percent:p.method.standard_number===16?p.comparison?.control_content_percent:p.control_identity?.positive_percent;
 if(!event||pct===''||pct==null)return false;
 const escape=s=>String(s).replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
 return new RegExp('^'+escape(event)+'(?:\\s+|\\s*·\\s*)'+escape(pct)+'\\s*%$','i').test(String(w.sample||''));
}