function maraEvidenceDetail(value){
 if(!String(value).startsWith('{'))return value;
 try{return Object.entries(JSON.parse(value)).map(([k,v])=>ui(k)+' = '+(typeof v==='number'?Number(v.toPrecision(8)):typeof v==='boolean'?ui(v?'pass':'fail'):String(v??'—'))).join('; ');}catch{return value;}
}