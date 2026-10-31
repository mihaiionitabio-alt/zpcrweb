w=>{
      if(Number(w.pos)!==pos||Number(w.channel)===channel)return;
      const cq=resultCq(w);
      out.push({channel:Number(w.channel),name:(active[Number(w.channel)]||{}).name||`channel ${w.channel}`,
        target:w.target||w.analysis||"",cq:Number.isFinite(cq)?+cq.toFixed(2):null});
    }