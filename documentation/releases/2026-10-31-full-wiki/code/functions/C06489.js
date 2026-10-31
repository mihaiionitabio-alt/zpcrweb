(a,b)=>{if(!Number.isFinite(+a.target)||!Number.isFinite(+b.target))return;
    const A=R(a.target),B=R(b.target);if(Math.abs(A-B)<2)return;
    const sl=Number(b.slope);if(/cont/i.test(b.acqMode||"")||(Number.isFinite(sl)&&sl>0&&sl<1))return;
    out.set(`${A}→${B}`,{from:A,to:B});}