ri=>({
  ...item,id:item.id+'@run:'+ri,title:item.title+' | '+RUNS[ri].file,
  note:(item.note||'')+(g.id==='plate'?'\nDecoded plate layout: '+RUNS[ri].rows*RUNS[ri].cols+' wells; '+RUNS[ri].rows+' rows x '+RUNS[ri].cols+' columns.':'')+'\nSource: '+RUNS[ri].file+'\nSource SHA-256: '+(RUNS[ri].meta.sourceSHA256||'Not recorded'),
  figure:()=>reportGraphFigure(g,ri)
 })