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