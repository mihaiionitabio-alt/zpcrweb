w=>{
    const key=`${w.channel}|${w.pos}`;
    (groups.get(key)??(groups.set(key,[]),groups.get(key))).push(w);
  }