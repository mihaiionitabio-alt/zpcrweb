
/* Raw ZPCR adapter: no dye unmixing, Cq, Tm or analytical calls. */
async function decodeZpcr(source){
 const bytes=source.bytes,ab=bytes.buffer.slice(bytes.byteOffset,bytes.byteOffset+bytes.byteLength),z=await ZPCR.parseZpcr(ab);
 if(!z.reads.length)throw Error('REVIEW: no plate reads in this ZPCR');
 if(z.archive.names.filter(n=>/\.plateread$/i.test(n)).length!==z.reads.length)throw Error('REVIEW: one or more plate reads could not be decoded: '+z.issues.join('; '));
 if(z.grid.referenceRows===null)throw Error('REVIEW: sample/reference boundary is not established');
 if(z.grid.sampleRows!==8||z.grid.cols!==12)throw Error('REVIEW: this importer currently supports 96-well CFX geometry only');
 const first=z.reads[0];if(z.reads.some(r=>r.rows!==first.rows||r.cols!==first.cols||r.channels!==first.channels))throw Error('REVIEW: conflicting acquisition geometries');
 const meta={ZPCRProtocolSHA256:await sourceSha256(new TextEncoder().encode(z.protocolText||'')),name:source.name,InstrumentName:'Bio-Rad CFX '+(z.instrument.block||''),InstrumentID:z.instrument.base||'',SerialNumber:z.instrument.base||'',StartTime:z.runInfo.RunStartTime||'',SWVersion:'',InstrumentVersion:z.instrument.firmware||'',MacroName:'',Notes:'Raw acquisition only; no Cq, Tm, dye unmixing or sample calls. REVIEW.',Platform:'Bio-Rad ZPCR',sourceSHA256:await sourceSha256(bytes),sourceBytes:bytes.length};
 const allCurves={},plate={}; // Raw multi-step curves live in the isolated ZPCR view, never synthetic results.
 for(let pos=0;pos<96;pos++)plate[pos]={name:'',sampleId:'',notes:'Sample identity not decoded',channels:{},subsets:[]};
 const steps=[...new Set(z.reads.map(r=>r.step))];
 return {file:source.name,sourcePath:source.path||source.name,sourceArchive:source.archive||null,zip:source.zip||null,meta,platform:'Bio-Rad ZPCR',zpcr:z,rawOnly:true,wells:[],tmWells:[],genoResults:[],rqResults:[],otherResults:[],allCurves,plate,subsets:[],analyses:[],nCycles:0,acqStats:[],acqError:null,acqMelt:null,acqSegments:[],acqAcquisitions:z.reads.length,acqScalingFactors:[],identities:{},duplicates:0,namedPositions:0,maxPos:96,cols:12,rows:8,blockId:z.instrument.block||'',kinds:[],format:{signature:'ZPCR / ICFF',version:String(first.version.plateread)},integrity:{kind:'zpcr',entries:z.archive.entries,crcVerified:!z.archive.encrypted.length,verifiedScope:'Decoded unencrypted members only',encrypted:z.archive.encrypted},protocol:{programs:steps.map(step=>({name:'Read step '+step,cycles:z.reads.filter(r=>r.step===step).length,mode:'Raw acquisition',segments:[]})),channels:Array.from({length:first.channels},(_,i)=>({name:'Raw channel '+(i+1),active:true,ex:'',em:'',filterSet:'',activityBasis:'Stored channel; mask uninterpreted'})),block:{rowCount:8,colCount:12},setup:{maxPositions:96},analysisModes:[],detectionFormatName:'Uncalibrated optical channels'}};
}
function zpcrRows(run,kind){
 const z=run.zpcr,out=[];
 if(kind==='raw'){
  out.push(['source_sha256','file','member','scan_index','step','cycle','channel_1based','position_type','row_1based','column_1based','mean','sd','min','max']);
  for(const r of z.reads)for(let c=0;c<r.channels;c++)for(let row=0;row<r.rows;row++)for(let col=0;col<r.cols;col++){const w=ZPCR.zpcrWellStats(r,c,row,col);out.push([run.meta.sourceSHA256,run.file,r.name,r.scanIndex,r.step,r.cycle,c+1,row<z.grid.sampleRows?'sample':'reference',row+1,col+1,w.mean,w.sd,w.min,w.max]);}
 }else{
  out.push(['source_sha256','member','scan_index','step','cycle','timestamp','field','value','interpretation']);
  for(const r of z.reads){const add=(k,v,t)=>out.push([run.meta.sourceSHA256,r.name,r.scanIndex,r.step,r.cycle,r.dateText,k,v,t]);for(const [k,v]of Object.entries(r.temps))add(k,v.c,(v.kind==='setpoint'?'integer encoded; physical interpretation unresolved':v.kind+' interpretation')+'; degC');r.leds.forEach((v,c)=>add('LEDCURRENT'+(c+1),v,'DAC setting; not calibrated mA'));add('CHANNELMASK',r.channelMaskRaw,'verbatim; uninterpreted');add('ERRORNUMBER',r.errorNumber,'instrument code');for(let c=0;c<r.channels;c++){for(let k=0;k<4;k++)add('DARK.ch'+(c+1)+'.'+['mean','sd','min','max'][k],r.darkData?.[c*4+k]??'','raw detector counts');}}
 }
 return out;
}
function zpcrRawCSV(run,kind){return zpcrRows(run,kind).map(row=>row.map(v=>'"'+String(v??'').replace(/"/g,'""')+'"').join(',')).join('\r\n');}
