penalty=>{
    const cuts=[],segments=[[0,n]];
    for(let round=0;round<(maxPoints||3);round++){
      let best=null;
      for(const [a,b] of segments){
        if(b-a<10)continue;
        const base=cost(a,b);
        for(let k=a+5;k<=b-5;k++){
          const gain=base-cost(a,k)-cost(k,b);
          if(gain>penalty&&(!best||gain>best.gain))best={a,b,k,gain};
        }
      }
      if(!best)break;
      cuts.push({index:best.k,gain:best.gain});
      const i=segments.findIndex(q=>q[0]===best.a&&q[1]===best.b);
      segments.splice(i,1,[best.a,best.k],[best.k,best.b]);
    }
    return cuts.sort((p,q)=>p.index-q.index);
  }