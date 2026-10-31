el=>{
    const c={name:pv(el,"name"),active:pv(el,"Active")==="1",em:Number(pv(el,"EmissionWL")),ex:Number(pv(el,"ExcitationWL")),
      integr:Number(pv(el,"IntgrTime")),maxIntegr:Number(pv(el,"MaxIntgrTime")),
      meltFactor:pv(el,"MeltFactor"),quantFactor:pv(el,"QuantFactor")};
    channels.push(c);
  }