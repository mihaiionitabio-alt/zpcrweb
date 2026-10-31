e=>{
    if(!e||!Number.isFinite(Number(e.channel))||!Number.isFinite(Number(e.pos))||!e.curve)return;
    const channel=Number(e.channel),pos=Number(e.pos),key=`${channel}|${pos}`,ref=refByChannel.get(channel)||globalRef;
    const noiseFloor=Math.max(3,6*ampMad,Number.isFinite(ref)?ref*.02:0);
    const signalFloor=Math.max(noiseFloor,Number.isFinite(ref)?ref*.05:0);
    if(claimed.has(key)||!(Number.isFinite(e.amplitude)&&e.amplitude>=signalFloor))return;
    const k=Math.max(2,Math.floor(e.curve.length/5));
    const first=mean(e.curve.slice(0,k)),last=mean(e.curve.slice(-k));
    const diffs=e.curve.slice(1).map((v,i)=>Number(v)-Number(e.curve[i])).filter(Number.isFinite);
    const risingFraction=diffs.length?diffs.filter(d=>d>0).length/diffs.length:0;
    const tailK=Math.max(5,Math.floor(e.curve.length*.25));
    const tailBase=mean(e.curve.slice(Math.max(0,e.curve.length-2*tailK),Math.max(0,e.curve.length-tailK)));
    const tailDiffs=e.curve.slice(Math.max(1,e.curve.length-tailK)).map((v,i)=>Number(v)-Number(e.curve[Math.max(0,e.curve.length-tailK)-1+i])).filter(Number.isFinite);
    const terminalDelta=last-tailBase,terminalRisingFraction=tailDiffs.length?tailDiffs.filter(d=>d>0).length/tailDiffs.length:0;
    const wholeRunRise=last-first>=.45*e.amplitude&&risingFraction>=.55;
    const terminalRise=terminalDelta>=Math.max(10,.25*e.amplitude)&&terminalRisingFraction>=.8;
    if(!(wholeRunRise||terminalRise))return;
    const rec=(run.plate||{})[pos]||{},chRec=(rec.channels||{})[channel]||{};
    const instrRole=TYPE_TO_ROLE[chRec.sampleType]||"",nameRole=roleFromName(rec.name||"");
    const refine=instrRole&&nameRole!=="Unknown"&&NEGATIVE_FAMILY.includes(instrRole)
      &&NEGATIVE_FAMILY.includes(nameRole)&&instrRole!==nameRole;
    const role=refine?nameRole:(instrRole&&instrRole!=="Unknown"?instrRole:nameRole);
    const chDef=active[channel]||(((run.protocol||{}).channels)||[])[channel]||{};
    /* Classify rather than merely flag. Every class below is a rising trace with
       no result IN ITS OWN CHANNEL; what differs is what the position declares. */
    const blank=orphanBlankRole(rec,chRec);
    const stale=unanswered.get(key);           /* a row with no Cq and no reported no-crossing */
    const others=orphanOtherChannels(run,pos,channel);
    const withCq=others.filter(o=>o.cq!==null);
    const chName=chDef.name||`channel ${channel}`;
    const cls=blank?"blank-with-signal":stale?"result-without-cq"
      :others.length?"channel-not-analysed":"position-not-analysed";
    const context=withCq.length
      ? `the same position has ${withCq.map(o=>`${o.name}${o.target?" "+o.target:""} Cq ${o.cq}`).join(", ")}, in other channel(s)`
      : others.length?"the same position has results in other channels, none with a Cq"
        :"no stored result of any kind at this position";
    out.push({experiment:runName(run),well:posToWell(pos,run.cols),pos,
      row:Math.floor(pos/run.cols),col:pos%run.cols,sample:rec.name||"",
      target:"No result in this channel",analysis:"Rising curve with no result in its channel",
      analysisUid:ORPHAN_CURVE_KEY,channel,filterName:chDef.name||"",
      filterComb:Number.isFinite(chDef.ex)?`${chDef.ex}-${chDef.em??""}`:"",
      instrType:chRec.sampleType||"",instrRole,role:role||"Unknown",call:"Not analysed",
      curve:e.curve,amplitude:e.amplitude,relative:Number.isFinite(ref)&&ref>0?e.amplitude/ref:null,
      referenceAmplitude:Number.isFinite(ref)?ref:null,noiseFloor,riseFraction:risingFraction,terminalDelta,terminalRiseFraction:terminalRisingFraction,
      cls,severity:blank?"error":"review",blankRole:blank,
      sameChannelCq:null,otherCq:withCq.length?withCq[0].cq:null,
      otherCqs:withCq.map(o=>o.cq),
      otherChannels:others.map(o=>`${o.name}${o.target?" "+o.target:""}${o.cq!==null?" Cq "+o.cq:""}`).join("; "),
      context,
      resultRow:stale?(stale.target||stale.analysis||"stored row"):"",
      finding:blank
        ? `${blank} position carries a rising curve in ${chName} — read as contamination until explained`
        : stale
          ? `${chName} has a stored result row (${stale.target||stale.analysis||"no target named"}) with no Cq and no reported no-crossing, over a rising curve`
          : `${chName} has a rising curve that belongs to no analysis (${context})`});
  }