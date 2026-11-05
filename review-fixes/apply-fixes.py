from pathlib import Path
import re
ROOT=Path(__file__).resolve().parents[1]
HELPER="""function sopDecisionOutcome(value,fallback,current){
  if(value==="flag")return current||fallback;
  return SOP_OUTCOMES.includes(value)?value:fallback;
}
function sopOutcomeRank(value){
  const order=["Invalid run","Invalid","Control fail","Repeat","Inconclusive","Positive","Negative","Control pass","Standard","Not interpreted"];
  const i=order.indexOf(value);return i<0?order.length:i;
}
"""
def patch(s):
 if 'function sopDecisionOutcome(' not in s:s=s.replace('function sopEvaluateRunBase(run,ri){',HELPER+'function sopEvaluateRunBase(run,ri){').replace('function sopEvaluateRun(run,ri){\n',HELPER+'function sopEvaluateRun(run,ri){\n')
 old='  const icMedian=icCqs.length?icCqs.slice().sort((a,b)=>a-b)[Math.floor(icCqs.length/2)]:NaN;'
 new=old+"\n  const icMedians=new Map();\n  pre.filter(g=>g.spec.kind===\"ic\"&&!g.ctrl&&g.role!==\"Standard\"&&Number.isFinite(g.cqMean)).forEach(g=>{if(!icMedians.has(g.target))icMedians.set(g.target,[]);icMedians.get(g.target).push(g.cqMean);});\n  icMedians.forEach((v,k)=>{v.sort((a,b)=>a-b);icMedians.set(k,v[Math.floor(v.length/2)]);});\n  pre.forEach(g=>{g.icMedian=icMedians.get(g.target)??NaN;});"
 if 'const icMedians=new Map()' not in s:s=s.replace(old,new)
 s=s.replace('Number.isFinite(icMedian)&&Number.isFinite(r.cqMean)&&r.cqMean-icMedian','Number.isFinite(r.icMedian)&&Number.isFinite(r.cqMean)&&r.cqMean-r.icMedian')
 s=s.replace('shifted[0].cqMean-icMedian','shifted[0].cqMean-shifted[0].icMedian')
 s=s.replace('Number.isFinite(icMedian)&&g.cqMean-icMedian','Number.isFinite(g.icMedian)&&g.cqMean-g.icMedian').replace('num(g.cqMean-icMedian,2)','num(g.cqMean-g.icMedian,2)')
 s=s.replace('SOP.ic.missingOutcome||"Invalid"','sopDecisionOutcome(SOP.ic.missingOutcome,"Invalid")').replace('SOP.ic.shiftOutcome||"Inconclusive"','sopDecisionOutcome(SOP.ic.shiftOutcome,"Inconclusive")').replace('rep.partialOutcome||"Inconclusive"','sopDecisionOutcome(rep.partialOutcome,"Inconclusive")').replace('g.spec.lateOutcome||"Inconclusive"','sopDecisionOutcome(g.spec.lateOutcome,"Inconclusive",outcome)')
 s=s.replace('outcome=rep.sdOutcome;','outcome=sopDecisionOutcome(rep.sdOutcome,"Repeat",outcome);')
 s=s.replace('order.indexOf(a)-order.indexOf(b)','sopOutcomeRank(a)-sopOutcomeRank(b)').replace('order.indexOf(x.outcome)-order.indexOf(y.outcome)','sopOutcomeRank(x.outcome)-sopOutcomeRank(y.outcome)')
 s=s.replace('run_median:ev.icMedian','run_median:r.icMedian')
 s=s.replace('const cid="pc"+(++SVG_CLIP_N);','const cid="pc"+svgClipKey(o);')
 if 'function svgClipKey(' not in s:s=s.replace('let SVG_CLIP_N=0;',"""let SVG_CLIP_N=0; // retained for compatibility; no longer determines export bytes
function svgClipKey(o){
  const text=JSON.stringify(o);let a=2166136261,b=5381;
  for(let i=0;i<text.length;i++){a=Math.imul(a^text.charCodeAt(i),16777619);b=((b<<5)+b)^text.charCodeAt(i);}
  return (a>>>0).toString(16)+(b>>>0).toString(16);
}""")
 return s
if __name__=='__main__':
 p=ROOT/'index.html';s=p.read_text(encoding='utf-8');s=patch(s);s=s.replace('<meta name="missy-publication-version" content="2026.10.31.demolabels1">','<meta name="missy-publication-version" content="2026.11.05.reviewfix1">');p.write_text(s,encoding='utf-8',newline='\n')
