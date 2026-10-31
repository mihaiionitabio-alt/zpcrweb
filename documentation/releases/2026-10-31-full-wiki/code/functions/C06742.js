(yy,xx)=>{const r=type==="trend"?ccTrend(xx,yy,cfg,spec):type==="ewma"?ccEWMA(yy,cfg):type==="cusum"?ccCUSUM(yy,cfg):ccI(yy,cfg);
      if(def.westgard&&type==="i")ccWestgard(r);return r;}