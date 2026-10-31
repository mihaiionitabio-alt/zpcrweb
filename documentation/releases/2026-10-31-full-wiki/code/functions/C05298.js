x=>({
          name:pv(x,"name"),wellText:pv(x,"PosAsStr"),pos:Number(pv(x,"Position")),
          cq:Number(pv(x,"CrossingPoint")),conc:Number(pv(x,"Concentration")),
          call:pv(x,"Call"),targetName:pv(x,"TargetName")})