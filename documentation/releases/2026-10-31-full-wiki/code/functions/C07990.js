r=>(((r.protocol||{}).channels)||[])
    .filter(c=>c.active).map(c=>`${c.name||"channel"} ${c.ex}-${c.em}`)