/* ============================================================
   1. Generic helpers
   ============================================================ */
function clone(v){return JSON.parse(JSON.stringify(v));}
function esc(s){return String(s??"").replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));}
function xesc(s){return String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&apos;"}[c]));}
function safeName(s){return String(s||"artifact").replace(/[^\w.-]+/g,"_").replace(/^_+|_+$/g,"")||"artifact";}
function bytesFrom(data){return data instanceof Uint8Array?data:(typeof data==="string"?textEncoder.encode(data):new Uint8Array(data));}
function scrollToEl(el,block){if(el&&typeof el.scrollIntoView==="function")el.scrollIntoView({behavior:"smooth",block:block||"start"});}
function option(value,text,selected){const o=ce("option");o.value=value;o.textContent=text;o.selected=!!selected;return o;}
function num(v,d=2){return Number.isFinite(v)?v.toFixed(d):"";}
function safeRe(p,flags="i"){try{return new RegExp(p,flags);}catch(e){return null;}}
function uniq(a){return [...new Set(a)];}
function byKey(arr,fn){const m=new Map();for(const x of arr){const k=fn(x);if(!m.has(k))m.set(k,[]);m.get(k).push(x);}return m;}

