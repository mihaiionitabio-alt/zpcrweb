t=>({
        name:`RDML — ${t.id}`,shortName:t.id,uid:"rdml:"+t.id,
        kind:"absquant",kindLabel:"RDML exchange record",cls:"RDML "+version,subsetName:t.id,
        calcState:anyCq?"analysed":"not analysed",
        channelIdx:t.channel,channelName:t.dye,filterName:t.dye,filterComb:"",
        cpMethod:cqMethod||"not stated in the file",cccEnabled:false,ccNote:bgMethod||"",
        created:runDate||"",modified:"",createdBy:"",modifiedBy:"",
        nResults:wells.filter(w=>w.channel===t.channel).length,
        channelMismatch:null,channelSignal:null,stdCurve:null,settings:{},quantStats:[]})