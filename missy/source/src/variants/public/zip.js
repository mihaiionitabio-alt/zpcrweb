/* ============================================================
   3. ZIP reading and writing (CRC-32 is used only to verify archive entries)
   ============================================================ */
const CRC_TABLE=(()=>{const t=new Uint32Array(256);for(let n=0;n<256;n++){let c=n;for(let k=0;k<8;k++)c=c&1?0xedb88320^(c>>>1):c>>>1;t[n]=c>>>0;}return t;})();
function crc32(bytes){bytes=bytesFrom(bytes);let c=0xffffffff;for(const b of bytes)c=CRC_TABLE[(c^b)&255]^(c>>>8);return (c^0xffffffff)>>>0;}
/* SHA-256 is kept synchronous and dependency-free so an offline file:// page
   records a cryptographic provenance anchor even where SubtleCrypto is not
   exposed. CRC-32 remains useful for ZIP integrity, but is not represented as
   a cryptographic checksum in the JSON-LD graph. */
async function sourceSha256(bytes){
  if(globalThis.crypto&&globalThis.crypto.subtle){
    try{const hash=await globalThis.crypto.subtle.digest("SHA-256",bytes);
      return Array.from(new Uint8Array(hash),v=>v.toString(16).padStart(2,"0")).join("");}catch(e){}
  }
  return sha256Hex(bytes);
}
function sha256Hex(bytes){
  bytes=bytesFrom(bytes);
  const K=new Uint32Array([
    0x428a2f98,0x71374491,0xb5c0fbcf,0xe9b5dba5,0x3956c25b,0x59f111f1,0x923f82a4,0xab1c5ed5,
    0xd807aa98,0x12835b01,0x243185be,0x550c7dc3,0x72be5d74,0x80deb1fe,0x9bdc06a7,0xc19bf174,
    0xe49b69c1,0xefbe4786,0x0fc19dc6,0x240ca1cc,0x2de92c6f,0x4a7484aa,0x5cb0a9dc,0x76f988da,
    0x983e5152,0xa831c66d,0xb00327c8,0xbf597fc7,0xc6e00bf3,0xd5a79147,0x06ca6351,0x14292967,
    0x27b70a85,0x2e1b2138,0x4d2c6dfc,0x53380d13,0x650a7354,0x766a0abb,0x81c2c92e,0x92722c85,
    0xa2bfe8a1,0xa81a664b,0xc24b8b70,0xc76c51a3,0xd192e819,0xd6990624,0xf40e3585,0x106aa070,
    0x19a4c116,0x1e376c08,0x2748774c,0x34b0bcb5,0x391c0cb3,0x4ed8aa4a,0x5b9cca4f,0x682e6ff3,
    0x748f82ee,0x78a5636f,0x84c87814,0x8cc70208,0x90befffa,0xa4506ceb,0xbef9a3f7,0xc67178f2]);
  const H=new Uint32Array([0x6a09e667,0xbb67ae85,0x3c6ef372,0xa54ff53a,0x510e527f,0x9b05688c,0x1f83d9ab,0x5be0cd19]);
  const bitLength=bytes.length*8,total=Math.ceil((bytes.length+9)/64)*64,msg=new Uint8Array(total);
  msg.set(bytes);msg[bytes.length]=0x80;
  const dv=new DataView(msg.buffer);dv.setUint32(total-8,Math.floor(bitLength/0x100000000),false);dv.setUint32(total-4,bitLength>>>0,false);
  const rotr=(v,n)=>(v>>>n)|(v<<(32-n)),w=new Uint32Array(64);
  for(let offset=0;offset<total;offset+=64){
    for(let i=0;i<16;i++)w[i]=dv.getUint32(offset+i*4,false);
    for(let i=16;i<64;i++){
      const a=w[i-15],b=w[i-2],s0=rotr(a,7)^rotr(a,18)^(a>>>3),s1=rotr(b,17)^rotr(b,19)^(b>>>10);
      w[i]=(w[i-16]+s0+w[i-7]+s1)>>>0;
    }
    let [a,b,c,d,e,f,g,h]=H;
    for(let i=0;i<64;i++){
      const s1=rotr(e,6)^rotr(e,11)^rotr(e,25),ch=(e&f)^(~e&g),t1=(h+s1+ch+K[i]+w[i])>>>0;
      const s0=rotr(a,2)^rotr(a,13)^rotr(a,22),maj=(a&b)^(a&c)^(b&c),t2=(s0+maj)>>>0;
      h=g;g=f;f=e;e=(d+t1)>>>0;d=c;c=b;b=a;a=(t1+t2)>>>0;
    }
    H[0]=(H[0]+a)>>>0;H[1]=(H[1]+b)>>>0;H[2]=(H[2]+c)>>>0;H[3]=(H[3]+d)>>>0;
    H[4]=(H[4]+e)>>>0;H[5]=(H[5]+f)>>>0;H[6]=(H[6]+g)>>>0;H[7]=(H[7]+h)>>>0;
  }
  return [...H].map(v=>v.toString(16).padStart(8,"0")).join("");
}
async function inflate(bytes,format){
  if(typeof DecompressionStream!=="function")
    throw new Error("This browser does not support DecompressionStream. Open the page in a current Chrome, Edge, Firefox or Safari release.");
  return new Uint8Array(await new Response(new Blob([bytes]).stream()
    .pipeThrough(new DecompressionStream(format))).arrayBuffer());
}

async function readZip(ab,archive,filter=/\.ixo$/i){
  const u8=new Uint8Array(ab),dv=new DataView(ab);let eocd=-1;
  for(let i=u8.length-22;i>=Math.max(0,u8.length-66000);i--){if(dv.getUint32(i,true)===0x06054b50){eocd=i;break;}}
  if(eocd<0)throw new Error("ZIP end-of-central-directory not found");
  const count=dv.getUint16(eocd+10,true);let ptr=dv.getUint32(eocd+16,true);const out=[];
  for(let i=0;i<count;i++){
    if(dv.getUint32(ptr,true)!==0x02014b50)throw new Error("ZIP central directory is corrupt");
    const method=dv.getUint16(ptr+10,true),crc=dv.getUint32(ptr+16,true),csize=dv.getUint32(ptr+20,true),usize=dv.getUint32(ptr+24,true);
    const nLen=dv.getUint16(ptr+28,true),eLen=dv.getUint16(ptr+30,true),cLen=dv.getUint16(ptr+32,true),lho=dv.getUint32(ptr+42,true);
    const name=new TextDecoder().decode(u8.subarray(ptr+46,ptr+46+nLen));
    ptr+=46+nLen+eLen+cLen;
    if(name.endsWith("/"))continue;
    if(usize>512*1024*1024||csize>u8.length)throw Error("ZIP member size limit");
    if(filter&&!filter.test(name))continue;
    const lnLen=dv.getUint16(lho+26,true),leLen=dv.getUint16(lho+28,true),start=lho+30+lnLen+leLen;
    const comp=u8.subarray(start,start+csize);
    let data;
    if(method===0)data=comp.slice();
    else if(method===8)data=await inflate(comp,"deflate-raw");
    else throw new Error(`ZIP entry ${name} uses unsupported compression method ${method}`);
    if(data.length!==usize)throw new Error(`ZIP entry ${name} size mismatch`);
    const actual=crc32(data);
    if(actual!==crc)throw new Error(`ZIP entry ${name} CRC-32 mismatch`);
    out.push({name:name.split("/").pop(),path:name,bytes:data,archive,zip:{declaredSize:usize,method,crcVerified:true}});
  }
  return out;
}
function dosStamp(date){
  const t=((date.getHours()&31)<<11)|((date.getMinutes()&63)<<5)|((date.getSeconds()/2)&31);
  const d=(((date.getFullYear()-1980)&127)<<9)|(((date.getMonth()+1)&15)<<5)|(date.getDate()&31);
  return {t,d};
}
function makeStoredZip(entries){
  const enc=new TextEncoder(),now=dosStamp(new Date()),locals=[],central=[];let offset=0;
  for(const e of entries){
    const nameBytes=enc.encode(e.name),data=bytesFrom(e.data),crc=crc32(data);
    const lh=new Uint8Array(30+nameBytes.length),dv=new DataView(lh.buffer);
    dv.setUint32(0,0x04034b50,true);dv.setUint16(4,20,true);dv.setUint16(6,0x0800,true);dv.setUint16(8,0,true);
    dv.setUint16(10,now.t,true);dv.setUint16(12,now.d,true);dv.setUint32(14,crc,true);
    dv.setUint32(18,data.length,true);dv.setUint32(22,data.length,true);
    dv.setUint16(26,nameBytes.length,true);dv.setUint16(28,0,true);lh.set(nameBytes,30);
    locals.push(lh,data);
    const ch=new Uint8Array(46+nameBytes.length),cv=new DataView(ch.buffer);
    cv.setUint32(0,0x02014b50,true);cv.setUint16(4,20,true);cv.setUint16(6,20,true);cv.setUint16(8,0x0800,true);cv.setUint16(10,0,true);
    cv.setUint16(12,now.t,true);cv.setUint16(14,now.d,true);cv.setUint32(16,crc,true);
    cv.setUint32(20,data.length,true);cv.setUint32(24,data.length,true);
    cv.setUint16(28,nameBytes.length,true);cv.setUint32(42,offset,true);ch.set(nameBytes,46);
    central.push(ch);
    offset+=lh.length+data.length;
  }
  const centralSize=central.reduce((a,c)=>a+c.length,0);
  const eocd=new Uint8Array(22),ev=new DataView(eocd.buffer);
  ev.setUint32(0,0x06054b50,true);ev.setUint16(8,entries.length,true);ev.setUint16(10,entries.length,true);
  ev.setUint32(12,centralSize,true);ev.setUint32(16,offset,true);
  const parts=[...locals,...central,eocd],total=parts.reduce((a,p)=>a+p.length,0),out=new Uint8Array(total);
  let p=0;for(const part of parts){out.set(part,p);p+=part.length;}
  return out;
}

/* ============================================================
   4. File intake
   ============================================================ */
