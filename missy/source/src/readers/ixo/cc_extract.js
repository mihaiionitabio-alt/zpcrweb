/* ============================================================
   C1. Control charts — data extraction
   ------------------------------------------------------------
   Everything here reads numbers the instrument already wrote into its
   own file. Nothing is simulated. Each extractor returns plain numbers,
   so one small "row" per run can be kept in an instrument history file
   and charted without reloading the original run files.
   LC = LightCycler 480 (.ixo), QS = QuantStudio 3/5 (.eds)
   ============================================================ */

/* ---- LC: TemperatureLog arrays ("LARZ" uint32 ms, "DARZ" float64 °C) ----
   13-byte header; the payload is either raw or LZSS-compressed
   (4096-byte ring buffer, 18-byte maximum match, 1 = literal flag bit). */
function ccLzss(src,o){
  const N=4096,F=18,TH=2,ring=new Uint8Array(N).fill(32),out=[];let r=N-F,flags=0;
  while(o<src.length){
    flags>>=1;
    if(!(flags&0x100))flags=src[o++]|0xff00;
    if(o>=src.length)break;
    if(flags&1){const c=src[o++];out.push(c);ring[r]=c;r=(r+1)&(N-1);}
    else{
      if(o+1>=src.length)break;
      const i=src[o]|((src[o+1]&0xf0)<<4),len=(src[o+1]&0x0f)+TH;o+=2;
      for(let k=0;k<=len;k++){const c=ring[(i+k)&(N-1)];out.push(c);ring[r]=c;r=(r+1)&(N-1);}
    }
  }
  return Uint8Array.from(out);
}
function ccDecodeArz(b64){
  /* "DARZ" (float64) / "LARZ" (uint32) + a header whose length varies between files (12 or 13 bytes seen), then the values,
     raw or LZSS-compressed. Every candidate start is tried and the one whose whole array is plausible wins
     (temperatures −50…200 °C, times never decreasing). A wrong start gives garbage such as 1e+102 °C. */
  const b=base64ToBytes(b64.trim()),isD=b[0]===0x44,size=isD?8:4;
  const read=u=>{const dv=new DataView(u.buffer,u.byteOffset,u.byteLength),n=Math.floor(u.length/size),o=new Float64Array(n);
    for(let k=0;k<n;k++)o[k]=isD?dv.getFloat64(k*size,true):dv.getUint32(k*size,true);return o;};
  const score=a=>{if(a.length<2)return -1;let ok=0;for(let i=0;i<a.length;i++){const v=a[i];
    if(isD?(Number.isFinite(v)&&v>-50&&v<200&&Math.abs(v)>1e-6):(i===0||v>=a[i-1]))ok++;}return ok/a.length;};
  let best=null,bs=-1;
  for(const off of [13,12,14,11,15,10,16])for(const a of [read(b.subarray(off)),read(ccLzss(b,off))]){
    const sc=score(a);if(sc>bs+1e-9){bs=sc;best=a;}if(bs>=0.999)return best;}
  return best||new Float64Array(0);
}
function ccIxoTemperatureLog(text){
  const blk=(text.match(/name="TemperatureLog"[\s\S]*?<\/obj>/)||[""])[0];
  const t=(blk.match(/name="Times">([^<]+)</)||[])[1],v=(blk.match(/name="Temps">([^<]+)</)||[])[1];
  if(!t||!v)return null;
  const ms=ccDecodeArz(t),temp=ccDecodeArz(v),n=Math.min(ms.length,temp.length),sec=[],y=[];let bad=0;
  for(let k=0;k<n;k++){const tt=ms[k]/1000,yy=temp[k];                     // drop any point that is still implausible
    if(Number.isFinite(yy)&&yy>-50&&yy<200&&(!sec.length||tt>sec[sec.length-1])){sec.push(tt);y.push(yy);}else bad++;}
  return sec.length>10?{seconds:sec,temp:y,dropped:bad}:null;
}
/* ---- LC: one record per fluorescence reading (time, block temperature, channel,
   integration time, valid flag, lamp reference channel) from the AcquisitionStore ---- */
async function ccIxoAcquisitions(text){
  const m=text.match(/name="AcquisitionStore"[^>]*>([^<]+)</);if(!m)return [];
  const inner=new TextDecoder().decode(await inflate(base64ToBytes(m[1].trim()),"deflate"));
  const out=[],re=/name="Time">(\d+)<\/prop>\s*<prop name="Temp">\$?([0-9A-Fa-f.]+)<\/prop>\s*<prop name="Channel">(\d+)<\/prop>\s*<prop name="IntgrTime">(\d+)<\/prop>\s*<prop name="Valid">(\d+)<\/prop>\s*<prop name="RefValue">\$?([0-9A-Fa-f.]+)</g;
  const dbl=h=>/^[0-9A-Fa-f]{16}$/.test(h)?hexBEToDouble(h):Number(h);
  let r;while((r=re.exec(inner)))out.push({ms:+r[1],temp:dbl(r[2]),channel:+r[3],intgr:+r[4],valid:r[5]==="1",ref:dbl(r[6])});
  return out;
}

