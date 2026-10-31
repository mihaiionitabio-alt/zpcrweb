d=>{const fs=QS_DYE_FILTER[String(d).toUpperCase()]||"";
    const passive=p.plate.passiveRef&&p.plate.passiveRef.toUpperCase()===String(d).toUpperCase();
    return {name:passive?`${d} (passive reference)`:d,active:true,ex:fs.split("-")[0]||"",em:fs.split("-")[1]||"",filterSet:fs,
      collected:fs?p.protocol.filters.includes(fs):null,integr:"",maxIntegr:"",meltFactor:"",quantFactor:""};}