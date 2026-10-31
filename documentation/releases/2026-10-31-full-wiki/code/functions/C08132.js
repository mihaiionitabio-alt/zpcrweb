g=>({
    id:"img:"+g.id,kind:"image",group:g.group||"Figures",title:g.title||g.id,
    note:g.note||"",scope:g.scope||"all",
    reportGraph:g,
    ready:()=>reportGraphRunIndexes(g).some(ri=>reportGraphAvailable(g,ri)),
    figure:()=>reportGraphFigure(g,reportGraphRunIndexes(g).find(ri=>reportGraphAvailable(g,ri))??selRunIndex())
  })