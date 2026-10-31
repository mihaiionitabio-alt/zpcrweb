function mgSheet(kind){
  const it=mgItem(),box=document.getElementById("mg-sheet");
  if(!it||(!it.chartId&&!["view","zoom","pan","navigation","appearance"].includes(kind)))return;
  const tr=(en,zh)=>UI_LANG==='zh'?zh:en;
  const opts=kind==="navigation"?[
    {value:it.chartId?'chart previous':'previous',label:tr('Previous','上一个')},
    {value:it.chartId?'chart next':'next',label:tr('Next','下一个')},
    {value:'chart close',label:tr('Close chart','关闭图表')},
    ...(it.chartId&&mgChartTypeOptions(it).length>1?[{value:'chart type',label:tr('Chart type','图表类型')}]:[]),
    ...(it.chartId&&mgChartAxisOptions(it).length>1?[{value:'x axis',label:tr('X axis','横轴')}]:[]),
    ...(!it.chartId&&RUNS.length>1?[{value:'next run',label:tr('Next run','下一次运行')}]:[])
  ]:kind==="appearance"?[{value:'theme light',label:tr('Light theme','浅色主题')},{value:'theme dark',label:tr('Dark theme','深色主题')}]:kind==="view"?[
    ['zoom menu','Zoom','缩放'],['pan menu','Pan','平移'],['zoom reset','Reset view · 100%','重置视图 · 100%']
  ].map(([value,en,zh])=>({value,label:tr(en,zh)})):kind==="zoom"?[
    ['zoom out','Zoom out','缩小'],['zoom in','Zoom in','放大'],['zoom reset','Reset view · 100%','重置视图 · 100%']
  ].map(([value,en,zh])=>({value,label:tr(en,zh)})):kind==="pan"?[
    ['pan left','Pan left','向左平移'],['pan right','Pan right','向右平移'],['pan up','Pan up','向上平移'],['pan down','Pan down','向下平移']
  ].map(([value,en,zh])=>({value,label:UI_LANG==='zh'?zh:en})):kind==="type"?mgChartTypeOptions(it):mgChartAxisOptions(it);
  if(opts.length<2)return;
  MG.sheet={kind,opts};
  document.getElementById("mg-sheet-title").textContent=kind==="zoom"?tr("Zoom","缩放"):kind==="pan"?tr("Pan","平移"):kind==="navigation"?tr("Chart / graph","图表 / 图形"):kind==="appearance"?tr("Appearance","外观"):kind==="view"?(UI_LANG==='zh'?"视图 · 缩放和平移":"View · Zoom / pan"):kind==="type"?"Chart type":"X axis";
  document.getElementById("mg-sheet-list").innerHTML=opts.map((o,i)=>
    `<button data-i="${i}" class="${o.current?"current":""}">
       <span class="k">${i+1} · select${o.current?" · in use":""}</span>
       <span class="l">${esc(o.label)}</span></button>`).join("");
  document.querySelectorAll("#mg-sheet-list button").forEach(b=>b.onclick=()=>mgSheetPick(+b.dataset.i));
  box.hidden=false;
  const first=document.querySelector("#mg-sheet-list button");if(first)first.focus();
}