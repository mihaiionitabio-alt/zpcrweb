async function decodeReaderSource(source){
 const reader=readerById(source.kind),out=await reader.decode(source),runs=Array.isArray(out)?out:[out];
 if(!runs.length)throw Error('Reader produced no run records');
 for(const run of runs)validatePublicRun(run,source);
 const claimed=runs.filter(r=>r.meta?.sourceSHA256);if(claimed.length){const actual=await sourceSha256(source.bytes);if(claimed.some(r=>r.meta.sourceSHA256.toLowerCase()!==actual))throw Error(source.name+': source SHA-256 disagrees with decoded evidence');}
 for(const run of runs){run.reader={id:reader.id,version:reader.version,modelVersion:MISSY_MODEL_VERSION};run.capabilities={storedResults:run.wells.length>0||(run.tmWells||[]).length>0,rawAcquisitions:!!(run.zpcr||run.pcrd)||Object.keys(run.allCurves||{}).length>0,independentAnalysis:!!run.pcrd,encryptedInventory:!!run.pcrdLocked};}
 return runs;
}