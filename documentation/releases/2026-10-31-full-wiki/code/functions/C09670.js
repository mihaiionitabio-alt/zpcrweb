next=>function(){return next().concat({
 id:'data:source_manifest',kind:'data',group:'Source provenance',title:'All loaded source files and checksums',
 note:'Full source inventory for every loaded format.\n'+RUNS.map(r=>'File: '+r.file+'\nSHA-256: '+(r.meta.sourceSHA256||'Not recorded')).join('\n'),
 ready:()=>RUNS.length>0,rows:()=>RUNS.map(r=>({filename:r.file,sha256:r.meta.sourceSHA256||'',bytes:r.meta.sourceBytes??'',format:r.reader?.id||''})),file:'source_manifest.csv',text(){return csvOf(this.rows());}
});}