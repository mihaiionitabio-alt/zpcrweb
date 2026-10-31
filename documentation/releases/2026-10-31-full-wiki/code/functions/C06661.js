(v,i)=>{const fit=a+b*x[i];
    return {y:v,cl:fit,ucl:fit+3*s,lcl:fit-3*s,flags:Number.isFinite(v)&&Math.abs(v-fit)>3*s?["off the trend line (3σ)"]:[]};}