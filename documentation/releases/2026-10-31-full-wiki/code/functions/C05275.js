el=>[...el.querySelectorAll('[class="PairSampleInfo"]')]
    .map(x=>({pos:Number(pv(x,"BasePosition")),gene:Number(pv(x,"RQDataIndex")),channel:Number(pv(x,"RQChannelIndex"))}))