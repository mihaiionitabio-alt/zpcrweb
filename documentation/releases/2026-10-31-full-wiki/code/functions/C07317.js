s=>{
    x+=`<sample id="${xesc(rdmlId("smp",s))}"><type>${rdmlSampleType(roleOf[s])}</type>`
      +`<doubleStranded>true</doubleStranded></sample>\n`;
  }