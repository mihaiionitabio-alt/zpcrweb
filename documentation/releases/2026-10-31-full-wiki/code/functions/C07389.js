function downloadExportFiles(kind,files){
  if(!files.length)throw new Error("No files were generated for "+kind);
  if(files.length===1){const f=files[0];download(f.name,f.data,f.mime);return;}
  const used=new Set(),entries=[];
  files.forEach(f=>{
    const original=String(f.name),dot=original.lastIndexOf("."),stem=dot>0?original.slice(0,dot):original,ext=dot>0?original.slice(dot):"";
    let name=original,n=2;while(used.has(name))name=stem+"_"+(n++)+ext;
    used.add(name);entries.push({name,data:f.data});
  });
  const manifest=entries.map(e=>{const bytes=bytesFrom(e.data);return {name:e.name,bytes:bytes.length,sha256:sha256Hex(bytes)};});
  // Reserve metadata names so they cannot collide with exported data filenames.
  let manifestName="export_manifest.json";while(used.has(manifestName))manifestName="_"+manifestName;
  entries.push({name:manifestName,data:JSON.stringify({format:kind,fileCount:manifest.length,files:manifest},null,2)+"\n"});
  download(baseName()+"_"+kind+".zip",makeStoredZip(entries),"application/zip");
}