()=>{
    if(!rows.length)return;
    download(baseName()+"_file_integrity.csv","file,check,expected,observed,meaning\n"+rows.map(r=>[r.file,r.type,r.expected,r.actual,r.detail].map(csvq).join(",")).join("\n")+"\n","text/csv");
  }