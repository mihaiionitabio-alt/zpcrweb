function block(b,o){
    for(let i=0;i<16;i++)M[i]=b[o+i*4]|b[o+i*4+1]<<8|b[o+i*4+2]<<16|b[o+i*4+3]<<24;
    let A=a0,B=b0,C=c0,D=d0;
    for(let i=0;i<64;i++){
      let F,g;
      if(i<16){F=(B&C)|(~B&D);g=i}else if(i<32){F=(D&B)|(~D&C);g=(5*i+1)%16}
      else if(i<48){F=B^C^D;g=(3*i+5)%16}else{F=C^(B|~D);g=(7*i)%16}
      const s=S[(i>>4)*4+(i&3)];
      F=(F+A+K[i]+M[g])|0;A=D;D=C;C=B;B=(B+((F<<s)|(F>>>(32-s))))|0;
    }
    a0=(a0+A)|0;b0=(b0+B)|0;c0=(c0+C)|0;d0=(d0+D)|0;
  }