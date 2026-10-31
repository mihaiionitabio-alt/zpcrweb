(list,area)=>{
    q.push({kind:"finding",sev:"alarm",code:"ERR",title:area,value:String(list.length),unit:list.length===1?"finding":"findings",
      limits:"expected: none",state:list[0].finding||"",evidence:(list[0].evidence||"")+(list.length>1?`  (+${list.length-1} more of the same kind)`:""),
      run:list[0].experiment||"",actions:[{key:"3",label:"Open the review view",cmd:"review"}]});
  }