e=>{
    const bytes=e.data instanceof Uint8Array?e.data:new TextEncoder().encode(String(e.data));
    return `${sha256Hex(bytes)}  ${e.name}`;
  }