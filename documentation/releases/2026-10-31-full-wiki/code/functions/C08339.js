()=>{
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
  }