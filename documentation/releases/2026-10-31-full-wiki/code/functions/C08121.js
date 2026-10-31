(o,i)=>{
        offsets[i]=len;
        put(`${i+1} 0 obj\n`);
        if(typeof o==="string")put(o+"\n");
        else{put(o.dict+"\nstream\n");put(o.stream);put("\nendstream\n");}
        put("endobj\n");
      }