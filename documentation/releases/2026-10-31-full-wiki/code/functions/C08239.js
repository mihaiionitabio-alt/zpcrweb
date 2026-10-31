function selReadme(chosen){
  const L=[];
  L.push("Selected report material");
  L.push("");
  L.push("Laboratory: "+(sopLabName()||ui("not stated")));
  L.push("Analysis by: "+(sopAnalystName()||ui("not stated")));
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