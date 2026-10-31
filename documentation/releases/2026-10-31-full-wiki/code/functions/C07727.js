r=>({...r,mean_1:num(r.mean_1,3),sd_1:num(r.sd_1,3),mean_2:num(r.mean_2,3),
    sd_2:num(r.sd_2,3),difference:num(r.difference,3),
    review:r.review?tag("warn",r.review):tag("ok","within highlight threshold")})