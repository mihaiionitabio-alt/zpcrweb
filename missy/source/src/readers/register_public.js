/* Registration order does not override conflicting content signatures. */
registerReader({id:'ixo',version:'zenodo-23437639',extensions:['.ixo'],probe:s=>!s.zipNames&&/<objectstream\b[^>]*signature=["\']IXOS["\']/i.test(new TextDecoder().decode(s.bytes.subarray(0,2048))),decode:async s=>{const source={...s,text:s.text||new TextDecoder().decode(s.bytes)},r=await decodeIxo(source,'auto');await ccExtractOnLoad(r,source);return r;}});
registerReader({id:'eds',version:'zenodo-23437639',extensions:['.eds','.edt'],probe:s=>s.zipNames?.some(n=>/^apldbio\/sds\/experiment\.xml$/i.test(n)),decode:async s=>{const r=await decodeEds(s);await ccExtractOnLoad(r,s);return r;}});
registerReader({id:'rdml',version:'2026-10-21',extensions:['.rdml'],probe:s=>s.zipNames?.some(n=>/^rdml_data\.xml$/i.test(n))||!s.zipNames&&/<(?:\w+:)?rdml\b/.test(new TextDecoder().decode(s.bytes.subarray(0,4096))),decode:async s=>{
 let text;if(new TextDecoder().decode(s.bytes.subarray(0,100)).replace(/^\uFEFF/,'').trimStart().startsWith('<'))text=registeredXML(s.bytes);
 else{const entries=await rdmlEntries(s.bytes.buffer.slice(s.bytes.byteOffset,s.bytes.byteOffset+s.bytes.byteLength),s.archive);let e=entries.find(e=>/^rdml_data\.xml$/i.test(e.name));if(!e){const candidates=entries.filter(e=>{const d=new DOMParser().parseFromString(registeredXML(e.bytes),'application/xml');return !d.querySelector('parsererror')&&d.documentElement.localName==='rdml';});if(candidates.length!==1)throw Error('RDML requires exactly one unambiguous RDML XML document');e=candidates[0];}text=registeredXML(e.bytes);}
 return cfxNormalizeRDML(rdmlParse(text,s.name,s.bytes),text,s.name,s.bytes);
}});
registerReader({id:'zpcr',version:'2026-10-21',extensions:['.zpcr'],probe:s=>s.zipNames?.some(n=>/^RunInfo\.xml$/i.test(n))&&s.zipNames.some(n=>/\.plateread$/i.test(n)),decode:decodeZpcr});
registerReader({id:'pcrd',version:'2026-10-21',extensions:['.pcrd','.pcrd.xml'],probe:s=>!s.zipNames&&/<experimentalData2\b/.test(new TextDecoder().decode(s.bytes.subarray(0,2048))),decode:decodePcrd});
document.addEventListener('DOMContentLoaded',()=>{document.getElementById('file').accept=readerAccept();});

MISSY_HOOKS.seal();
