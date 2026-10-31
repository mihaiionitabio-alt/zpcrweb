(id,title,note,ready,rows,file)=>({id:"data:"+id,kind:"data",group:"Tables",title,note,
    ready,rows,file:file||(id+".csv"),text:()=>csv(rows())})