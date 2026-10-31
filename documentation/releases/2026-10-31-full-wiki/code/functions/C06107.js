(items,key)=>{
    const names=new Map();items.filter(r=>!ssNameControl(r)&&r.targets.length&&!/^\(unnamed well /.test(r.sample)).forEach(r=>names.set(r.sample,ssNameTemplate(r.sample)));
    const counts=new Map();names.forEach(t=>counts.set(t,(counts.get(t)||0)+1));
    const ranked=[...counts].sort((a,b)=>b[1]-a[1]||a[0].localeCompare(b[0]));
    const n=names.size,dominant=n>=8&&ranked.length&&ranked[0][1]/n>=.35;
    const common=new Set(dominant?ranked.filter(([,count])=>count>=Math.max(3,Math.ceil(n*minShare))).map(([t])=>t):[]);
    models.push({scope:key.split("\u0000")[0],n,common:[...common],ready:!!dominant});
    items.forEach(r=>{const template=ssNameTemplate(r.sample);let kind,reason;
      if(ssNameControl(r)){kind="control";reason="Control or standard: reviewed separately, not used to learn routine sample names.";}
      else if(!r.targets.length){kind="unavailable";reason="No analysed result: not used to learn sample-name patterns.";}
      else if(n<8){kind="unavailable";reason=`Only ${n} distinct sample names in this scope; at least 8 are needed.`;}
      else if(!dominant){kind="mixed";reason="No naming template covers at least 35% of distinct names; no unusual-name claim is made.";}
      else if(common.has(template)){kind="usual";reason=`Matches a common template (${counts.get(template)}/${n} distinct names): ${template}`;}
      else{kind="unusual";reason=`Less common template (${counts.get(template)||0}/${n} distinct names): ${template}. Common: ${[...common].join("; ")}`;}
      const title={control:"Controls / standards",unavailable:"Insufficient naming data",mixed:"Mixed naming patterns",usual:"Common naming pattern",unusual:"Unusual name pattern"}[kind];
      out.set(r.key,{kind,template,reason,group:title+(kind==="usual"||kind==="unusual"?" — "+template:"")});
    });
  }