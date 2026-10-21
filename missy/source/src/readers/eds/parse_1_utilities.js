/* ============================================================
   E. QuantStudio 3/5 .eds / .edt decoding (self-contained module)
   ============================================================ */
const EDS=(()=>{

/* ---------- small utilities ---------- */
const $=s=>document.querySelector(s);
const esc=v=>String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const num=v=>{const x=parseFloat(v);return Number.isFinite(x)?x:null};
const fmt=(v,d=3)=>v==null||!Number.isFinite(v)?"":(Math.abs(v)>=1e6||(Math.abs(v)<1e-3&&v!==0)?v.toExponential(3):(+v.toFixed(d)).toString());
const pill=(cls,t)=>`<span class="pill ${cls}">${esc(t)}</span>`;
const dt=ms=>{if(!ms||!isFinite(ms)||ms<=0)return "";const d=new Date(ms);const p=n=>String(n).padStart(2,"0");const o=-d.getTimezoneOffset(),tz=`UTC${o>=0?"+":"−"}${Math.abs(o)/60}`;return `${d.getFullYear()}-${p(d.getMonth()+1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())} ${tz}`};
const hex=u8=>Array.from(u8,b=>b.toString(16).padStart(2,"0")).join("");
const mean=a=>a.length?a.reduce((s,x)=>s+x,0)/a.length:null;
const sd=a=>{if(a.length<2)return null;const m=mean(a);return Math.sqrt(a.reduce((s,x)=>s+(x-m)**2,0)/(a.length-1))};
const ROWS="ABCDEFGHIJKLMNOP";
const wellPos=(i,cols)=>ROWS[Math.floor(i/cols)]+(i%cols+1);
function download(name,data,mime){
  const blob=data instanceof Blob?data:new Blob([data],{type:mime||"text/plain"});
  const a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download=name;
  document.body.appendChild(a);a.click();setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove()},1500);
}
const safeName=s=>String(s||"experiment").replace(/[^\w.\-]+/g,"_").slice(0,80);

/* ---------- CRC-32 ---------- */
const CRC_T=(()=>{const t=new Uint32Array(256);for(let n=0;n<256;n++){let c=n;for(let k=0;k<8;k++)c=c&1?0xEDB88320^(c>>>1):c>>>1;t[n]=c>>>0}return t})();
function crc32(u8){let c=0xFFFFFFFF;for(let i=0;i<u8.length;i++)c=CRC_T[(c^u8[i])&255]^(c>>>8);return (c^0xFFFFFFFF)>>>0}

