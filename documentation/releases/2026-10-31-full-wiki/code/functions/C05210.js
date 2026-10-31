([cyc,byChan])=>{
    Object.entries(byChan).forEach(([ch,a])=>{(channels[ch]??={})[cyc]=a;});
  }