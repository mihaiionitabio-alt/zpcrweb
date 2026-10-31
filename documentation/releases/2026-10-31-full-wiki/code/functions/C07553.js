a=>{
      if(Number.isFinite(a.channelIdx)&&(a.channelIdx<0||a.channelIdx>=active.length))
        push("error","Channel assignment",`Analysis reads channel index ${a.channelIdx}, but ${active.length} active channel(s) exist`,a.name);
      if(a.channelMismatch)push("review","Channel assignment",
        `Analysis is named for ${a.channelMismatch.named} but reads ${a.channelMismatch.reading}`,a.name);
    }