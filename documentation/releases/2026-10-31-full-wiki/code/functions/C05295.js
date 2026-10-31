s=>({
      sampleIds:pv(s,"SampleIDs"),count:Number(pv(s,"SampleCount")),master:pv(s,"SampleMaster"),
      cpAvg:Number(pv(s,"CpAverage")),cpSD:Number(pv(s,"CpDeviation")),
      concAvg:Number(pv(s,"ConcAverage")),concSD:Number(pv(s,"ConcDeviation")),method:pv(s,"StatMethod")
    })