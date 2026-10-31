(p,i)=>{p.row=keep[i];p.x=X.x[i];
    const raw=p.raw!==undefined?p.raw:p.y;
    if(Number.isFinite(spec.lo)&&raw<spec.lo)p.flags=p.flags.concat("below specification");
    if(Number.isFinite(spec.hi)&&raw>spec.hi)p.flags=p.flags.concat("above specification");}