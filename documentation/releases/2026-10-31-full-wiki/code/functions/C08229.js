function selApplyCsv(text){
  const lines=String(text||"").split(/\r?\n/).filter(l=>l.trim().length);
  if(!lines.length)return {applied:0,unknown:[],rows:0};
  const split=l=>{const out=[];let cur="",q=false;
    for(let i=0;i<l.length;i++){const c=l[i];
      if(q){if(c==='"'){if(l[i+1]==='"'){cur+='"';i++;}else q=false;}else cur+=c;}
      else if(c==='"')q=true;else if(c===","){out.push(cur);cur="";}else cur+=c;}
    out.push(cur);return out;};
  const head=split(lines[0]).map(h=>h.trim().toLowerCase());
  const iId=head.indexOf("id"),iInc=head.indexOf("include");
  if(iId<0||iInc<0)throw new Error('the file needs an "id" column and an "include" column');
  const scopeIndex=head.indexOf("figure_scope"),runIndex=head.indexOf("figure_run");
  if(scopeIndex>=0){const settings=lines.slice(1).map(split),scopes=new Set(settings.map(r=>r[scopeIndex]).filter(Boolean)),runs=new Set(settings.map(r=>r[runIndex]).filter(Boolean));if(scopes.size>1||runs.size>1)throw Error("Conflicting figure scope in selection CSV");const scope=[...scopes][0],ri=[...runs][0];if(scope&&!['all','selected'].includes(scope))throw Error("Invalid figure scope");if(ri!=null&&(!/^\d+$/.test(ri)||+ri>=RUNS.length))throw Error("Invalid figure run");if(scope)SEL_STATE.figureScope=scope;if(ri!=null)SEL_STATE.run=+ri;}
  const known=new Set(selCatalogue().map(x=>x.id));
  const unknown=[];let applied=0,rows=0;
  lines.slice(1).forEach(l=>{
    const f=split(l);if(f.length<=Math.max(iId,iInc))return;
    const id=f[iId].trim(),inc=/^(y|yes|true|1|x)$/i.test(f[iInc].trim());
    if(!id)return;rows++;
    if(!known.has(id)){unknown.push(id);return;}
    if(inc)SEL_STATE.ids.add(id);else SEL_STATE.ids.delete(id);
    applied++;
  });
  return {applied,unknown,rows};
}