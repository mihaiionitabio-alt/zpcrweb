function cmdTable(rows,literalValues=false){
  if(!rows.length){cmdPrint("  (nothing)");return;}
  const w=rows.reduce((a,r)=>Math.max(a,String(r[0]).length),0);
  rows.forEach(r=>{const div=document.createElement("div"),key=document.createElement("span"),value=document.createElement("span");div.className="cmd-line";key.setAttribute("data-i18n-skip","");key.textContent="  "+String(r[0]).padEnd(w+2);if(literalValues)value.setAttribute("data-i18n-skip","");value.textContent=String(r[1]??"");div.append(key,value);cmdEl("cmd-out").append(div);});
}