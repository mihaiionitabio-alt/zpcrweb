r=>[`${r.sample} · ${r.target}`,
        Number.isFinite(r.cqMean)?"Cq "+r.cqMean.toFixed(2):(r.reason||"—")]