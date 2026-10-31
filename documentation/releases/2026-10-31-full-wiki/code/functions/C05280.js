(g,i)=>{
    const unknowns=[...g.querySelectorAll('[class="UnkResult"]')].map(x=>rqResult(x,false));
    /* which genes this group compared: read it from the pairings it names, and fall back
       to the declaration order of the target genes */
    const named=new Set(unknowns.map(u=>u.pairName));
    const mine=pairings.filter(p=>named.has(p.name));
    const gi=mine.length&&mine[0].pairTarget.length?mine[0].pairTarget[0].gene:null;
    const ri=mine.length?uniq(mine[0].pairRef.map(x=>x.gene)):[];
    return {
      hasCalib:pv(g,"HasCalib")==="1",
      target:(gi!=null&&genes[gi])?genes[gi].name:(targets[i]?targets[i].name:""),
      references:ri.length?ri.map(x=>genes[x]?genes[x].name:"").filter(Boolean):refs.map(x=>x.name),
      calib:rqResult(g.querySelector('[class="CalibResult"]'),true),
      unknowns
    };
  }