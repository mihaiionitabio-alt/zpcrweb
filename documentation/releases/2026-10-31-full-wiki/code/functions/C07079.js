m=>{
     const i=Number(m[1]),it=(MG.exports||[])[i];
     if(it)try{it.run();appNotice&&appNotice("console","Download requested: "+it.title);}catch(e){appError("console:export",e);}}