(_,i)=>({
      ...head,peak_index:i+1,
      peak:t.tms?.[i]??"",area:t.areas?.[i]??"",width:t.widths?.[i]??"",
      height:t.heights?.[i]??"",shoulder:(t.shoulders||[]).includes(i)?"yes":""
    })