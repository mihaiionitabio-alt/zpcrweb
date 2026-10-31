rec=>Object.values(rec.channels||{}).forEach(ch=>{
    if(!ch.targetName)return;
    if(ch.targetType==="dtTarget"){targets.add(ch.targetName);src=src||"per-well Target Type";}
    else if(ch.targetType==="dtReference"){refs.add(ch.targetName);src=src||"per-well Target Type";}
  })