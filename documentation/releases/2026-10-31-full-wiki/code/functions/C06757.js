(r,i)=>{const v=ccValue(def,r,variant);let y=NaN,s;
      if(type==="i"||type==="trend")y=typeof v==="object"&&v?v.mean:Number(v);
      else if(type==="xbars"&&v){y=v.mean;s=v.sd;}
      else if(type==="p"&&v&&v.n)y=v.bad/v.n;else if(type==="u"&&v&&v.exposure)y=v.count/v.exposure;else if(type==="c"&&v)y=v.count;
      return {y,s,raw:y,cl:NaN,ucl:NaN,lcl:NaN,flags:[],pre:true,row:r,x:Xall.x[i]};}