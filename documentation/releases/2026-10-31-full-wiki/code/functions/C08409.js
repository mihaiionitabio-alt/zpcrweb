function mlCrossing(forecast,ucl,lcl){
  if(!forecast)return null;
  for(const p of forecast.points){
    if(Number.isFinite(ucl)&&p.y>ucl)return {x:p.x,limit:ucl,side:"upper"};
    if(Number.isFinite(lcl)&&p.y<lcl)return {x:p.x,limit:lcl,side:"lower"};
  }
  return null;
}