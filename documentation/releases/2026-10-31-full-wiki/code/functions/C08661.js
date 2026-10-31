function zpcrFloatArray(u8, dv, f) {
  if (!f || f.length < 4) return null;
  const count = dv.getUint32(f.offset, true);
  const floats = (f.length - 4) / 4;
  if (!Number.isInteger(floats)) return null;
  const out = new Float32Array(floats);
  for (let i = 0; i < floats; i++) out[i] = dv.getFloat32(f.offset + 4 + i * 4, true);
  return { count, values: out, declaredCount: count, actualCount: floats };
}