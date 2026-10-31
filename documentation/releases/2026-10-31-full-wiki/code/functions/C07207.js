(it,i)=>out.push(mgIt({kind:"export",sev:"ok",pict:MG_PICT.export,kindWord:"download",
    code:"D"+(i+1),title:it.title,value:"",unit:"",limits:"ready",state:"",
    evidence:`download ${i+1} of ${ready.length}`,exportIndex:i,
    rows:[["Format",it.title],
          ["Runs included",String(RUNS.length)],["Profile",`${SOP.name} v${SOP.version}`],
          ["Sample names","as set by the pseudonymisation switch"]],
    actions:[{key:"3",label:"Download this file",cmd:"export "+i}]}))