async function selBuildReportBase(){
  const chosen=selSelected();
  if(!chosen.length)throw new Error("nothing is selected");
  const doc=pdfDoc();
  doc.text(selReportTitle(),20,true);
  doc.gap(4);doc.rule();doc.gap(6);
  const meta=[
    ["Laboratory",sopLabName()||ui("not stated")],
    ["Analysis by",sopAnalystName()||ui("not stated")],
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
    const lines=values.flatMap(x=>pdfWrap(["Figure coverage","Table coverage"].includes(k)?reportDisplay(x):x,valueW,size,false));
    doc.room(line+4);
    doc.text(k,size,true);doc.y+=line;
    lines.forEach(x=>{if(!doc.room(line)){doc.text(k+" (continued)",size,true);doc.y+=line;}doc.text(x,size,false,labelW,undefined,true);});
  });
  doc.gap(10);doc.rule();doc.gap(4);
  doc.para("Stored vendor results are kept unchanged. Statistics and diagnostic plots are independently derived by MISSY and are descriptive. Research Use Only. Not validated for clinical or instrument qualification decisions. This report does not replace the vendor QC report or validated laboratory procedures.",9,false);
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
        const jpg=await svgToJpeg(reportSvg(f.svg),2);
        if(jpg){
          let w=doc.width,h=w*jpg.natH/jpg.natW;
          const maxH=PDF_PAGE.h-2*PDF_PAGE.margin-100;if(h>maxH){h=maxH;w=h*jpg.natW/jpg.natH;}
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
      selTableBlock(doc,rows,null,x.tableOptions||{});
    }
  }
  const bytes=doc.build();
  SEL_STATE.lastReport={bytes:bytes.length,items:chosen.length,at:new Date().toISOString()};
  return bytes;
}