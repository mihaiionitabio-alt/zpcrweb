(c,i)=>{
    if(Number.isFinite(c.ex)&&!(c.ex in ex2chan)){ex2chan[c.ex]=i;chanName[c.ex]=c.name;}
    /* Two channels can share an excitation filter (533-580 and 533-610 in the four-channel
       COVID format). The excitation/emission pair is therefore the key; excitation alone is
       only the fallback for analyses that do not name an emission wavelength. */
    if(Number.isFinite(c.ex)&&Number.isFinite(c.em)&&!(`${c.ex}-${c.em}` in exem2chan))exem2chan[`${c.ex}-${c.em}`]=i;
  }