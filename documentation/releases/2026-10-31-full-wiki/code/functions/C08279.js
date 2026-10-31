function selParseCommand(arg){
  const tokens=String(arg||"").trim().split(/\s+/).filter(Boolean),patterns=[],opts={};
  for(const t of tokens){const i=t.indexOf("=");if(i<1)patterns.push(t);else{const k=t.slice(0,i),v=t.slice(i+1);if(k in opts)throw new Error(`duplicate option ${k}`);opts[k]=v;}}
  if(!patterns.length)throw new Error("an item pattern is required");
  const ids=selMatchAll(patterns.join(" "));if(!ids.length)throw new Error(`nothing matches ${patterns.join(" ")}`);
  for(const id of ids)for(const [k,v] of Object.entries(opts))selValidateOption(id,k,v);
  return {ids,opts};
}