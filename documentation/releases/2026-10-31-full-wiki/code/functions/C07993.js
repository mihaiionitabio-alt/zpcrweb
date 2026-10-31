r=>(((r.protocol||{}).channels)||[])
    .filter(c=>!c.active).map(c=>c.name||`${c.ex}-${c.em}`)