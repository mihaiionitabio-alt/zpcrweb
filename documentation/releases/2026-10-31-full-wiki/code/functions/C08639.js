(o,i)=>({type:"line",colour:o.v>0?"#2563eb":"#0891b2",width:9,
        data:[[0,w.length-i],[o.v,w.length-i]],tip:`${o.k}: ${mlNum(o.v,3)}`})