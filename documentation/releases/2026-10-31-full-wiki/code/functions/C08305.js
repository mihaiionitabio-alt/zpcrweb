e=>{
    const t=(e.clipboardData||window.clipboardData).getData("text");
    if(t&&/\n/.test(t)){e.preventDefault();cmdScriptToggle(true);cmdEl("cmd-script").value=t;cmdPrint("a multi-line paste went to the script box; press Run");}
  }