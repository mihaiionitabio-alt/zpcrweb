p=>({
    name:pv(p,"name"),
    calibTarget:posList(p.querySelector(':scope > obj[name="CalibTarget"]')||p),
    calibRef:posList(p.querySelector(':scope > obj[name="CalibRef"]')||p),
    pairTarget:posList(p.querySelector(':scope > obj[name="PairTarget"]')||p),
    pairRef:posList(p.querySelector(':scope > obj[name="PairRef"]')||p)
  })