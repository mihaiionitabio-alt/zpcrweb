function zpcrParseIcff(u8) {
  if (u8.length < 8) return null;
  const dv = new DataView(u8.buffer, u8.byteOffset, u8.byteLength);
  const indexOffset = dv.getUint32(u8.length - 8, true);
  const stride      = dv.getUint32(u8.length - 4, true);
  if (stride !== ZPCR_ICFF_STRIDE) return null;
  if (indexOffset + 4 > u8.length - 8) return null;
  if (zpcrAsciiZ(u8, indexOffset, 4) !== 'ICFF') return null;
  if((u8.length-8-indexOffset-4)%stride)throw Error('Partial ICFF index');
  const fields = Object.create(null);
  const order = [];
  for (let p = indexOffset + 4; p + stride <= u8.length - 8; p += stride) {
    const name = zpcrAsciiZ(u8, p, 255);
    const offset = dv.getUint32(p + 255, true);
    const length = dv.getUint32(p + 259, true);
    const flag   = u8[p + 263];
    if (!name) continue;
    if(fields[name])throw Error('Duplicate ICFF field');
    if(offset+length>indexOffset)throw Error('ICFF payload bounds: '+name);
    fields[name] = { offset, length, flag };
    order.push(name);
  }
  return { fields, order, indexOffset, stride };
}