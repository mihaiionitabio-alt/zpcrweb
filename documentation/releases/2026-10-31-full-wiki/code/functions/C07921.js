async function detectReader(source){
 const b=source.bytes,zip=b.length>4&&b[0]===80&&b[1]===75,names=zip?zipMemberNames(b):null;
 const context={...source,zipNames:names};
 const matches=[];for(const reader of MISSY_READERS)if(reader.probe&&await reader.probe(context))matches.push(reader);
 if(matches.length>1)throw Error('Ambiguous file content: '+matches.map(x=>x.id).join(', '));
 if(matches.length)return matches[0];
 return MISSY_READERS.find(r=>(r.extensions||[]).some(e=>source.name.toLowerCase().endsWith(e)))||null;
}