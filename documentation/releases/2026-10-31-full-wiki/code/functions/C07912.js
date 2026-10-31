function registerReader(reader){
 if(!reader.id||!reader.version||typeof reader.decode!=='function'||MISSY_READERS.some(r=>r.id===reader.id))throw Error('Invalid/duplicate reader registration');
 MISSY_READERS.push(Object.freeze(reader));
}