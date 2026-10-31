o=>
      push(o.severity==="error"?"error":"review",
        o.severity==="error"?"Contamination":o.cls==="result-without-cq"?"Stored result":"Analysis membership",
        `${o.well}: ${o.finding}`,
        [o.sample,o.filterComb||o.filterName||`channel ${o.channel}`,o.otherChannels]
          .filter(Boolean).join("; "))