async function get(name){
    if(cache.has(name))return cache.get(name);
    const en=entries.find(x=>x.name===name);if(!en)return null;
    const o=en.off;if(dv.getUint32(o,true)!==0x04034b50)throw new Error("Bad local header: "+name);
    const s=o+30+dv.getUint16(o+26,true)+dv.getUint16(o+28,true);
    const raw=u8.subarray(s,s+en.csize);
    let data;if(en.method===0)data=raw;else if(en.method===8)data=await inflateRaw(raw);else throw new Error(`Unsupported compression ${en.method} in ${name}`);
    en.crcOk=crc32(data)===en.crc;cache.set(name,data);return data;
  }