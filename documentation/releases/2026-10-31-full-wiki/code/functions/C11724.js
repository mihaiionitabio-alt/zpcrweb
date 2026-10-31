async s=>{
 let text;if(new TextDecoder().decode(s.bytes.subarray(0,100)).replace(/^\uFEFF/,'').trimStart().startsWith('<'))text=registeredXML(s.bytes);
 else{const entries=await rdmlEntries(s.bytes.buffer.slice(s.bytes.byteOffset,s.bytes.byteOffset+s.bytes.byteLength),s.archive);let e=entries.find(e=>/^rdml_data\.xml$/i.test(e.name));if(!e){const candidates=entries.filter(e=>{const d=new DOMParser().parseFromString(registeredXML(e.bytes),'application/xml');return !d.querySelector('parsererror')&&d.documentElement.localName==='rdml';});if(candidates.length!==1)throw Error('RDML requires exactly one unambiguous RDML XML document');e=candidates[0];}text=registeredXML(e.bytes);}
 return cfxNormalizeRDML(rdmlParse(text,s.name,s.bytes),text,s.name,s.bytes);
}