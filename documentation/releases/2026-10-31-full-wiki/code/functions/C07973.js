()=>{const m=pseudonymMap();if(!m.size)return;
    download(baseName()+"_pseudonym_map.csv","stored_name,pseudonym\n"+[...m].map(([a,b])=>`${csvq(a)},${csvq(b)}`).join("\n")+"\n","text/csv");}