e=>{                 /* a sheet answers the number keys */
    if(!MG.open||!MG.sheet)return;
    if(e.key==="Escape"||e.key==="0"){mgSheetClose();e.preventDefault();return;}
    if(/^[1-9]$/.test(e.key)){mgSheetPick(+e.key-1);e.preventDefault();}
  }