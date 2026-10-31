w=>{
    const base={"Well":w.i+1,"Well Position":w.pos,"Sample Name":nm(w.sample),"Sample Color":qsRGB(w.sampleColor),"Biogroup Name":"","Biogroup Color":"","Comments":w.comment||""};
    if(!w.tasks.length)scRows.push(Object.assign({},base,{"Target Name":"","Target Color":"","Task":"","Reporter":"","Quencher":"","Quantity":null}));
    w.tasks.forEach(t=>scRows.push(Object.assign({},base,{"Target Name":t.target,"Target Color":qsRGB(t.color),"Task":t.task,
      "Reporter":t.reporter,"Quencher":t.quencher,"Quantity":t.task==="STANDARD"?num(t.quantity):null})));
  }