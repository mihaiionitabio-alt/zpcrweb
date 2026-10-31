w=>(w.role==="Calibrator"||w.role==="Positive control")
      &&(!(Number(w.CpRaw)>0)||w.call==="Negative"||w.call==="NotCalculated")