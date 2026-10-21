/* Versioned reader boundary. A decoder returns evidence, never changes UI/state. */
const MISSY_READERS=[];
const MISSY_MODEL_VERSION=2;
function registerReader(reader){
 if(!reader.id||!reader.version||typeof reader.decode!=='function'||MISSY_READERS.some(r=>r.id===reader.id))throw Error('Invalid/duplicate reader registration');
 MISSY_READERS.push(Object.freeze(reader));
}
function readerExtensions(){return [...new Set(MISSY_READERS.flatMap(r=>r.extensions||[]))];}
function readerAccept(){return readerExtensions().concat('.zip').join(',');}
function readerById(id){const r=MISSY_READERS.find(r=>r.id===id);if(!r)throw Error('Reader is not available: '+id);return r;}
function registeredXML(bytes){const s=new TextDecoder().decode(bytes);if(/<!DOCTYPE|<!ENTITY/i.test(s))throw Error('XML DOCTYPE/ENTITY declarations are unsupported');return s;}
function zipMemberNames(bytes){
 const v=new DataView(bytes.buffer,bytes.byteOffset,bytes.byteLength);let e=-1;
 for(let i=bytes.length-22;i>=Math.max(0,bytes.length-65557);i--)if(v.getUint32(i,true)===0x06054b50){e=i;break;}
 if(e<0)throw Error('ZIP central directory missing');
 const count=v.getUint16(e+10,true),size=v.getUint32(e+12,true);let at=v.getUint32(e+16,true);
 if(v.getUint16(e+4,true)||v.getUint16(e+6,true)||count>10000||at+size>e)throw Error('ZIP limits/directory invalid');
 const names=[];for(let i=0;i<count;i++){if(at+46>e||v.getUint32(at,true)!==0x02014b50)throw Error('ZIP directory bounds');const nl=v.getUint16(at+28,true),el=v.getUint16(at+30,true),cl=v.getUint16(at+32,true);if(at+46+nl+el+cl>e)throw Error('ZIP filename bounds');names.push(new TextDecoder().decode(bytes.subarray(at+46,at+46+nl)));at+=46+nl+el+cl;}return names;
}
async function detectReader(source){
 const b=source.bytes,zip=b.length>4&&b[0]===80&&b[1]===75,names=zip?zipMemberNames(b):null;
 const context={...source,zipNames:names};
 const matches=[];for(const reader of MISSY_READERS)if(reader.probe&&await reader.probe(context))matches.push(reader);
 if(matches.length>1)throw Error('Ambiguous file content: '+matches.map(x=>x.id).join(', '));
 if(matches.length)return matches[0];
 return MISSY_READERS.find(r=>(r.extensions||[]).some(e=>source.name.toLowerCase().endsWith(e)))||null;
}
async function stageReaderFile(file,bytes,archive=null,path=null){
 const source={name:file.name,path:path||file.name,bytes,archive,zip:null};
 const reader=await detectReader(source);if(!reader)return null;
 return {...source,kind:reader.id};
}
async function decodeReaderSource(source){
 const reader=readerById(source.kind),out=await reader.decode(source),runs=Array.isArray(out)?out:[out];
 if(!runs.length)throw Error('Reader produced no run records');
 for(const run of runs)validatePublicRun(run,source);
 const claimed=runs.filter(r=>r.meta?.sourceSHA256);if(claimed.length){const actual=await sourceSha256(source.bytes);if(claimed.some(r=>r.meta.sourceSHA256.toLowerCase()!==actual))throw Error(source.name+': source SHA-256 disagrees with decoded evidence');}
 for(const run of runs){run.reader={id:reader.id,version:reader.version,modelVersion:MISSY_MODEL_VERSION};run.capabilities={storedResults:run.wells.length>0||(run.tmWells||[]).length>0,rawAcquisitions:!!(run.zpcr||run.pcrd)||Object.keys(run.allCurves||{}).length>0,independentAnalysis:!!run.pcrd,encryptedInventory:!!run.pcrdLocked};}
 return runs;
}
