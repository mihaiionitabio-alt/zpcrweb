async function cmdExecBase(raw){
  const line=String(raw||"").trim();
  if(!line||line.startsWith("#"))return;
  const sp=line.indexOf(" "),cmd=(sp<0?line:line.slice(0,sp)).toLowerCase(),arg=sp<0?"":line.slice(sp+1).trim();
  switch(cmd){
    case "help":case "?":CMD_HELP.forEach(r=>cmdPrint(r[0],"echo"));break;
    case "list":{
      const which=(arg||"all").toLowerCase();
      const items=which==="images"?selImageItems():which==="data"||which==="tables"?selDataItems():selCatalogue();
      const available=items.filter(reportItemVisible);
      cmdPrint(available.length+" item(s):");
      cmdTable(available.map(x=>[x.id,(x.ready()?"":"(not available yet) ")+x.title]));
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
      cmdTable(RUNS.map((r,i)=>[String(i),runName(r)+"  ("+((r.wells||[]).length)+" "+ui("results")+")"]),true);break;
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
      cmdTable([[ui("name"),SOP.name],[ui("version"),SOP.version],[ui("laboratory"),sopLabName()||ui("not stated")],
        [ui("analyst"),sopAnalystName()||ui("not stated")],[ui("checksum"),"sha256:"+sopHash()]],true);break;
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