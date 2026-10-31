async function zpcrInflateRaw(u8) {
  if (typeof DecompressionStream !== 'function')
    throw new Error('This browser does not support DecompressionStream.');
  const ds = new DecompressionStream('deflate-raw');
  const reader=new Blob([u8]).stream().pipeThrough(ds).getReader(),parts=[];let total=0;
  while(true){const {done,value}=await reader.read();if(done)break;total+=value.length;if(total>64*1024*1024){await reader.cancel();throw Error('ZPCR inflated member exceeds limit');}parts.push(value);}
  const buf=new Uint8Array(total);let at=0;for(const part of parts){buf.set(part,at);at+=part.length;}

  return new Uint8Array(buf);
}