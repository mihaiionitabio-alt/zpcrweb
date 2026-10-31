w=>w.curve.forEach((v,i)=>{const y=h.Y(v);if(!Number.isFinite(y))return;
      const d=(h.X(i)-mx)**2+(y-my)**2;if(d<bd){bd=d;best={w,i,v};}})