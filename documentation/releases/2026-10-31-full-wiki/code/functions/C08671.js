function zpcrFactoryRefRow(kv, channels) {
  const raw = kv['FactoryRefRowCal'];
  if (!raw) return null;
  const n = raw.split(',').map(s => Number(s.trim()));
  if (!n.length || n.length % 4 || n.some(x => !Number.isFinite(x))) return null;
  const quads = [];
  for (let i = 0; i < n.length; i += 4)
    quads.push({ mean: n[i], min: n[i + 1], max: n[i + 2], sd: n[i + 3] });
  if (!channels || quads.length % channels) return { quads, slots: null, channels: channels || null, trailingEmptySlots: null };
  const slotCount = quads.length / channels;
  const slots = [];
  let trailingEmpty = 0;
  for (let s = 0; s < slotCount; s++) {
    const row = [];
    for (let c = 0; c < channels; c++) row.push(quads[s * channels + c]);
    slots.push(row);
  }
  for (let s = slotCount - 1; s >= 0; s--) {
    if (slots[s].every(q => q.mean === 0 && q.min === 0 && q.max === 0 && q.sd === 0)) trailingEmpty++;
    else break;
  }
  return { quads, slots, channels, slotCount, trailingEmptySlots: trailingEmpty,
           populatedSlots: slotCount - trailingEmpty };
}