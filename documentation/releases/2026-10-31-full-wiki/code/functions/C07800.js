function mountInteractiveCurvePlot(host,rows,opts){
  if(!host||!rows.length)return false;
  opts=opts||{};
  const normalize=!!opts.normalize, colour=opts.colour||((w)=>curveColour(w,opts.mode||"outcome"));
  const label=opts.label||((w)=>graphHoverLabel(w.experiment||w.run||"",w,w.target||w.analysis||""));
  const list=rows.slice(0,120),W=1100,H=470,L=72,R=24,T=30,B=54;
  const transformed=[];
  list.forEach(w=>{
    const source=w.curve.map(v=>Number.isFinite(v)?(!normalize&&opts.log&&v>0?Math.log10(v):v):null),finite=source.filter(Number.isFinite),mn=finite.length?Math.min(...finite):0,mx=finite.length?Math.max(...finite):1,span=mx-mn||1;
    transformed.push({w,values:source.map(v=>Number.isFinite(v)?(normalize?(v-mn)/span:v):null)});
  });
  const all=transformed.flatMap(x=>x.values).filter(Number.isFinite),cycles=Math.max(...list.map(w=>w.curve.length),2);
  if(!all.length)return false;
  const baseLo=normalize?0:Math.min(...all),baseHi=normalize?1:Math.max(...all),pad=(baseHi-baseLo||1)*.06;
  const initial={x0:1,x1:cycles,y0:normalize?0:baseLo-pad,y1:normalize?1:baseHi+pad},view=Object.assign({},initial);
  host.innerHTML=`<div class="curve-canvas-tools"><button type="button" class="ghost curve-reset">Reset view</button><span>Hover for values · wheel zooms · drag pans</span></div><div class="curve-canvas-frame"><canvas width="${W}" height="${H}"></canvas><div class="tip curve-canvas-tip"></div></div>`;
  const canvas=host.querySelector("canvas"),tip=host.querySelector(".curve-canvas-tip"),ctx=canvas.getContext("2d");
  const xPix=x=>L+(x-view.x0)/Math.max(1e-9,view.x1-view.x0)*(W-L-R),yPix=y=>T+(view.y1-y)/Math.max(1e-9,view.y1-view.y0)*(H-T-B),xVal=p=>view.x0+(p-L)/(W-L-R)*(view.x1-view.x0),yVal=p=>view.y1-(p-T)/(H-T-B)*(view.y1-view.y0);
  const fmt=v=>Number(v).toPrecision(Math.abs(v)>=100?6:5);
  function draw(){
    ctx.clearRect(0,0,W,H);ctx.fillStyle="#fff";ctx.fillRect(0,0,W,H);ctx.font="11px sans-serif";ctx.strokeStyle="#e5e7eb";ctx.fillStyle="#64748b";ctx.textAlign="right";
    for(let i=0;i<=5;i++){const y=T+i*(H-T-B)/5,v=view.y1-(view.y1-view.y0)*i/5;ctx.beginPath();ctx.moveTo(L,y);ctx.lineTo(W-R,y);ctx.stroke();ctx.fillText(fmt(v),L-8,y+3);}
    ctx.textAlign="center";for(let i=0;i<=5;i++){const x=L+i*(W-L-R)/5,v=view.x0+(view.x1-view.x0)*i/5;ctx.strokeStyle="#f1f5f9";ctx.beginPath();ctx.moveTo(x,T);ctx.lineTo(x,H-B);ctx.stroke();ctx.fillStyle="#64748b";ctx.fillText(String(Math.max(1,Math.round(v))),x,H-B+18);}
    (opts.hlines||[]).forEach(h=>{const hv=Number.isFinite(h.y)?(!normalize&&opts.log&&h.y>0?Math.log10(h.y):h.y):NaN;if(!Number.isFinite(hv)||hv<view.y0||hv>view.y1)return;const y=yPix(hv);ctx.save();ctx.strokeStyle=h.colour||"#475569";ctx.setLineDash([6,4]);ctx.beginPath();ctx.moveTo(L,y);ctx.lineTo(W-R,y);ctx.stroke();ctx.setLineDash([]);ctx.fillStyle=h.colour||"#475569";ctx.textAlign="left";ctx.fillText(h.label||"",L+5,y-4);ctx.restore();});
    transformed.forEach(({w,values})=>{ctx.strokeStyle=colour(w);ctx.globalAlpha=w.issueColour?.95:.78;ctx.lineWidth=w.issueColour?2.5:(w.role&&w.role!=="Unknown"?1.8:1.25);ctx.beginPath();let started=false;values.forEach((v,i)=>{if(!Number.isFinite(v))return;const x=xPix(i+1),y=yPix(v);if(!started){ctx.moveTo(x,y);started=true;}else ctx.lineTo(x,y);});ctx.stroke();});ctx.globalAlpha=1;
    ctx.fillStyle="#334155";ctx.textAlign="center";ctx.fillText("Cycle",(L+W-R)/2,H-10);ctx.save();ctx.translate(17,(T+H-B)/2);ctx.rotate(-Math.PI/2);ctx.fillText(opts.ylabel||"Stored fluorescence",0,0);ctx.restore();
  }
  function nearest(mx,my){let best=null,bd=12*12;transformed.forEach(({w,values})=>values.forEach((v,i)=>{if(!Number.isFinite(v))return;const d=(xPix(i+1)-mx)**2+(yPix(v)-my)**2;if(d<bd){bd=d;best={w,v,i};}}));return best;}
  function move(e){const rc=canvas.getBoundingClientRect(),sx=W/rc.width,sy=H/rc.height,mx=(e.clientX-rc.left)*sx,my=(e.clientY-rc.top)*sy,best=nearest(mx,my);if(!best){tip.style.display="none";return;}tip.innerHTML=`<b>${esc(label(best.w))}</b><br>Cycle ${best.i+1} · ${esc(fmt(best.v))}`;tip.style.display="block";tip.style.left=Math.min((mx/sx)+14,rc.width-tip.offsetWidth-6)+"px";tip.style.top=((my/sy)+14)+"px";}
  let drag=null;
  const onMove=e=>{if(drag){const rc=canvas.getBoundingClientRect(),sx=W/rc.width,sy=H/rc.height,mx=(e.clientX-rc.left)*sx,my=(e.clientY-rc.top)*sy,dx=(mx-drag.x)/(W-L-R)*(view.x1-view.x0),dy=(my-drag.y)/(H-T-B)*(view.y1-view.y0);view.x0=drag.v.x0-dx;view.x1=drag.v.x1-dx;view.y0=drag.v.y0+dy;view.y1=drag.v.y1+dy;draw();}else move(e);};
  const onLeave=()=>{if(!drag)tip.style.display="none";};
  const onDown=e=>{drag={x:e.offsetX,y:e.offsetY,v:Object.assign({},view)};canvas.setPointerCapture(e.pointerId);};
  const onUp=e=>{drag=null;if(canvas.hasPointerCapture(e.pointerId))canvas.releasePointerCapture(e.pointerId);};
  const onWheel=e=>{e.preventDefault();const rc=canvas.getBoundingClientRect(),sx=W/rc.width,sy=H/rc.height,mx=(e.clientX-rc.left)*sx,my=(e.clientY-rc.top)*sy,fac=e.deltaY<0?.85:1.18,cx=xVal(mx),cy=yVal(my);view.x0=cx+(view.x0-cx)*fac;view.x1=cx+(view.x1-cx)*fac;view.y0=cy+(view.y0-cy)*fac;view.y1=cy+(view.y1-cy)*fac;draw();};
  canvas.addEventListener("mousemove",onMove);canvas.addEventListener("mouseleave",onLeave);canvas.addEventListener("pointerdown",onDown);canvas.addEventListener("pointerup",onUp);canvas.addEventListener("wheel",onWheel,{passive:false});canvas.dataset.interactive="true";
  host.querySelector(".curve-reset").onclick=()=>{Object.assign(view,initial);draw();};
  draw();host._curveDispose=()=>{canvas.removeEventListener("mousemove",onMove);canvas.removeEventListener("mouseleave",onLeave);canvas.removeEventListener("pointerdown",onDown);canvas.removeEventListener("pointerup",onUp);canvas.removeEventListener("wheel",onWheel);};CURVE_PLOTS.push(host);return true;
}