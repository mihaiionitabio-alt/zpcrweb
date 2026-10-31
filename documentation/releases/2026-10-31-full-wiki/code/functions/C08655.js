async function zpcrReadArchive(arrayBuffer, inflate = zpcrInflateRaw) {
  const u8 = new Uint8Array(arrayBuffer);
  const dv = new DataView(u8.buffer, u8.byteOffset, u8.byteLength);
  let eocd = -1;
  for (let i = u8.length - 22; i >= Math.max(0, u8.length - 65557); i--) {
    if (dv.getUint32(i, true) === 0x06054b50) { eocd = i; break; }
  }
  if (eocd < 0) throw new Error('Not a ZIP container: no end-of-central-directory record');
  if (dv.getUint16(eocd+4,true)||dv.getUint16(eocd+6,true)) throw Error('Multi-disk ZIP unsupported');
  const count = dv.getUint16(eocd + 10, true);
  if(count===65535 || count>10000) throw Error('ZIP entry limit or ZIP64 unsupported');
  const cdSize=dv.getUint32(eocd+12,true),cdOffset=dv.getUint32(eocd+16,true);
  if(cdOffset+cdSize>eocd)throw Error('ZIP central directory bounds');
  let expanded=0;
  const seen=new Set();
  let p = dv.getUint32(eocd + 16, true);
  const files = Object.create(null);
  const manifest = [];
  for (let k = 0; k < count; k++) {
    if(p+46>eocd)throw Error('Truncated ZIP index');
    if (dv.getUint32(p, true) !== 0x02014b50) throw new Error('Corrupt ZIP central directory');
    const flags  = dv.getUint16(p + 8,  true);
    const method = dv.getUint16(p + 10, true);
    const crc    = dv.getUint32(p + 16, true);
    const csize  = dv.getUint32(p + 20, true);
    const usize  = dv.getUint32(p + 24, true);
    const nLen   = dv.getUint16(p + 28, true);
    const eLen   = dv.getUint16(p + 30, true);
    const cLen   = dv.getUint16(p + 32, true);
    const lho    = dv.getUint32(p + 42, true);
    if(p+46+nLen+eLen+cLen>eocd)throw Error('ZIP name bounds');
    const name   = ZPCR_TD.decode(u8.subarray(p + 46, p + 46 + nLen));
    p += 46 + nLen + eLen + cLen;
    if(seen.has(name))throw Error('Duplicate ZIP member: '+name);seen.add(name);
    expanded+=usize;
    if(usize>64*1024*1024||expanded>256*1024*1024)throw Error('ZPCR expanded-size limit');
    if (name.endsWith('/')) continue;
    const encrypted = (flags & 0x1) === 1;
    const rec = { name, method, crc, csize, usize, encrypted };
    manifest.push(rec);
    if (encrypted) continue;                       /* reported, never guessed at */
    if(lho+30>cdOffset)throw Error('ZIP local header bounds');
    if (dv.getUint32(lho, true) !== 0x04034b50) throw new Error('Bad local header: ' + name);
    const start = lho + 30 + dv.getUint16(lho + 26, true) + dv.getUint16(lho + 28, true);
    if(start+csize>cdOffset)throw Error('ZIP payload bounds');
    const raw = u8.subarray(start, start + csize);
    let data;
    if (method === 0) data = raw.slice();
    else if (method === 8) data = await inflate(raw);
    else throw new Error(`ZIP entry ${name} uses unsupported compression method ${method}`);
    if (data.length !== usize) throw new Error(`ZIP entry ${name} size mismatch`);
    if(zpcrCRC(data)!==crc)throw Error('ZIP CRC-32 mismatch: '+name);
    files[name] = data;
  }
  return { files, manifest };
}