r=>({...r,mean:num(r.mean,3),sd:num(r.sd,3),cv:num(r.cv,2),
    min:num(r.min,3),q1:num(r.q1,3),median:num(r.median,3),q3:num(r.q3,3),max:num(r.max,3),
    concentration_mean:Number.isFinite(r.concentration_mean)?Number(r.concentration_mean).toPrecision(5):"",
    concentration_sd:Number.isFinite(r.concentration_sd)?Number(r.concentration_sd).toPrecision(5):"",
    concentration_cv:num(r.concentration_cv,2)})