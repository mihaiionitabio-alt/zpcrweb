x=>{
    try{
      if(x.kind==="image"){
        const f=x.figure();
        entries.push({name:"figures/"+safeName(x.id.slice(4))+".svg",data:f.svg});
        if(f.rows&&f.rows.length)entries.push({name:"figures/"+safeName(x.id.slice(4))+".csv",data:csvOf(f.rows)});
      }else{
        entries.push({name:"tables/"+x.file,data:x.text()});
      }
    }catch(e){entries.push({name:"errors/"+safeName(x.id)+".txt",data:String(e&&e.message||e)});}
  }