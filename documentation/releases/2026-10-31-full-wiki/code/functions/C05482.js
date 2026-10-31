w=>{const o={"Well":w.i+1,"Well Position":"      "+w.pos,"Cycle":c+1};
    sets.forEach(s=>{const v=((r.raw.data[s]||[])[c]||[])[w.i];o[s]=v==null?null:v;});rawRows.push(o);}