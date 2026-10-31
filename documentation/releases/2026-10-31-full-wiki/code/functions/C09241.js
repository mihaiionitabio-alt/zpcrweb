function pcrdDecryptContainer(raw,check,password){
 if(raw.length<12)throw Error('PCRD encrypted payload is too short');
 let a=0x12345678,b=0x23456789,c=0x34567890;
 const update=n=>{a=(pcrdCRC_TABLE[(a^n)&255]^(a>>>8))>>>0;b=(Math.imul((b+(a&255))>>>0,134775813)+1)>>>0;c=(pcrdCRC_TABLE[(c^(b>>>24))&255]^(c>>>8))>>>0;};
 for(let i=0;i<password.length;i++)update(password.charCodeAt(i)&255);
 const result=new Uint8Array(raw.length-12);let last=0;
 for(let i=0;i<raw.length;i++){const t=(c|2)&65535,n=raw[i]^((Math.imul(t,t^1)>>>8)&255);update(n);if(i<12)last=n;else result[i-12]=n;}
 if(last!==check){pcrdForgetPassword();throw Error('REVIEW: incorrect PCRD password or damaged file. No measurements imported; retry with the correct password.');}
 return result;
}