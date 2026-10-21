/* ---- thermal step response: plateaus → 10–90 % ramp rate, overshoot, settling, hold ---- */
function ccThermalSteps(t,y,setpoints,band=0.5,minHold=3){
  if(!t||t.length<10)return [];
  if(!setpoints||!setpoints.length){           // no protocol: find the plateaus the log itself shows
    const bins=new Map();
    for(let k=1;k<y.length;k++)if(Math.abs(y[k]-y[k-1])<0.15*(t[k]-t[k-1]||1)){const b=Math.round(y[k]);bins.set(b,(bins.get(b)||0)+1);}
    setpoints=[...bins].filter(([,c])=>c>=20).map(([b])=>b);
  }
  const plateaus=[];let cur=null;
  for(let k=0;k<y.length;k++){
    const sp=setpoints.find(s=>Math.abs(y[k]-s)<=band);
    if(cur&&sp===cur.sp){cur.end=k;continue;}
    if(cur&&t[cur.end]-t[cur.start]>=minHold)plateaus.push(cur);
    cur=sp===undefined?null:{sp,start:k,end:k};
  }
  if(cur&&t[cur.end]-t[cur.start]>=minHold)plateaus.push(cur);
  const out=[];
  for(let p=1;p<plateaus.length;p++){
    const A=plateaus[p-1],B=plateaus[p];if(A.sp===B.sp)continue;
    const up=B.sp>A.sp,x10=A.sp+0.1*(B.sp-A.sp),x90=A.sp+0.9*(B.sp-A.sp);
    let k10=null,k90=null,ext=up?-Infinity:Infinity;
    for(let k=A.end;k<=B.start;k++){
      if(k10===null&&(up?y[k]>=x10:y[k]<=x10))k10=k;
      if(k90===null&&(up?y[k]>=x90:y[k]<=x90))k90=k;
      if(k90!==null)ext=up?Math.max(ext,y[k]):Math.min(ext,y[k]);
    }
    if(k10===null||k90===null||t[k90]===t[k10])continue;
    const hold=y.slice(B.start,B.end+1),m=mean(hold);
    out.push({from:A.sp,to:B.sp,up,rate:Math.abs((y[k90]-y[k10])/(t[k90]-t[k10])),
      overshoot:Number.isFinite(ext)?Math.max(0,up?ext-B.sp:B.sp-ext):0,settling:t[B.start]-t[k90],
      offset:m-B.sp,sd:sd(hold)||0});
  }
  return out;
}
/* Peak ramp rate: the steepest 2-s slope inside every heating or cooling transition.
   It needs no plateau detection, so a short hold (e.g. 72 °C for 1 s, which the block
   passes through without settling) cannot merge two steps and halve the rate. */
/* ---- transition time A → B: seconds from leaving the band of setpoint A until first inside the band of setpoint B.
   Only transitions the run's own program asks for are counted (consecutive segments, the cycle wrap-around and program to
   program). Passing through another setpoint on the way (95 → 60 °C passes 72 °C) is ignored, so short holds such as
   72 °C for 1 s are still found. Segments the program ramps slowly on purpose (melt, programmed ramp < 1 °C/s) are left out. */
function ccTransitionPairs(run){
  const progs=((run.protocol||{}).programs||[]).filter(p=>(p.segments||[]).length),R=v=>Math.round(Number(v)*10)/10;
  const out=new Map(),add=(a,b)=>{if(!Number.isFinite(+a.target)||!Number.isFinite(+b.target))return;
    const A=R(a.target),B=R(b.target);if(Math.abs(A-B)<2)return;
    const sl=Number(b.slope);if(/cont/i.test(b.acqMode||"")||(Number.isFinite(sl)&&sl>0&&sl<1))return;
    out.set(`${A}→${B}`,{from:A,to:B});};
  progs.forEach((p,pi)=>{const s=p.segments;
    for(let i=0;i+1<s.length;i++)add(s[i],s[i+1]);
    if((+p.cycles||1)>1&&s.length>1)add(s[s.length-1],s[0]);
    if(pi>0){const q=progs[pi-1].segments;add(q[q.length-1],s[0]);}});
  return [...out.values()];
}
function ccTransitions(t,y,pairs,band=0.5){
  if(!t||t.length<10||!pairs.length)return null;
  /* edge crossings are interpolated between log samples: at 4.4 °C/s the LightCycler moves ≈ 1.8 °C between two
     samples, more than the ±0.5 °C band, so a sample-by-sample test would miss short passes through a target */
  const exp=new Set(pairs.map(p=>`${p.from}→${p.to}`)),targets=uniq(pairs.flatMap(p=>[p.from,p.to]));
  const inB=(v,s)=>Math.abs(v-s)<=band,at=(k,level)=>t[k-1]+(t[k]-t[k-1])*((level-y[k-1])/((y[k]-y[k-1])||1e-9));
  const got={};let prev=null,leave=NaN,cand=null;
  for(let k=0;k<y.length;k++){
    if(prev===null){const s0=targets.find(s=>inB(y[k],s));if(s0!==undefined){prev=s0;leave=t[k];}continue;}
    /* a hold at a temperature that is not the next programmed step (start of the run, pre-heat, manual pause):
       after 2 s in its band it becomes the new starting point, without recording a transition */
    if(cand){if(!inB(y[k],cand.s))cand=null;else if(t[k]-cand.since>=2){prev=cand.s;leave=t[k];cand=null;continue;}}
    if(inB(y[k],prev)){leave=t[k];}
    else if(k>0&&inB(y[k-1],prev)){leave=at(k,y[k]>prev?prev+band:prev-band);}    // left the band between two samples
    if(k===0)continue;
    const lo=Math.min(y[k-1],y[k]),hi=Math.max(y[k-1],y[k]);
    for(const s of targets){
      if(s===prev||inB(y[k-1],s)||hi<s-band||lo>s+band)continue;          // this segment enters the band of s
      const key=`${prev}→${s}`;if(!exp.has(key)){if(!cand||cand.s!==s)cand={s,since:t[k]};continue;}   // passing through, not a programmed step
      const edge=y[k-1]<s?s-band:s+band,tin=at(k,edge);
      if(Number.isFinite(leave)&&tin>leave)(got[key]=got[key]||[]).push(tin-leave);
      prev=s;leave=inB(y[k],s)?t[k]:tin;break;
    }
  }
  const o={};for(const [k,v] of Object.entries(got))if(v.length)o[k+" °C"]=ccMedian(v);
  return Object.keys(o).length?o:null;
}
/* thin a trace for display, keeping the minimum and the maximum of every slice (in time order): plain decimation
   drops overshoots and 1-s holds and makes the cycles look uneven */
function ccThin(t,y,slices){
  if(t.length<=2*slices)return {seconds:t.slice(),temp:y.slice()};
  const per=t.length/slices,ts=[],ys=[];
  for(let k=0;k<slices;k++){const a=Math.floor(k*per),b=Math.min(t.length,Math.floor((k+1)*per));let lo=a,hi=a;
    for(let i=a;i<b;i++){if(y[i]<y[lo])lo=i;if(y[i]>y[hi])hi=i;}
    for(const i of lo<hi?[lo,hi]:lo>hi?[hi,lo]:[lo]){ts.push(t[i]);ys.push(y[i]);}}
  return {seconds:ts,temp:ys};
}
function ccPeakRates(t,y,win=2,min=1){
  const up=[],dn=[];let j=0,cur=null;
  for(let i=0;i<t.length;i++){
    while(t[i]-t[j]>win)j++;
    const s=i>j?(y[i]-y[j])/(t[i]-t[j]):0,d=s>min?1:s<-min?-1:0;
    if(d&&(!cur||cur.d!==d)){if(cur)(cur.d>0?up:dn).push(cur.m);cur={d,m:Math.abs(s)};}
    else if(d)cur.m=Math.max(cur.m,Math.abs(s));
    else if(cur){(cur.d>0?up:dn).push(cur.m);cur=null;}
  }
  if(cur)(cur.d>0?up:dn).push(cur.m);
  const med=a=>{const v=a.slice().sort((p,q)=>p-q);return v.length?v[Math.floor(v.length/2)]:NaN;};
  return {heat:med(up),cool:med(dn),nUp:up.length,nDown:dn.length};
}
function ccThermalSummary(steps,peaks){
  const med=a=>{const v=a.filter(Number.isFinite).sort((p,q)=>p-q);return v.length?v[Math.floor(v.length/2)]:NaN;};
  const pk=peaks||{};
  if(!steps.length)return {heat_rate:pk.heat,cool_rate:pk.cool};
  const top=Math.max(...steps.map(s=>s.to));
  return {heat_rate:pk.heat,cool_rate:pk.cool,
    overshoot:med(steps.filter(s=>s.up&&s.to===top).map(s=>s.overshoot)),
    settling:med(steps.filter(s=>s.up&&s.to===top).map(s=>s.settling))};
}
function ccSetpoints(run){
  const v=((run.protocol||{}).programs||[]).flatMap(p=>(p.segments||[]).map(s=>Number(s.target))).filter(x=>x>20&&x<110);
  return uniq(v.map(x=>Math.round(x*10)/10));
}

