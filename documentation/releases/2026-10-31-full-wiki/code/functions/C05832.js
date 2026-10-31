sc=>{
    const ok=sc.r2>=sopNum(R.minR2)&&sc.efficiency>=sopNum(R.effMin)&&sc.efficiency<=sopNum(R.effMax)&&sc.logs>=sopNum(R.minLogs)-1e-9&&sc.monotonic;
    add(`Standard curve — ${sc.target}`,R.stdCurve,ok,`slope ${num(sc.slope,3)}, R² ${num(sc.r2,4)}, E ${sc.efficiency>1000||sc.efficiency<-100?"out of range":num(sc.efficiency,1)+" %"}, ${num(sc.logs,1)} log range${sc.monotonic?"":", standards out of order"}`);
  }