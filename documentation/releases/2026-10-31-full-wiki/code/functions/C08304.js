e=>{
    if(e.key==="Enter"){
      const v=i.value;i.value="";
      if(v.trim()){CMD.history.push(v);CMD.at=CMD.history.length;}
      if(/\n/.test(v))cmdRunScript(v);else cmdRunLine(v);
      e.preventDefault();return;
    }
    if(e.key==="ArrowUp"){if(CMD.at>0){CMD.at--;i.value=CMD.history[CMD.at]||"";}e.preventDefault();return;}
    if(e.key==="ArrowDown"){if(CMD.at<CMD.history.length-1){CMD.at++;i.value=CMD.history[CMD.at]||"";}else{CMD.at=CMD.history.length;i.value="";}e.preventDefault();return;}
    if(e.key==="Escape"){cmdClose();e.preventDefault();}
  }