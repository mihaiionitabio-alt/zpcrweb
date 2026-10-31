function overviewProtocol(run){
 if(run.cfxRDML?.protocolSHA256)return 'CFX RDML protocol SHA-256 '+run.cfxRDML.protocolSHA256;
 const p=run.protocol||{};if((p.programs||[]).some(x=>(x.segments||[]).length))return sopCanonical({programs:p.programs,channels:p.channels,block:p.block,detectionFormatName:p.detectionFormatName});
 return '(protocol not decoded)';
}