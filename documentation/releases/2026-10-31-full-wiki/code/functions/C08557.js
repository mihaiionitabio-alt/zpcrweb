function mlFeatureMatrix(rows){
  const per=rows.map(mlFeatureRows);
  const meta=new Map();
  per.forEach(list=>list.forEach(f=>{if(!meta.has(f.name))meta.set(f.name,f);}));
  const names=[...meta.keys()].sort();
  const coverage=new Map(names.map(nm=>[nm,per.filter(l=>l.some(f=>f.name===nm)).length]));
  const valueOf=(list,nm)=>{const f=list.find(q=>q.name===nm);return f?f.value:NaN;};
  const omitted=[];
  const keep=names.filter(nm=>{
    if(ML_LABEL_SOURCE.some(s=>nm===s||nm.indexOf(s+" · ")===0)){
      omitted.push({name:nm,why:"excluded: this is the metric the label is taken from"});return false;}
    const cov=coverage.get(nm);
    if(cov<Math.max(8,0.8*rows.length)){
      omitted.push({name:nm,why:`present on ${cov} of ${rows.length} runs (under 80 %)`});return false;}
    const col=per.map(l=>valueOf(l,nm)).filter(Number.isFinite);
    if(!((mlSd(col)||0)>1e-12)){
      omitted.push({name:nm,why:"no variation across the cohort"});return false;}
    return true;});
  if(keep.length<3)return {ok:false,why:`only ${keep.length} usable metric(s) across this cohort`,omitted,
    included:keep.map(nm=>meta.get(nm))};
  const idx=[],X=[],dropped=[];
  per.forEach((list,i)=>{
    const v=keep.map(nm=>valueOf(list,nm));
    if(v.every(Number.isFinite)){idx.push(i);X.push(v);}
    else dropped.push({run:rows[i].run,missing:keep.filter((nm,j)=>!Number.isFinite(v[j]))});
  });
  if(X.length<8)return {ok:false,why:`only ${X.length} run(s) have every metric present`,omitted,
    included:keep.map(nm=>meta.get(nm)),dropped};
  return {ok:true,keys:keep,X,rows:idx.map(i=>rows[i]),
    included:keep.map(nm=>Object.assign({},meta.get(nm),{coverage:coverage.get(nm)})),
    omitted,dropped};
}