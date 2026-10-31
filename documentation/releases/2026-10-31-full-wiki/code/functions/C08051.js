t=>{
    const dye=rdmlAttrId(t,"dyeId");
    targets.set(t.getAttribute("id")||"",{
      id:t.getAttribute("id")||"",type:rdmlText(t,"type")||"toi",dye,
      channel:Math.max(0,dyes.indexOf(dye)),
      ampEff:rdmlNum(t,"amplificationEfficiency"),ampEffSE:rdmlNum(t,"amplificationEfficiencySE"),
      meltingTemperature:rdmlNum(t,"meltingTemperature"),description:rdmlText(t,"description")});
  }