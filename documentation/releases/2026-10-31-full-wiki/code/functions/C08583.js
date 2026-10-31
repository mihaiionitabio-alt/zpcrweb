function mlBuildHoldout(rows,frac){
  const sp=mlTimeSplit(rows.length,frac||0.7);
  if(!sp.trainable)return null;
  const trRows=rows.slice(0,sp.cut),teRows=rows.slice(sp.cut);
  const Ftr=mlFeatureMatrix(trRows);
  if(!Ftr.ok)return null;
  const lab=rs=>rs.map(r=>((((r.m||{}).findings||{}).count)>0)?1:0);
  const keep=[],Xte=[];
  teRows.forEach(r=>{const list=mlFeatureRows(r);
    const v=Ftr.keys.map(nm=>{const f=list.find(q=>q.name===nm);return f?f.value:NaN;});
    if(v.every(Number.isFinite)){Xte.push(v);keep.push(r);}});
  if(Xte.length<4)return null;
  return {Xtr:Ftr.X,ytr:lab(Ftr.rows),Xte,yte:lab(keep),
    keys:Ftr.keys,schemaFrozen:true,
    trainSchema:{keys:Ftr.keys,omitted:(Ftr.omitted||[]).map(o=>[o.name,o.why])},
    trainRowKeys:Ftr.rows.map(r=>r.key),testRowKeys:keep.map(r=>r.key),
    nTrainRows:Ftr.rows.length,nTestRows:keep.length,
    droppedTest:teRows.length-keep.length,cut:sp.cut};
}