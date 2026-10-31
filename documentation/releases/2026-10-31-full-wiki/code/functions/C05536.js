w=>{
    const ch={};
    w.tasks.forEach(t=>{ch[dyeIdx(t.reporter)]={sampleType:t.task,targetName:t.target,
      targetType:ec?(t.target===ec?"dtReference":"dtTarget"):""};});
    plate[w.i]={name:w.sample,sampleId:"",notes:w.comment,channels:ch,subsets:[]};
  }