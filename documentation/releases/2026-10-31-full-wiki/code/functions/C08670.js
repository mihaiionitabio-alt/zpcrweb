function zpcrParseRunInfo(text) {
  const kv = Object.create(null);
  if (typeof DOMParser === 'function') {
    const dom = new DOMParser().parseFromString(text, 'application/xml');
    if (dom.querySelector('parsererror')) throw new Error('REVIEW: RunInfo.xml does not parse');
    for (const pair of dom.querySelectorAll('KeyValuePairs')) {
      const k = pair.querySelector('Key');
      const v = pair.querySelector('Value');
      if (k && k.textContent.trim()) kv[k.textContent.trim()] = v ? v.textContent.trim() : '';
    }
  } else {
    const re = /<KeyValuePairs>\s*<Key>([^<]*)<\/Key>\s*<Value\s*\/>|<KeyValuePairs>\s*<Key>([^<]*)<\/Key>\s*<Value>([^<]*)<\/Value>/g;
    let m;
    while ((m = re.exec(text))) {
      if (m[1] !== undefined) kv[m[1].trim()] = '';
      else kv[m[2].trim()] = (m[3] || '').trim();
    }
  }
  return kv;
}