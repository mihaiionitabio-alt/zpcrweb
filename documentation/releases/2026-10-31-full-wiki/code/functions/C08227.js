function selCsvTemplate(){
  const rows=selCatalogue().map(x=>({id:x.id,kind:x.kind,group:x.group,title:x.title,
    available:x.ready()?"yes":"no",include:SEL_STATE.ids.has(x.id)?"yes":"no",figure_scope:SEL_STATE.figureScope||"selected",figure_run:String(selRunIndex())}));
  return toCSV([{key:"id",label:"id"},{key:"kind",label:"kind"},{key:"group",label:"group"},
    {key:"title",label:"title"},{key:"available",label:"available"},{key:"include",label:"include"},{key:"figure_scope",label:"figure_scope"},{key:"figure_run",label:"figure_run"}],rows);
}