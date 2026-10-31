function selDownloadZip(name){
  const entries=withExportNames(selZipEntries);
  download(safeName(name||((sopLabName()||baseName())+"_selection"))+".zip",makeStoredZip(entries),"application/zip");
  return entries.length;
}