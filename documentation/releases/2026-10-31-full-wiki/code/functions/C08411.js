(a,b)=>{const sl=y.slice(a,b),m=mlMean(sl);
    return sl.reduce((t,v)=>t+(v-m)*(v-m),0);}