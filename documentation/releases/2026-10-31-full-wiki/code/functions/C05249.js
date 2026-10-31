function decodeProtocol(dom){
  const programs=[];
  dom.querySelectorAll('[class="HTCRunProgram"]').forEach(el=>{
    const segs=[...el.querySelectorAll('[class="HTCRunSegment"]')].map(s=>({
      target:Number(pv(s,"Target")),target2:Number(pv(s,"Target2")),hold:Number(pv(s,"Hold")),
      slope:Number(pv(s,"Slope")),acqMode:pv(s,"AcquisitionMode"),acqPerDeg:pv(s,"AcqPerDegree"),
      stepSize:Number(pv(s,"StepSize")),stepDelay:Number(pv(s,"StepDelay"))
    }));
    programs.push({name:pv(el,"name"),cycles:Number(pv(el,"Cycles")),mode:pv(el,"AnalysisMode"),segments:segs});
  });
  /* Only the run's embedded detection format defines acquisition indices.
     The DetectionFormats object may also carry a complete instrument catalogue;
     its Active flags describe formats, not channels acquired by this run. */
  const formats=[...dom.querySelectorAll('[class="HTCDetectionFormat"]')];
  const embedded=formats.filter(f=>f.getAttribute("name")==="DetFormat"
    &&f.closest('[class="TCyclingInput"]'));
  const selectedName=propText(dom,"DefFormatName")||"";
  const candidates=embedded.length?embedded:formats.filter(f=>pv(f,"name")===selectedName);
  const signature=f=>JSON.stringify([...f.querySelectorAll('[class="HTCChannel"]')]
    .filter(c=>pv(c,"Active")==="1").map(c=>[pv(c,"ExcitationWL"),pv(c,"EmissionWL")]));
  if(candidates.length&&new Set(candidates.map(signature)).size!==1)
    throw new Error("Ambiguous acquisition channels: embedded detection formats disagree");
  if(formats.length&&!candidates.length)
    throw new Error("Cannot resolve the run's acquisition detection format; catalogue channels were not used");
  const channelRoot=candidates[0]||dom;
  const channels=[];
  channelRoot.querySelectorAll('[class="HTCChannel"]').forEach(el=>{
    const c={name:pv(el,"name"),active:pv(el,"Active")==="1",em:Number(pv(el,"EmissionWL")),ex:Number(pv(el,"ExcitationWL")),
      integr:Number(pv(el,"IntgrTime")),maxIntegr:Number(pv(el,"MaxIntgrTime")),
      meltFactor:pv(el,"MeltFactor"),quantFactor:pv(el,"QuantFactor")};
    channels.push(c);
  });
  const bt=dom.querySelector('[class="HTCBlockType"]');
  const block=bt?{
    id:pv(bt,"Id"),rowCount:Number(pv(bt,"RowCount")),colCount:Number(pv(bt,"ColCount")),
    rampUp:Number(pv(bt,"RampRateMaxUp")),rampDn:Number(pv(bt,"RampRateMaxDn")),
    volMin:Number(pv(bt,"ReactionVolMin")),volMax:Number(pv(bt,"ReactionVolMax")),
    volDefault:Number(pv(bt,"ReactionVolDefault"))
  }:null;
  const numOrNull=t=>{const v=propText(dom,t);return v===""?null:Number(v);};
  const setup={
    channelCount:numOrNull("ChannelCount"),subclass:propText(dom,"InstrumentSubclass"),
    seekTemp:numOrNull("SeekTemp"),maxPositions:numOrNull("MaxPositionsToSeek"),
    sampleVolume:numOrNull("SampleVolume"),plateId:propText(dom,"PlateID")
  };
  const detectionFormatName=propText(dom,"DefFormatName")||"";
  const analysisModes=[...dom.querySelectorAll('list[name="AnalysisModes"] prop, list[name="AnalysisModes"] item')]
    .map(e=>(e.textContent||"").trim()).filter(Boolean);
  return {programs,channels,block,setup,detectionFormatName,analysisModes:uniq(analysisModes),
    hasTemperatureLog:!!dom.querySelector('[class="TemperatureLog"]')};
}