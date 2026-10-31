function zipMemberNames(bytes){
 const v=new DataView(bytes.buffer,bytes.byteOffset,bytes.byteLength);let e=-1;
 for(let i=bytes.length-22;i>=Math.max(0,bytes.length-65557);i--)if(v.getUint32(i,true)===0x06054b50){e=i;break;}
 if(e<0)throw Error('ZIP central directory missing');
 const count=v.getUint16(e+10,true),size=v.getUint32(e+12,true);let at=v.getUint32(e+16,true);
 if(v.getUint16(e+4,true)||v.getUint16(e+6,true)||count>10000||at+size>e)throw Error('ZIP limits/directory invalid');
 const names=[];for(let i=0;i<count;i++){if(at+46>e||v.getUint32(at,true)!==0x02014b50)throw Error('ZIP directory bounds');const nl=v.getUint16(at+28,true),el=v.getUint16(at+30,true),cl=v.getUint16(at+32,true);if(at+46+nl+el+cl>e)throw Error('ZIP filename bounds');names.push(new TextDecoder().decode(bytes.subarray(at+46,at+46+nl)));at+=46+nl+el+cl;}return names;
}