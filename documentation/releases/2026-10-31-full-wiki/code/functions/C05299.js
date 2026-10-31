a=>{
    let p=a.el.parentElement,parent=null;
    while(p&&!parent){
      parent=out.find(x=>x!==a&&x.el===p)||null;
      p=p.parentElement;
    }
    a.parentName=parent?parent.name:"";
    a.parentUid=parent?parent.uid:"";
    a.parentKind=parent?parent.kind:"";
    if(a.subordinate&&a.parentName)a.shortName=a.parentName;
  }