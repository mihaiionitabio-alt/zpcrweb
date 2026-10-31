g=>{if(!g||!Number.isFinite(g.mean))return {y:NaN,cl:X,flags:[]};
    const n=Math.max(2,g.n||2),c4=CC_C4(n),A3=3/(c4*Math.sqrt(n)),B4=1+3*Math.sqrt(1-c4*c4)/c4,w=Math.max(A3*S,3*sigB,1.5*(cfg.res||0));
    const f=[];if(Math.abs(g.mean-X)>w)f.push("mean beyond limit");if(g.sd>B4*S)f.push("spread (S) beyond limit");
    return {y:g.mean,s:g.sd,cl:X,ucl:X+w,lcl:X-w,sUcl:B4*S,flags:f};}