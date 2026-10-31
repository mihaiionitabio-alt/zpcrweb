g=>{const yy=g.idx.map(i=>y[i]),xx=g.idx.map(i=>X.x[i]),r=one(yy,xx),nn=yy.filter(Number.isFinite).length,ready=nn>=ccBaselineNeed(cfg);
        if(!ready){r.pts.forEach(p=>{p.flags=[];p.cl=p.ucl=p.lcl=NaN;});delete r.reach;}
        r.pts.forEach((p,j)=>{p.segment=g.key;res.pts[g.idx[j]]=p;});res.segments.push({key:g.key,x:X.x[g.idx[0]],n:nn,ready,last:g.key===lastKey});
        if(g.key===lastKey){res.cl=r.cl;res.sigma=r.sigma;res.slope=r.slope;res.intercept=r.intercept;if(r.reach)res.reach=r.reach;}}