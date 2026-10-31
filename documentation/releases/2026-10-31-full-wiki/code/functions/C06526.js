function ccTemperatureLogSpan(run){
  let times=[];
  if(run.platform==="QuantStudio"){
    const L=run.eds&&run.eds.log;
    if(L&&Array.isArray(L.temps))times=L.temps.filter(r=>Number.isFinite(r[0])&&Number.isFinite(r[1])).map(r=>r[0]/1000);
  }else{
    const L=run.cc&&run.cc.log;
    if(L&&L.seconds&&L.temp)times=Array.from(L.seconds).filter((t,i)=>Number.isFinite(t)&&Number.isFinite(L.temp[i]));
  }
  if(times.length<2||times.some((t,i)=>i>0&&t<times[i-1]))return NaN;
  const span=times[times.length-1]-times[0];return span>0?span:NaN;
}