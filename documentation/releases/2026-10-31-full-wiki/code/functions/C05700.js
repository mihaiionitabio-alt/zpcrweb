()=>Object.assign(sopBase(),{
    name:"Forensic DNA quantification triage (example)",assay:"Autosomal / Y / IPC quantification",
    notes:"Example triage in the spirit of Onofri et al. 2024: IPC shift flags inhibition, a low quantity flags the stochastic zone. Replace every value with your validated limits.",
    targets:[
      {match:"IPC|IC",kind:"ic",cqMax:40,cqLate:"",quantMin:"",lateOutcome:"Inconclusive"},
      {match:"*",kind:"target",cqMax:40,cqLate:"",quantMin:0.005,lateOutcome:"Inconclusive"}],
    controls:[
      {name:"NTC",matchBy:"role",match:"NTC|Blank",expect:"negative",cqLo:"",cqHi:"",targets:"*",minPerRun:1,onFail:"reject"},
      {name:"Reagent blank",matchBy:"name",match:"RB*|reagent blank*",expect:"negative",cqLo:"",cqHi:"",targets:"*",minPerRun:0,onFail:"reject"},
      {name:"Standards",matchBy:"role",match:"Standard",expect:"standard",cqLo:"",cqHi:"",targets:"*",minPerRun:0,onFail:"review"}],
    replicates:{min:1,positiveMin:1,partialOutcome:"Inconclusive",maxSd:0.3,sdOutcome:"Repeat"},
    ic:{maxShift:1,shiftOutcome:"Inconclusive",missingOutcome:"Invalid"}
  })