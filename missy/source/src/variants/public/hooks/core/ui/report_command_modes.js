/* ==================================================================
 * Report selection, Command mode and Assisted mode
 * ------------------------------------------------------------------
 * One catalogue of things that can leave the page - every graph as an
 * image, every table as data - and two ways to choose from it: a typed
 * command window and a checklist. Both end in the same two outputs, a
 * PDF built here in the page or a stored archive.
 *
 * The selection never recomputes a value. Every item asks the same
 * function the tab asks, so a figure in the report is the figure on the
 * screen and a table in the report is the table the export writes.
 * ================================================================== */

/* ---------- 1 . a very small PDF writer ----------
   No library: the page is offline. The writer emits PDF 1.4 with the two
   standard Helvetica faces (never embedded, so no font bytes are needed)
   and embeds figures as JPEG, which PDF carries natively with DCTDecode.
   Text is WinAnsi; a character the encoding has no place for is written
   as a question mark rather than silently corrupting the stream. */
const PDF_PAGE={w:595.28,h:841.89,margin:42};
/* WinAnsi has a place for most of the punctuation the page uses; the few
   scientific symbols it has no place for are written out rather than lost. */
const PDF_WINANSI={"\u20AC":128,"\u201A":130,"\u0192":131,"\u201E":132,"\u2026":133,"\u2020":134,
  "\u2021":135,"\u02C6":136,"\u2030":137,"\u0160":138,"\u2039":139,"\u0152":140,"\u017D":142,
  "\u2018":145,"\u2019":146,"\u201C":147,"\u201D":148,"\u2022":149,"\u2013":150,"\u2014":151,
  "\u02DC":152,"\u2122":153,"\u0161":154,"\u203A":155,"\u0153":156,"\u017E":158,"\u0178":159};
const PDF_SPELL={"\u0394":"Delta","\u2206":"Delta","\u03B4":"delta","\u03C3":"SD","\u03BC":"\u00B5",
  "\u2265":">=","\u2264":"<=","\u2260":"!=","\u2192":"->","\u2190":"<-","\u21D2":"=>",
  "\u00A0":" ","\u2009":" ","\u202F":" ","\u2212":"-","\u00D7":"x","\u221A":"sqrt",
  "\u00B2":"2","\u00B3":"3","\u2103":"degC","\u03B1":"alpha","\u03B2":"beta","\u03BB":"lambda"};
function pdfStr(s){
  let o="";
  for(const ch of String(s==null?"":s)){
    const sp=PDF_SPELL[ch];
    if(sp!==undefined){o+=pdfStr(sp);continue;}
    const win=PDF_WINANSI[ch];
    const c=win!==undefined?win:ch.codePointAt(0);
    if(ch==="("||ch===")"||ch==="\\")o+="\\"+ch;
    else if(c===10)o+="\\n";
    else if(c<32)o+=" ";
    else if(c<128)o+=String.fromCharCode(c);
    else if(c<256)o+="\\"+c.toString(8).padStart(3,"0");
    else o+="?";
  }
  return o;
}
function pdfWidth(text,size,bold){
  /* Helvetica advance widths, 1000 units per em, for the printable range.
     Approximated by class: the report only needs column fitting, not kerning. */
  const s=String(text==null?"":text);let w=0;
  for(const ch of s){
    const c=ch.codePointAt(0);
    let u=556;
    if("iljI|!.,;:'`".includes(ch))u=222;
    else if("ftr()[]{}/\\-".includes(ch))u=333;
    else if(" ".includes(ch))u=278;
    else if("0123456789".includes(ch))u=556;
    else if("mwMW@".includes(ch))u=833;
    else if(c>=65&&c<=90)u=667;
    else if(c>=97&&c<=122)u=556;
    w+=u*(bold?1.06:1);
  }
  return w*size/1000;
}
function pdfFit(text,width,size,bold){
  let s=String(text==null?"":text);
  if(pdfWidth(s,size,bold)<=width)return s;
  while(s.length&&pdfWidth(s+"…",size,bold)>width)s=s.slice(0,-1);
  return s+"…";
}
function pdfWrap(text,width,size,bold){
  const words=String(text==null?"":text).split(/\s+/).filter(Boolean),lines=[];let cur="";
  words.forEach(w=>{
    const t=cur?cur+" "+w:w;
    if(pdfWidth(t,size,bold)<=width)cur=t;
    else{if(cur)lines.push(cur);cur=pdfWidth(w,size,bold)<=width?w:pdfFit(w,width,size,bold);}
  });
  if(cur)lines.push(cur);
  return lines.length?lines:[""];
}
/* MISSY option 3: hexagon, helix, wordmark.  The same geometry is used for
   the header, figures, archives and reports. */
const MISSY_LOGO_OPTION=3;
const MISSY_TEXT=Object.freeze({name:"MISSY",status:"RUO",warning:"NOT VALIDATED"});
const MISSY_COLORS=Object.freeze({ink:"#102f4d",teal:"#0d8790",amber:"#e7a12c",paper:"#ffffff"});
const MISSY_FACE='"Courier New","Nimbus Mono PS","Liberation Mono",monospace';
function missyEmblem(cx,cy,r,sw){
  const c=MISSY_COLORS,k=r/100,pt=[[0,-100],[87,-50],[87,50],[0,100],[-87,50],[-87,-50]].map(([x,y])=>`${(cx+x*k).toFixed(2)},${(cy+y*k).toFixed(2)}`).join(" ");
  const S=(x,y)=>`${(cx+x*k).toFixed(2)} ${(cy+y*k).toFixed(2)}`;
  const helix=`<path d="M${S(-19,-59)}c${38*k} ${24*k} ${38*k} ${40*k} 0 ${64*k}s${-38*k} ${40*k} 0 ${64*k}M${S(19,-59)}c${-38*k} ${24*k} ${-38*k} ${40*k} 0 ${64*k}s${38*k} ${40*k} 0 ${64*k}" fill="none" stroke="${c.teal}" stroke-width="${(4.7*k*sw).toFixed(2)}" stroke-linecap="round"/>`;
  const rungs=[[-12,-42,24],[-19,-21,38],[-19,0,38],[-12,21,24],[-19,42,38],[-19,63,38]].map(([x,y,w])=>`M${S(x,y)}h${(w*k).toFixed(2)}`).join("");
  return `<polygon points="${pt}" fill="${c.paper}" stroke="${c.ink}" stroke-width="${(5.9*k*sw).toFixed(2)}" stroke-linejoin="round"/>${helix}<path d="${rungs}" stroke="${c.amber}" stroke-width="${(3.5*k*sw).toFixed(2)}" stroke-linecap="round"/>`;
}
function missyWords(x,y,size,anchor){
  const c=MISSY_COLORS,t=(s,dy,fs,ls,fill)=>`<text x="${x}" y="${(y+dy).toFixed(2)}" text-anchor="${anchor}" font-family='${MISSY_FACE}' font-size="${fs.toFixed(2)}" font-weight="700" letter-spacing="${ls.toFixed(2)}" fill="${fill}">${s}</text>`;
  return t(MISSY_TEXT.name,0,size,size*.16,c.ink)+t(MISSY_TEXT.status,size*1.04,size*.66,size*.12,c.teal)+t(MISSY_TEXT.warning,size*1.94,size*.40,size*.08,c.ink);
}
function missySvg(compact){
  if(!compact)return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 190 330" width="190" height="330" role="img" aria-label="MISSY RUO NOT VALIDATED">${missyEmblem(95,110,100,1)}${missyWords(95,265,26,"middle")}</svg>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 150 50" width="150" height="50" role="img" aria-label="MISSY RUO NOT VALIDATED">${missyEmblem(23,25,21,1.25)}${missyWords(52,17,14,"start")}</svg>`;
}
function missyMarkWithSvg(svgText,corner="top-right"){
  const raw=String(svgText||"");if(!raw.includes("</svg>"))return raw;
  const m=raw.match(/viewBox=["']([^"']+)["']/i),v=m?m[1].split(/\s+/).map(Number):[0,0,900,450],W=v[2]||900,H=v[3]||450,mw=150,mh=50,g=10;
  const pos={"top-left":[g,g],"top-right":[Math.max(g,W-g-mw),g],"bottom-left":[g,Math.max(g,H-g-mh)],"bottom-right":[Math.max(g,W-g-mw),Math.max(g,H-g-mh)]};
  const p=pos[corner]||pos["top-right"],mark=missySvg(true).replace(/^<svg[^>]*>|<\/svg>$/g,"");
  return raw.replace("</svg>",`<g transform="translate(${p[0]} ${p[1]})">${mark}</g></svg>`);
}
function pdfDoc(){
  const pages=[];let cur=null;
  const style=MISSY_HOOKS.invoke("report.style",null,[],()=>({}));
  const d={
    images:[],
    page(){
      cur={ops:[],uses:[]};pages.push(cur);d.y=PDF_PAGE.h-PDF_PAGE.margin;
      if(style.header)style.header(d,rawText);
      return cur;
    },
    get width(){return PDF_PAGE.w-2*PDF_PAGE.margin;},
    y:0,
    room(h){if(!cur)d.page();if(d.y-h<PDF_PAGE.margin+24){d.page();return false;}return true;},
    text(s,size,bold,dx,colour){
      const c=colour||(style.colour?style.colour(bold):[0,0,0]);
      if(style.wrapTitle&& !dx&&((bold&&size>=14)||/^\d+\.\s/.test(String(s)))){
        for(const line of pdfWrap(String(s),d.width,size,bold)){d.room(size*1.4);rawText(line,size,bold,dx,c);}return;
      }
      rawText(s,size,bold,dx,c);
    },
    para(s,size,bold){
      const mapped=MISSY_HOOKS.invoke('report.paragraph',null,[s],v=>v);
      const lines=style.paragraphLines?style.paragraphLines(mapped):[mapped];
      for(const line of lines)pdfWrap(line,d.width,size,bold).forEach(l=>{d.room(size*1.4);d.text(l,size,bold);});
    },
    gap(h){d.y-=h;},
    rule(){if(!cur)d.page();cur.ops.push(`0.75 0.75 0.78 RG 0.6 w ${PDF_PAGE.margin} ${d.y.toFixed(2)} m ${(PDF_PAGE.w-PDF_PAGE.margin).toFixed(2)} ${d.y.toFixed(2)} l S`);d.y-=6;},
    image(jpeg,w,h,natW,natH){
      if(!cur)d.page();
      const id=d.images.length+1;d.images.push({jpeg,w:natW,h:natH});
      cur.uses.push(id);
      cur.ops.push(`q ${w.toFixed(2)} 0 0 ${h.toFixed(2)} ${PDF_PAGE.margin} ${(d.y-h).toFixed(2)} cm /Im${id} Do Q`);
      d.y-=h+8;
    },
    build(){
      /* Reserve and draw a small footer on every generated report page.  The
         footer uses PDF text operators so it works in the self-contained writer. */
      const total=pages.length;
      pages.forEach((p,i)=>{
        const y=18;
        p.ops.push(`0.72 0.76 0.82 RG 0.6 w ${PDF_PAGE.margin} ${(y+10).toFixed(2)} m ${(PDF_PAGE.w-PDF_PAGE.margin).toFixed(2)} ${(y+10).toFixed(2)} l S`);
        
        p.ops.push(`BT 0.06 0.18 0.30 rg /F1 7 Tf 1 0 0 1 ${(PDF_PAGE.w-PDF_PAGE.margin-74).toFixed(2)} ${y.toFixed(2)} Tm (${pdfStr("Page "+(i+1)+" of "+total)}) Tj ET`);
      });
      const enc=new TextEncoder(),chunks=[],offsets=[];let len=0;
      const put=x=>{const b=x instanceof Uint8Array?x:enc.encode(x);chunks.push(b);len+=b.length;};
      const objs=[];
      const nPages=pages.length;
      /* 1 catalog, 2 pages, 3 F1, 4 F2, then per image, then per page content + page */
      const imgBase=5,pageBase=imgBase+d.images.length*1;
      objs.push(`<< /Type /Catalog /Pages 2 0 R >>`);
      objs.push(`<< /Type /Pages /Kids [${pages.map((p,i)=>`${pageBase+nPages+i} 0 R`).join(" ")}] /Count ${nPages} >>`);
      objs.push(`<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>`);
      objs.push(`<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>`);
      d.images.forEach(im=>objs.push({dict:`<< /Type /XObject /Subtype /Image /Width ${im.w} /Height ${im.h} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${im.jpeg.length} >>`,stream:im.jpeg}));
      pages.forEach(p=>{
        const body=enc.encode(p.ops.join("\n"));
        objs.push({dict:`<< /Length ${body.length} >>`,stream:body});
      });
      pages.forEach((p,i)=>{
        const res=`<< /Font << /F1 3 0 R /F2 4 0 R >> ${p.uses.length?`/XObject << ${p.uses.map(u=>`/Im${u} ${imgBase+u-1} 0 R`).join(" ")} >>`:""} >>`;
        objs.push(`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${PDF_PAGE.w} ${PDF_PAGE.h}] /Resources ${res} /Contents ${pageBase+i} 0 R >>`);
      });
      put("%PDF-1.4\n%\xE2\xE3\xCF\xD3\n");
      objs.forEach((o,i)=>{
        offsets[i]=len;
        put(`${i+1} 0 obj\n`);
        if(typeof o==="string")put(o+"\n");
        else{put(o.dict+"\nstream\n");put(o.stream);put("\nendstream\n");}
        put("endobj\n");
      });
      const xref=len;
      let x=`xref\n0 ${objs.length+1}\n0000000000 65535 f \n`;
      offsets.forEach(o=>{x+=String(o).padStart(10,"0")+" 00000 n \n";});
      put(x);
      put(`trailer\n<< /Size ${objs.length+1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF\n`);
      const out=new Uint8Array(len);let at=0;
      chunks.forEach(c=>{out.set(c,at);at+=c.length;});
      return out;
    }
  };
  function rawText(s,size,bold,dx,colour){
    if(!cur)d.page();const c=colour||[0,0,0];
    cur.ops.push(`BT ${c[0]} ${c[1]} ${c[2]} rg /${bold?"F2":"F1"} ${size} Tf 1 0 0 1 ${(PDF_PAGE.margin+(dx||0)).toFixed(2)} ${(d.y-size).toFixed(2)} Tm (${pdfStr(s)}) Tj ET`);
    d.y-=size*1.32;
  }
  d.page();
  return d;
}
/* An SVG figure becomes a JPEG the PDF can carry. The drawing is rasterised at
   twice the nominal size so a printed page keeps the line weights readable. */
function svgToJpeg(svgText,scale){
  return new Promise(resolve=>{
    const m=String(svgText).match(/viewBox="0 0 ([\d.]+) ([\d.]+)"/);
    const W=m?+m[1]:900,H=m?+m[2]:450,s=scale||2;
    const img=new Image();
    img.onload=()=>{
      const cv=document.createElement("canvas");cv.width=Math.round(W*s);cv.height=Math.round(H*s);
      const ctx=cv.getContext("2d");ctx.fillStyle="#fff";ctx.fillRect(0,0,cv.width,cv.height);
      ctx.drawImage(img,0,0,cv.width,cv.height);
      const url=cv.toDataURL("image/jpeg",0.9),b64=url.slice(url.indexOf(",")+1),bin=atob(b64);
      const bytes=new Uint8Array(bin.length);for(let i=0;i<bin.length;i++)bytes[i]=bin.charCodeAt(i);
      resolve({bytes,w:cv.width,h:cv.height,natW:W,natH:H});
    };
    img.onerror=()=>resolve(null);
    img.src="data:image/svg+xml;charset=utf-8,"+encodeURIComponent(svgText);
  });
}

/* ---------- 2 . the catalogue both modes select from ----------
   An item knows how to produce itself twice: as a figure for the report and
   as a file for the archive. Nothing is precomputed, so a selection made
   before a file is read is still valid after it. */
const SEL_STATE={ids:new Set(),options:Object.create(null),run:0,figureScope:"selected",title:"",output:"pdf",lastReport:null};
function selRunIndex(){
  const n=Number(SEL_STATE.run)||0;
  return RUNS.length?Math.min(Math.max(0,n),RUNS.length-1):0;
}
function selGraphContext(g,ri=selRunIndex()){
  const o=SEL_STATE.options["img:"+g.id]||{};
  /* target=all (any case) is the documented way to ask for every target; it must not be read as a target called "all" */
  const allTargets=/^all$/i.test(o.target||"");
  /* An omitted target is intentionally the all-target view. Never infer one from well order. */
  return {g,ri,run:RUNS[ri],target:allTargets?"":String(o.target||"").trim(),
    metric:o.metric||"outcome",signal:o.signal||"stored",log:o.log==="yes",colourby:o.colourby||"outcome",level:o.level||"end",control:o.control||"0"};
}
function selImageItemsBase(){
  return (typeof GRAPHS==="undefined"?[]:GRAPHS).map(g=>({
    id:"img:"+g.id,kind:"image",group:g.group||"Figures",title:g.title||g.id,
    note:g.note||"",scope:g.scope||"all",
    reportGraph:g,
    ready:()=>reportGraphRunIndexes(g).some(ri=>reportGraphAvailable(g,ri)),
    figure:()=>reportGraphFigure(g,reportGraphRunIndexes(g).find(ri=>reportGraphAvailable(g,ri))??selRunIndex())
  }));
}
function selImageItems(...args){return MISSY_HOOKS.invoke("selImageItems",this,args,selImageItemsBase);}

function selDataItemsBase(){
  const csv=rows=>toCSV(uniq(rows.flatMap(Object.keys)).map(k=>({key:k,label:k})),rows);
  const item=(id,title,note,ready,rows,file)=>({id:"data:"+id,kind:"data",group:"Tables",title,note,
    ready,rows,file:file||(id+".csv"),text:()=>csv(rows())});
  const L=[];
  L.push(item("cq_values","Stored Cq values",
    "One row per stored result with well, sample, target, role and call.",
    ()=>RUNS.length>0,()=>allWellRows()));
  L.push(item("melting_peaks","Melting peaks",
    "One row per stored peak with temperature, area, width and height.",
    ()=>tmRows().length>0,()=>tmRows()));
  L.push(item("experiment_settings","Experiment settings",
    "Every setting read out of the container, with the property it came from.",
    ()=>RUNS.length>0,()=>derivedSettings()));
  L.push(item("plate_map","Plate map",
    "The plate as the file describes it: position, sample, target and role.",
    ()=>RUNS.length>0,()=>RUNS.flatMap(r=>plateMapRows(r,""))));
  L.push(item("statistics","Statistics",
    "Per target and group: counts, mean Cq, spread and detection.",
    ()=>RUNS.length>0,()=>reviewStatisticsRows()));
  L.push(item("runs_and_qc","Runs and quality control",
    "One row per run with its profile answer and the reason behind it.",
    ()=>RUNS.length>0,()=>reviewRunRows(reviewForensicEvents())));
  L.push(item("forensic_log","Forensic findings",
    "Every finding with its area, severity and the evidence behind it.",
    ()=>RUNS.length>0,()=>reviewForensicEvents()));
  L.push(item("control_charts","Control chart points",
    "The plotted points of the control series with their limits.",
    ()=>RUNS.length>0,()=>reviewControlSeries("root").flatMap(s=>s.points.map(p=>Object.assign({series:s.sample,category:s.category,target:s.target},p)))));
  L.push(item("amplification_curves","Amplification curves",
    "The fluorescence of every well, one row per cycle.",
    ()=>RUNS.some(r=>(r.wells||[]).some(w=>w.curve&&w.curve.length)),
    ()=>RUNS.flatMap(run=>(run.wells||[]).filter(w=>w.curve&&w.curve.length)
      .flatMap(w=>w.curve.map((v,i)=>({experiment:runName(run),well:w.well,sample:w.sample||"",target:w.target||"",cycle:i+1,fluorescence:v}))))));
  L.push(item("sop_answers","Profile answers",
    "What the laboratory profile concluded for every sample.",
    ()=>RUNS.length>0,()=>sopSampleRows("",true)));
  L.push(item("relative_quantification","Relative quantification",
    "Relative quantification rows read from the stored analysis.",
    ()=>RUNS.some(r=>(r.rqResults||[]).length),()=>rqRows()));
  L.push(item("multicomponent_raw","Multicomponent raw values",
    "Raw multicomponent signal rows from exchange containers.",
    ()=>RUNS.some(r=>r.eds),()=>edsSignalRows()));
  L.push(item("experiment_meta","Experiment metadata",
    "Metadata fields read from every loaded experiment.",
    ()=>RUNS.length>0,()=>metaRows()));
  L.push(item("sample_comparison","Sample comparison",
    "Paired sample comparison rows for the first two loaded runs.",
    ()=>RUNS.length>1,()=>sampleComparisonRows(RUNS[0],RUNS[1],200)));
  L.push(item("rising_curves","Rising curves without a channel result",
    "Curve events retained for review when the same channel has no stored result.",
    ()=>RUNS.length>0,()=>risingCurveRows()));
  L.push(item("sop_criteria","SOP criteria",
    "One row per evaluated profile criterion.",
    ()=>RUNS.length>0,()=>sopCriteriaRows()));
  L.push(item("sop_runs","SOP run decisions",
    "One row per run with profile status and counts.",
    ()=>RUNS.length>0,()=>sopRunRows()));
  const recordRows=()=>RUNS.flatMap((run,index)=>Object.entries(instrumentRecordTables(run)).flatMap(([table,rows])=>(rows||[]).map(row=>({run:index+1,experiment:runName(run),table,...row}))));
  L.push({id:"rec:instrument_records",kind:"data",group:"Instrument records",title:"Instrument records",note:"Metadata, protocol, channels, subsets, analyses and statistics.",ready:()=>RUNS.length>0,rows:recordRows,file:"instrument_records.csv",text:()=>csv(recordRows())});
  return L;
}
function selDataItems(...args){return MISSY_HOOKS.invoke("selDataItems",this,args,selDataItemsBase);}

const SEL_OPTION_RULES=Object.freeze({
  "img:curves":{target:"text",signal:["stored","drn"],log:["yes","no"]},
  "img:plate":{metric:["outcome","status","cq","end_fluorescence","background","amplitude"],target:"text"},
  "img:cqstrip":{colourby:["outcome","role"],target:"text"},
  "img:endpoint":{level:["end","amplitude"],target:"text"},
  "img:*":{target:"text",control:"text"},
  "cc:*":{type:["i","ewma","cusum","trend","xbars","p","u","c","funnel"],x:["order","date","hours","cycles"],phase1:"number",lambda:"number",L:"number",k:"number",h:"number",specLo:"numberOrEmpty",specHi:"numberOrEmpty",warnAhead:"integer",charts:"chartSet"},
  "data:*":{run:"run",rows:"integer",pseudo:["yes","no"]},
  "rec:*":{run:"run",rows:"integer",pseudo:["yes","no"]}
});
function selChartItemsBase(){
  return (typeof CC_CHARTS==="undefined"?[]:CC_CHARTS).map(def=>({
    id:"cc:"+def.id,kind:"image",group:"Control charts · "+def.group,title:def.title||def.id,
    note:def.reading||def.idea||"Control chart",ready:()=>ccInstruments().length>0,
    figure:()=>{
      const insts=ccInstruments();if(!insts.length)throw new Error("no instrument history");
      const old=CC_STATE.instrument;CC_STATE.instrument=old&&insts.some(i=>i.key===old)?old:insts[0].key;
      const opt=SEL_STATE.options["cc:"+def.id]||{},oldCfg=(SOP.controlCharts||{})[def.id];
      try{const rows=ccRowsFor(CC_STATE.instrument);if(!rows.length)throw new Error("no rows for instrument");
        if(Object.keys(opt).length){SOP.controlCharts=SOP.controlCharts||{};SOP.controlCharts[def.id]=Object.assign({},oldCfg||{},opt);}
        const v=(ccVariants(def,rows)||[])[0]||"",res=ccCompute(def,rows,v);return {svg:ccChartSvg(res,`${def.code} ${def.title}${v?" · "+v:""}`),rows:ccChartRows(def,res,v)};}
      finally{if(Object.keys(opt).length){SOP.controlCharts=SOP.controlCharts||{};if(oldCfg===undefined)delete SOP.controlCharts[def.id];else SOP.controlCharts[def.id]=oldCfg;}CC_STATE.instrument=old;}
    }
  }));
}
function selChartItems(...args){return MISSY_HOOKS.invoke("selChartItems",this,args,selChartItemsBase);}

function selCatalogue(){return selImageItems().concat(selDataItems(),selChartItems());}
function selItem(id){return selCatalogue().find(x=>x.id===id)||null;}
function selMatch(pattern){
  const p=String(pattern||"").trim();
  if(!p)return [];
  if(p==="all"||p==="*")return selCatalogue().map(x=>x.id);
  if(p==="images")return selImageItems().map(x=>x.id);
  if(p==="data"||p==="tables")return selDataItems().map(x=>x.id);
  if(p==="cc:all")return selChartItems().map(x=>x.id);
  if(/^cc:(hardware|software|method|operator)$/i.test(p))return selChartItems().filter(x=>x.group.toLowerCase().endsWith(p.slice(3).toLowerCase())).map(x=>x.id);
  const re=new RegExp("^"+p.replace(/[.+^${}()|[\]\\]/g,"\\$&").replace(/\*/g,".*").replace(/\?/g,".")+"$","i");
  return selCatalogue().filter(x=>re.test(x.id)||re.test(x.id.replace(/^[a-z]+:/,""))).map(x=>x.id);
}
function selSelectedBase(){
  const ids=SEL_STATE.ids;
  return selCatalogue().filter(x=>ids.has(x.id)&&reportItemVisible(x)).flatMap(reportExpandItem);
}
function selSelected(...args){return MISSY_HOOKS.invoke("selSelected",this,args,selSelectedBase);}

/* One line may name several patterns: "select img:plate data:cq_values" is two. */
function selMatchAll(patterns){
  const out=[];
  String(patterns||"").split(/[\s,]+/).filter(Boolean).forEach(p=>selMatch(p).forEach(id=>{if(!out.includes(id))out.push(id);}));
  return out;
}
function selAdd(patterns){const m=selMatchAll(patterns);m.forEach(id=>SEL_STATE.ids.add(id));return m;}
function selRemove(patterns){const m=selMatchAll(patterns);m.forEach(id=>SEL_STATE.ids.delete(id));return m;}
function selClear(){SEL_STATE.ids.clear();}

/* ---------- 3 . the two laboratory fields ----------
   The profile carries who did the work. They appear on the report, they are
   part of the profile, and they therefore change the profile hash - which is
   the point: a report is attributable. */
function sopLab(){
  if(!SOP.lab||typeof SOP.lab!=="object")SOP.lab={name:"",analyst:""};
  return SOP.lab;
}
function sopLabName(){return String(sopLab().name||"").trim();}
function sopAnalystName(){return String(sopLab().analyst||"").trim();}

/* ---------- 4 . the CSV the assisted mode hands out and takes back ---------- */
function selCsvTemplate(){
  const rows=selCatalogue().map(x=>({id:x.id,kind:x.kind,group:x.group,title:x.title,
    available:x.ready()?"yes":"no",include:SEL_STATE.ids.has(x.id)?"yes":"no",figure_scope:SEL_STATE.figureScope||"selected",figure_run:String(selRunIndex())}));
  return toCSV([{key:"id",label:"id"},{key:"kind",label:"kind"},{key:"group",label:"group"},
    {key:"title",label:"title"},{key:"available",label:"available"},{key:"include",label:"include"},{key:"figure_scope",label:"figure_scope"},{key:"figure_run",label:"figure_run"}],rows);
}
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

/* ---------- 5 . the archive ---------- */
function selZipEntries(){
  const entries=[],chosen=selSelected();
  chosen.forEach(x=>{
    try{
      if(x.kind==="image"){
        const f=x.figure();
        entries.push({name:"figures/"+safeName(x.id.slice(4))+".svg",data:f.svg});
        if(f.rows&&f.rows.length)entries.push({name:"figures/"+safeName(x.id.slice(4))+".csv",data:csvOf(f.rows)});
      }else{
        entries.push({name:"tables/"+x.file,data:x.text()});
      }
    }catch(e){entries.push({name:"errors/"+safeName(x.id)+".txt",data:String(e&&e.message||e)});}
  });
  entries.push({name:"selection.csv",data:selCsvTemplate()});
  entries.push({name:"sop_profile.json",data:sopJSON()});
  entries.push({name:"dna_separator.svg",data:`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 72"><path d="M10 10C130 62 210 10 330 62S530 10 650 62 850 10 990 62M10 62C130 10 210 62 330 10S530 62 650 10 850 62 990 10" fill="none" stroke="#102f4d" stroke-width="3"/><path d="M70 34v22M150 22v28M230 22v28M310 34v22M390 22v28M470 22v28M550 34v22M630 22v28M710 22v28M790 34v22M870 22v28M950 22v28" stroke="#0d8790" stroke-width="2"/></svg>`});
  entries.push({name:"README.txt",data:selReadme(chosen)});
  return entries;
}
function selReadme(chosen){
  const L=[];
  L.push("Selected report material");
  L.push("");
  L.push("Laboratory: "+(sopLabName()||"not stated"));
  L.push("Analysis by: "+(sopAnalystName()||"not stated"));
  L.push("Profile: "+SOP.name+" v"+SOP.version+" sha256:"+sopHash());
  L.push("Built: "+new Date().toISOString());
  L.push("Runs loaded: "+RUNS.length+(RUNS.length?" ("+RUNS.map(runName).join(", ")+")":""));
  L.push("");
  L.push("Items in this archive:");
  chosen.forEach(x=>L.push("  "+x.id+"  "+x.title));
  L.push("");
  L.push("figures/  one .svg per selected figure, with the numbers behind it as .csv");
  L.push("tables/   one .csv per selected table");
  L.push("selection.csv  the selection itself, so the same report can be rebuilt");
  L.push("");
  L.push("dna_separator.svg  vector separator");
  L.push("");
  L.push("Values are the values the instrument software stored. This archive is not a");
  L.push("validated report and does not replace the laboratory's own record.");
  return L.join("\n");
}
/* The pseudonym switch on the Open formats tab governs every export the page writes,
   and a report is an export. The asynchronous form is needed because a figure has to be
   rasterised before the next one is drawn. */
async function selWithExportNames(fn){
  if(!pseudoOn())return await fn();
  const keep=RUNS;RUNS=keep.map((r,i)=>ssExportClone(pseudoRun(r),r,i));
  try{return await fn();}finally{RUNS=keep;}
}
function selDownloadZip(name){
  const entries=withExportNames(selZipEntries);
  download(safeName(name||((sopLabName()||baseName())+"_selection"))+".zip",makeStoredZip(entries),"application/zip");
  return entries.length;
}

/* ---------- 6 . the report ----------
   A cover that says who produced it and against which profile, then one
   section per selected item. A figure is drawn at the width of the text
   block; a table is printed one row to a line and truncated at the column
   width, with the number of rows left out stated underneath. */
const SEL_TABLE_ROWS=28;
function selReportTitle(){
  return SEL_STATE.title||("Selected results" + (RUNS.length===1?" — "+runName(RUNS[0]):""));
}
function selTableBlock(doc,rows,note){
  if(!rows||!rows.length){doc.para("No rows.",9.5,false);return;}
  const cols=uniq(rows.flatMap(Object.keys)).slice(0,8);
  const shown=rows.slice(0,SEL_TABLE_ROWS);
  const size=8.5,gap=6;
  const wid=cols.map(c=>{
    let w=pdfWidth(c,size,true);
    shown.forEach(r=>{w=Math.max(w,pdfWidth(String(r[c]==null?"":r[c]),size,false));});
    return w;
  });
  /* Water-filling: a column never takes more than it needs, and a column that needs
     more than its share only gets the room the others did not use. Scaling every column
     by one factor would spend the page on whichever column happens to be widest. */
  let room=doc.width-gap*(cols.length-1);
  const widths=wid.slice();
  if(wid.reduce((a,b)=>a+b,0)>room){
    let left=room,open=cols.map((c,i)=>i);
    for(let pass=0;pass<8&&open.length;pass++){
      const share=left/open.length,done=[];
      open.forEach(i=>{if(wid[i]<=share){widths[i]=wid[i];left-=wid[i];done.push(i);}});
      if(!done.length){open.forEach(i=>{widths[i]=left/open.length;});break;}
      open=open.filter(i=>!done.includes(i));
    }
  }
  const line=(vals,bold)=>{
    doc.room(size*1.5);
    let x=0;
    vals.forEach((v,i)=>{
      doc.text(pdfFit(v,widths[i],size,bold),size,bold,x);
      doc.y+=size*1.32;                      /* stay on the line for the next column */
      x+=widths[i]+gap;
    });
    doc.y-=size*1.5;
  };
  line(cols,true);
  doc.rule();
  shown.forEach(r=>line(cols.map(c=>{
    const v=r[c];
    return typeof v==="number"?String(+v.toPrecision(6)):String(v==null?"":v);
  }),false));
  doc.gap(2);
  const left=rows.length-shown.length;
  doc.para(left>0?`${rows.length} rows in total; the first ${shown.length} are shown. The archive carries all of them.`
                 :`${rows.length} row${rows.length===1?"":"s"}.`,8,false);
  if(note)doc.para(note,8,false);
}
async function selBuildReportBase(){
  const chosen=selSelected();
  if(!chosen.length)throw new Error("nothing is selected");
  const doc=pdfDoc();
  doc.text(selReportTitle(),20,true);
  doc.gap(4);doc.rule();doc.gap(6);
  const meta=[
    ["Laboratory",sopLabName()||"not stated"],
    ["Analysis by",sopAnalystName()||"not stated"],
    ["Profile",SOP.name+"  v"+SOP.version],
    ["Profile checksum","sha256:"+sopHash()],
    ["Built",new Date().toISOString().replace("T"," ").slice(0,19)+" UTC"],
    ["Runs loaded",RUNS.length?RUNS.map(runName):["none"]],
    ["Figure coverage",SEL_STATE.figureScope==="all"?"All loaded runs; separate figures for each compatible run":"Standard figures: "+(RUNS[selRunIndex()]?.file||"none")],
    ["Table coverage","All loaded data; analytical tables respect sample exclusions. Raw and hardware evidence retain their original scope."],
    ["Items selected",String(chosen.length)]
  ];
  const labelW=120,valueW=doc.width-labelW,size=10,line=size*1.32;
  meta.forEach(([k,v])=>{
    const values=Array.isArray(v)?(v.length?v.map(String):["none"]):[String(v==null?"none":v)];
    const lines=values.flatMap(x=>pdfWrap(x,valueW,size,false));
    doc.room(line+4);
    doc.text(k,size,true);doc.y+=line;
    lines.forEach(x=>{if(!doc.room(line)){doc.text(k+" (continued)",size,true);doc.y+=line;}doc.text(x,size,false,labelW);});
  });
  doc.gap(10);doc.rule();doc.gap(4);
  doc.para("Values in this report are the values the instrument software stored. The page recomputes nothing. "
    +"This is not a validated laboratory report and does not replace the laboratory's own record.",9,false);
  doc.gap(8);
  doc.text("Contents",12,true);
  chosen.forEach((x,i)=>doc.para((i+1)+".  "+x.title+"   ["+x.id+"]",9.5,false));

  for(const x of chosen){
    doc.page();
    doc.text(x.title,14,true);
    doc.gap(2);
    if(x.note)doc.para(x.note,9,false);
    doc.gap(4);doc.rule();doc.gap(4);
    if(x.kind==="image"){
      let f=null;
      try{f=x.figure();}catch(e){doc.para("This figure could not be drawn: "+(e&&e.message||e),9.5,false);}
      if(f){
        const jpg=await svgToJpeg(f.svg,2);
        if(jpg){
          const w=doc.width,h=w*jpg.natH/jpg.natW;
          doc.room(h+10);
          doc.image(jpg.bytes,w,h,jpg.w,jpg.h);
        }else doc.para("This figure could not be rasterised in this browser.",9.5,false);
        if(f.rows&&f.rows.length){
          doc.gap(6);doc.text("Numbers behind this figure",11,true);doc.gap(2);
          selTableBlock(doc,f.rows);
        }
      }
    }else{
      let rows=[];
      try{rows=x.rows()||[];}catch(e){doc.para("This table could not be built: "+(e&&e.message||e),9.5,false);}
      selTableBlock(doc,rows);
    }
  }
  const bytes=doc.build();
  SEL_STATE.lastReport={bytes:bytes.length,items:chosen.length,at:new Date().toISOString()};
  return bytes;
}
function selBuildReport(...args){return MISSY_HOOKS.invoke("selBuildReport",this,args,selBuildReportBase);}

async function selDownloadReport(name){
  const bytes=await selWithExportNames(selBuildReport);
  download(safeName(name||((sopLabName()||baseName())+"_report"))+".pdf",bytes,"application/pdf");
  return bytes.length;
}

/* ---------- 7 . Command mode ----------
   A typed window for an operator who knows what they want, and for a
   procedure that has been written down: the same lines that can be typed can
   be pasted as a script, so a report becomes repeatable. Every command
   answers in the window; nothing happens silently. */
const CMD={open:false,history:[],at:-1,busy:false};
const CMD_HELP=[
  ["help","this list"],
  ["list [images|data|all]","what can be selected, with its identifier"],
  ["select <pattern>","add to the selection; * and ? are allowed, e.g. select img:*"],
  ["select <pattern> key=value","select with validated options"],
  ["set <pattern> key=value","change options on selected items"],
  ["show <pattern>","show options in force"],
  ["reset <pattern>","return selected options to defaults"],
  ["deselect <pattern>","remove from the selection"],
  ["only <pattern>","clear the selection, then add the pattern"],
  ["clear","empty the selection"],
  ["selection","what is selected now"],
  ["run <number|all>","standard figures from one run, or separate figures for every compatible loaded run; tables cover all loaded data"],
  ["runs","the loaded runs and their numbers"],
  ["lab <text>","the laboratory name for the report and the profile"],
  ["analyst <text>","who is doing the analysis"],
  ["title <text>","the report title"],
  ["profile","the active profile, its version and checksum"],
  ["pdf [name]","build the report and download it"],
  ["zip [name]","build the archive and download it"],
  ["template","download the selection as a CSV"],
  ["status","files read, results, selection, profile"],
  ["issues [category]","group loaded-experiment problems by category"],
  ["curves [category]","open reconstructed problem curves in the review overview"],
  ["script","open the box for a pasted procedure"],
  ["close","leave command mode"]
];
function cmdEl(id){return document.getElementById(id);}
function cmdPrint(text,cls){
  const out=cmdEl("cmd-out");if(!out)return;
  const div=document.createElement("div");
  div.className="cmd-line"+(cls?" "+cls:"");
  div.textContent=String(text==null?"":text);
  out.appendChild(div);out.scrollTop=out.scrollHeight;
}
function cmdTable(rows){
  if(!rows.length){cmdPrint("  (nothing)");return;}
  const w=rows.reduce((a,r)=>Math.max(a,String(r[0]).length),0);
  rows.forEach(r=>cmdPrint("  "+String(r[0]).padEnd(w+2)+String(r[1]==null?"":r[1])));
}
function cmdStatusLine(){
  return `files ${RUNS.length} · results ${RUNS.reduce((a,r)=>a+((r.wells||[]).length),0)} · selected ${SEL_STATE.ids.size} · profile ${SOP.name} v${SOP.version}`;
}
function selOptionRuleBase(id,key){
  const exact=SEL_OPTION_RULES[id];
  return (exact&&exact[key])||(id.startsWith("cc:")&&SEL_OPTION_RULES["cc:*"][key])||(id.startsWith("data:")&&SEL_OPTION_RULES["data:*"][key])||(id.startsWith("rec:")&&SEL_OPTION_RULES["rec:*"][key])||(id.startsWith("img:")&&(SEL_OPTION_RULES[id]||SEL_OPTION_RULES["img:*"])[key]);
}
function selOptionRule(...args){return MISSY_HOOKS.invoke("selOptionRule",this,args,selOptionRuleBase);}

function selValidateOption(id,key,value){
  const rule=selOptionRule(id,key);if(!rule)throw new Error(`${id} does not accept option ${key}`);
  if(rule==="number"&&!Number.isFinite(Number(value)))throw new Error(`${key} must be numeric`);
  if(rule==="numberOrEmpty"&&(value!==""&&!Number.isFinite(Number(value))))throw new Error(`${key} must be numeric or empty`);
  if(rule==="integer"&&(!/^\d+$/.test(value)||Number(value)<0))throw new Error(`${key} must be a non-negative integer`);
  if(rule==="run"&&!(/^(all|\d+)$/.test(value)||RUNS.some(r=>runName(r)===value)))throw new Error(`${key} must identify a loaded run or all`);
  if(rule==="chartSet"&&value!=="*"&&!/^[A-Za-z0-9_,-]+$/.test(value))throw new Error(`${key} must be * or a chart/group list`);
  if(Array.isArray(rule)&&!rule.includes(value))throw new Error(`${key} must be one of ${rule.join(", ")}`);
}
function selParseCommand(arg){
  const tokens=String(arg||"").trim().split(/\s+/).filter(Boolean),patterns=[],opts={};
  for(const t of tokens){const i=t.indexOf("=");if(i<1)patterns.push(t);else{const k=t.slice(0,i),v=t.slice(i+1);if(k in opts)throw new Error(`duplicate option ${k}`);opts[k]=v;}}
  if(!patterns.length)throw new Error("an item pattern is required");
  const ids=selMatchAll(patterns.join(" "));if(!ids.length)throw new Error(`nothing matches ${patterns.join(" ")}`);
  for(const id of ids)for(const [k,v] of Object.entries(opts))selValidateOption(id,k,v);
  return {ids,opts};
}
function selApplyOptions(ids,opts){ids.forEach(id=>{SEL_STATE.options[id]=Object.assign({},SEL_STATE.options[id]||{},opts);});}
async function cmdExecBase(raw){
  const line=String(raw||"").trim();
  if(!line||line.startsWith("#"))return;
  const sp=line.indexOf(" "),cmd=(sp<0?line:line.slice(0,sp)).toLowerCase(),arg=sp<0?"":line.slice(sp+1).trim();
  switch(cmd){
    case "help":case "?":cmdTable(CMD_HELP);break;
    case "list":{
      const which=(arg||"all").toLowerCase();
      const items=which==="images"?selImageItems():which==="data"||which==="tables"?selDataItems():selCatalogue();
      cmdPrint(items.length+" item(s):");
      cmdTable(items.map(x=>[x.id,(x.ready()?"":"(not available yet) ")+x.title]));
      break;}
    case "select":case "add":{
      if(!arg){cmdPrint("select what? try: select img:*","warn");break;}
      const plan=selParseCommand(arg);selAdd(plan.ids.join(" "));selApplyOptions(plan.ids,plan.opts);
      cmdPrint(`selected ${plan.ids.length}: ${plan.ids.join(", ")}`,"ok");break;}
    case "deselect":case "remove":{
      const m=selRemove(arg);
      cmdPrint(m.length?`deselected ${m.length}`:`nothing matches ${arg}`,m.length?"ok":"warn");break;}
    case "only":{const plan=selParseCommand(arg);selClear();selAdd(plan.ids.join(" "));selApplyOptions(plan.ids,plan.opts);cmdPrint(`selection is now ${plan.ids.length} item(s)`,"ok");break;}
    case "set":{const plan=selParseCommand(arg);if(plan.ids.some(id=>!SEL_STATE.ids.has(id)))throw new Error("set requires selected items");selApplyOptions(plan.ids,plan.opts);cmdPrint(`options updated for ${plan.ids.length} item(s)`,"ok");break;}
    case "show":{const plan=selParseCommand(arg);plan.ids.forEach(id=>cmdPrint(`${id}: ${JSON.stringify(SEL_STATE.options[id]||{})}`));break;}
    case "reset":{const plan=selParseCommand(arg);plan.ids.forEach(id=>delete SEL_STATE.options[id]);cmdPrint(`options reset for ${plan.ids.length} item(s)`,"ok");break;}
    case "clear":selClear();SEL_STATE.options=Object.create(null);cmdPrint("selection emptied","ok");break;
    case "selection":{
      const s=selSelected();
      cmdPrint(s.length+" selected:");cmdTable(s.map(x=>[x.id,x.title]));break;}
    case "runs":
      cmdPrint(RUNS.length?"loaded runs:":"no file has been read yet");
      cmdTable(RUNS.map((r,i)=>[String(i),runName(r)+"  ("+((r.wells||[]).length)+" results)"]));break;
    case "run":{
      if(String(arg).toLowerCase()==="all"){SEL_STATE.figureScope="all";cmdPrint("standard figures: every compatible loaded run, separately; tables: all loaded data","ok");break;}
      const n=Number(arg);
      if(!RUNS.length){cmdPrint("no file has been read yet","warn");break;}
      if(!Number.isFinite(n)||n<0||n>=RUNS.length){cmdPrint(`run must be 0..${RUNS.length-1}`,"warn");break;}
      SEL_STATE.run=n;SEL_STATE.figureScope="selected";cmdPrint("standard figures: "+runName(RUNS[n])+"; tables still cover all loaded data","ok");break;}
    case "lab":sopLab().name=arg;sopProfileEdited(true);cmdPrint("laboratory: "+(arg||"(cleared)"),"ok");break;
    case "analyst":sopLab().analyst=arg;sopProfileEdited(true);cmdPrint("analysis by: "+(arg||"(cleared)"),"ok");break;
    case "title":SEL_STATE.title=arg;cmdPrint("report title: "+(arg||"(default)"),"ok");break;
    case "profile":
      cmdTable([["name",SOP.name],["version",SOP.version],["laboratory",sopLabName()||"not stated"],
        ["analyst",sopAnalystName()||"not stated"],["checksum","sha256:"+sopHash()]]);break;
    case "status":cmdPrint(cmdStatusLine());break;
    case "issues":{
      const want=arg?arg.toLowerCase():"",rows=issueOverviewRows(issueSelectedRunIndexes()),groups=new Map();
      rows.forEach(r=>{if(want&&!(r.category.toLowerCase().includes(want)||r.finding.toLowerCase().includes(want)))return;const g=groups.get(r.category)||{n:0,e:0,r:0,runs:new Set()};g.n++;if(r.severity==="error")g.e++;else if(r.severity==="review")g.r++;g.runs.add(r.experiment);groups.set(r.category,g);});
      if(!groups.size){cmdPrint("no grouped problem was found for the selected experiments","ok");break;}
      cmdPrint(`grouped problems across ${issueSelectedRunIndexes().length} experiment(s):`);cmdTable([...groups].sort((a,b)=>b[1].n-a[1].n).map(([k,v])=>[k,`${v.n} finding(s) · ${v.e} error · ${v.r} review · ${v.runs.size} experiment(s)` ]));break;
    }
    case "curves":{
      REVIEW_STATE.issueCategory=arg?ISSUE_CATEGORY_ORDER.find(c=>c.toLowerCase().includes(arg.toLowerCase()))||arg:"Amplification / curve shape";
      cmdPrint("opening the grouped problem-curve overview","ok");cmdClose();showTab("review");showReviewSheet("overview");break;
    }
    case "template":cmdPrint("writing selection.csv…");download("selection_template.csv",selCsvTemplate(),"text/csv");cmdPrint("selection_template.csv written","ok");break;
    case "pdf":{
      if(!SEL_STATE.ids.size){cmdPrint("nothing is selected — try: select images","warn");break;}
      cmdPrint("building the report…");
      const n=await selDownloadReport(arg);
      cmdPrint(`report written, ${n.toLocaleString()} bytes`,"ok");break;}
    case "zip":{
      if(!SEL_STATE.ids.size){cmdPrint("nothing is selected — try: select all","warn");break;}
      cmdPrint("building the archive…");
      const n=selDownloadZip(arg);
      cmdPrint(`archive written, ${n} entries`,"ok");break;}
    case "script":cmdScriptToggle(true);cmdPrint("paste the procedure, then press Run");break;
    case "close":case "quit":case "exit":cmdClose();break;
    default:cmdPrint("unknown command: "+cmd+"   (help lists them)","warn");
  }
}
function cmdExec(...args){return MISSY_HOOKS.invoke("cmdExec",this,args,cmdExecBase);}

async function cmdRunLine(raw){
  if(CMD.busy)return;
  CMD.busy=true;
  cmdPrint("> "+raw,"echo");
  try{await cmdExec(raw);}
  catch(e){cmdPrint("error: "+(e&&e.message||e),"bad");}
  finally{CMD.busy=false;cmdEl("cmd-status").textContent=cmdStatusLine();}
}
async function cmdRunScript(text){
  const lines=String(text||"").split(/\r?\n/);
  cmdPrint("running "+lines.filter(l=>l.trim()&&!l.trim().startsWith("#")).length+" line(s) of script","ok");
  for(const l of lines){
    if(!l.trim()||l.trim().startsWith("#"))continue;
    await cmdRunLine(l.trim());
  }
  cmdPrint("script finished","ok");
}
function cmdScriptToggle(on){
  const box=cmdEl("cmd-script-wrap");if(!box)return;
  const show=on==null?box.hasAttribute("hidden"):!!on;
  if(show)box.removeAttribute("hidden");else box.setAttribute("hidden","");
}
function cmdOpen(){
  CMD.open=true;document.getElementById("cmdm").classList.add("on");
  const out=cmdEl("cmd-out");
  if(out&&!out.childElementCount){
    cmdPrint("Command mode. Type help for the list of commands.");
    cmdPrint("A procedure can be pasted as a script: press Script, paste, then Run.");
  }
  cmdEl("cmd-status").textContent=cmdStatusLine();
  const i=cmdEl("cmd-in");if(i)setTimeout(()=>i.focus(),0);
}
function cmdClose(){CMD.open=false;document.getElementById("cmdm").classList.remove("on");}
function cmdToggle(){CMD.open?cmdClose():cmdOpen();}
function cmdInit(){
  const i=cmdEl("cmd-in");if(!i)return;
  i.addEventListener("keydown",e=>{
    if(e.key==="Enter"){
      const v=i.value;i.value="";
      if(v.trim()){CMD.history.push(v);CMD.at=CMD.history.length;}
      if(/\n/.test(v))cmdRunScript(v);else cmdRunLine(v);
      e.preventDefault();return;
    }
    if(e.key==="ArrowUp"){if(CMD.at>0){CMD.at--;i.value=CMD.history[CMD.at]||"";}e.preventDefault();return;}
    if(e.key==="ArrowDown"){if(CMD.at<CMD.history.length-1){CMD.at++;i.value=CMD.history[CMD.at]||"";}else{CMD.at=CMD.history.length;i.value="";}e.preventDefault();return;}
    if(e.key==="Escape"){cmdClose();e.preventDefault();}
  });
  i.addEventListener("paste",e=>{
    const t=(e.clipboardData||window.clipboardData).getData("text");
    if(t&&/\n/.test(t)){e.preventDefault();cmdScriptToggle(true);cmdEl("cmd-script").value=t;cmdPrint("a multi-line paste went to the script box; press Run");}
  });
  const run=cmdEl("cmd-script-run");if(run)run.onclick=()=>{const box=cmdEl("cmd-script");cmdRunScript(box.value||box.getAttribute("placeholder")||"");};
  const tgl=cmdEl("cmd-script-toggle");if(tgl)tgl.onclick=()=>cmdScriptToggle();
  document.addEventListener("keydown",e=>{if(CMD.open&&e.key==="Escape"&&e.target!==i)cmdClose();});
  const cl=cmdEl("cmd-close");if(cl)cl.onclick=cmdClose;
  const cls=cmdEl("cmd-clear");if(cls)cls.onclick=()=>{cmdEl("cmd-out").innerHTML="";};
}

/* ---------- 8 . Assisted mode ----------
   The same catalogue as a checklist, for an operator who would rather see the
   choices than remember them. The selection can leave as a CSV and come back
   as one, so a laboratory can keep its own standing report definition in a
   file and hand it to the page. */
const AST={open:false};
function astEl(id){return document.getElementById(id);}
function astRenderBase(){
  const box=astEl("ast-list");if(!box)return;
  const cat=selCatalogue().filter(reportItemVisible),groups=uniq(cat.map(x=>x.group));
  box.innerHTML=groups.map(g=>{
    const items=cat.filter(x=>x.group===g);
    return `<section class="ast-group"><h3>${esc(g)} <span class="ast-count">${items.length}</span>
      <button type="button" class="ghost ast-all" data-group="${esc(g)}">all</button>
      <button type="button" class="ghost ast-none" data-group="${esc(g)}">none</button></h3>
      <div class="ast-items">${items.map(x=>`<label class="ast-item${x.ready()?"":" ast-off"}">
        <input type="checkbox" data-id="${esc(x.id)}"${SEL_STATE.ids.has(x.id)?" checked":""}${x.ready()?"":" disabled"}>
        <span class="ast-title">${esc(x.title)}</span>
        <span class="ast-id">${esc(x.id)}</span>
        <span class="ast-note">${esc(x.ready()?(x.note||""):"not available until a file is read")}</span>
      </label>`).join("")}</div></section>`;
  }).join("");
  box.querySelectorAll("input[data-id]").forEach(cb=>cb.onchange=()=>{
    if(cb.checked)SEL_STATE.ids.add(cb.dataset.id);else SEL_STATE.ids.delete(cb.dataset.id);
    astCount();
  });
  box.querySelectorAll(".ast-all").forEach(b=>b.onclick=()=>{
    selCatalogue().filter(x=>x.group===b.dataset.group&&reportItemVisible(x)).forEach(x=>SEL_STATE.ids.add(x.id));astRender();});
  box.querySelectorAll(".ast-none").forEach(b=>b.onclick=()=>{
    selCatalogue().filter(x=>x.group===b.dataset.group).forEach(x=>SEL_STATE.ids.delete(x.id));astRender();});
  const runSel=astEl("ast-run");
  if(runSel){
    runSel.innerHTML='<option value="all">'+esc(ui('All loaded runs - separate figures per run'))+'</option>'+RUNS.map((r,i)=>`<option value="${i}">${esc(r.file||runName(r))}</option>`).join("");
    runSel.value=SEL_STATE.figureScope==='all'?'all':String(selRunIndex());
  }
  astEl("ast-lab").value=sopLabName();
  astEl("ast-analyst").value=sopAnalystName();
  astEl("ast-title").value=SEL_STATE.title;
  astCount();
}
function astRender(...args){return MISSY_HOOKS.invoke("astRender",this,args,astRenderBase);}

function astCount(){
  const el=astEl("ast-count");if(!el)return;
  const s=selSelected();
  el.textContent=`${s.length} selected · ${s.filter(x=>x.kind==="image").length} figure(s) · ${s.filter(x=>x.kind==="data").length} table(s)`;
}
function astOutput(){
  const r=document.querySelector('#astm input[name="ast-out"]:checked');
  return r?r.value:"pdf";
}
async function astBuild(){
  const msg=astEl("ast-msg");
  if(!SEL_STATE.ids.size){msg.textContent="Choose at least one figure or table first.";msg.className="ast-msg warn";return;}
  const out=astOutput();
  msg.textContent="Building…";msg.className="ast-msg";
  try{
    if(out==="pdf"||out==="both"){const n=await selDownloadReport();msg.textContent=`Report written (${n.toLocaleString()} bytes).`;}
    if(out==="zip"||out==="both"){const n=selDownloadZip();msg.textContent=(out==="both"?msg.textContent+" ":"")+`Archive written (${n} entries).`;}
    msg.className="ast-msg ok";
  }catch(e){msg.textContent="Could not build: "+(e&&e.message||e);msg.className="ast-msg bad";}
}
function astOpen(){AST.open=true;document.getElementById("astm").classList.add("on");astRender();}
function astClose(){AST.open=false;document.getElementById("astm").classList.remove("on");}
function astToggle(){AST.open?astClose():astOpen();}
function astInit(){
  const c=astEl("ast-close");if(c)c.onclick=astClose;
  const t=astEl("ast-template");if(t)t.onclick=()=>download("selection_template.csv",selCsvTemplate(),"text/csv");
  const issues=astEl("ast-issues");if(issues)issues.onclick=()=>{astClose();showTab("review");showReviewSheet("overview");};
  const f=astEl("ast-file");
  if(f)f.onchange=()=>{
    const file=f.files&&f.files[0];if(!file)return;
    const rd=new FileReader();
    rd.onload=()=>{
      const msg=astEl("ast-msg");
      try{
        const r=selApplyCsv(String(rd.result||""));
        msg.textContent=`Applied ${r.applied} of ${r.rows} row(s).`+(r.unknown.length?` ${r.unknown.length} unknown identifier(s) ignored: ${r.unknown.slice(0,4).join(", ")}.`:"");
        msg.className="ast-msg ok";astRender();
      }catch(e){msg.textContent="Could not read that file: "+(e&&e.message||e);msg.className="ast-msg bad";}
      f.value="";
    };
    rd.readAsText(file);
  };
  const b=astEl("ast-build");if(b)b.onclick=astBuild;
  const lab=astEl("ast-lab");if(lab)lab.onchange=()=>{sopLab().name=lab.value.trim();sopProfileEdited(true);};
  const an=astEl("ast-analyst");if(an)an.onchange=()=>{sopLab().analyst=an.value.trim();sopProfileEdited(true);};
  const ti=astEl("ast-title");if(ti)ti.onchange=()=>{SEL_STATE.title=ti.value.trim();};
  const rs=astEl("ast-run");if(rs)rs.onchange=()=>{SEL_STATE.figureScope=rs.value==="all"?"all":"selected";if(rs.value!=="all")SEL_STATE.run=Number(rs.value)||0;astRender();};
  document.addEventListener("keydown",e=>{if(AST.open&&e.key==="Escape")astClose();});
}
function modesInit(){
  const c=document.getElementById("sb-command");if(c)c.onclick=cmdToggle;
  const a=document.getElementById("sb-assist");if(a)a.onclick=astToggle;
  cmdInit();astInit();
}

document.addEventListener("DOMContentLoaded",boot);
document.addEventListener("DOMContentLoaded",modesInit);
