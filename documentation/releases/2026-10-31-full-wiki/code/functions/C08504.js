function mlPlot(o){
  const keepCapture=PLOT_CAPTURE,keepClip=SVG_CLIP_N;
  PLOT_CAPTURE=null;
  let svg;
  try{svg=svgPlot(o);}
  finally{PLOT_CAPTURE=keepCapture;SVG_CLIP_N=keepClip;}
  const ids=[...new Set(svg.match(/pc\d+/g)||[])].sort((a,b)=>b.length-a.length);
  ids.forEach(id=>{const nid="mlc"+(++ML_CLIP_N);
    svg=svg.replace(new RegExp("\\b"+id+"\\b","g"),nid);});
  return svg;
}