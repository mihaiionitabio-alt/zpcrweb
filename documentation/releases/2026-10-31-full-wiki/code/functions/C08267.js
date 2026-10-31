async function selDownloadReport(name){
  const bytes=await selWithExportNames(selBuildReport);
  download(safeName(name||((sopLabName()||baseName())+"_report"))+".pdf",bytes,"application/pdf");
  return bytes.length;
}