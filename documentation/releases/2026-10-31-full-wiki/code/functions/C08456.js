s=>{let acc=0;
    for(let k=0;k<m;k++)if(eig[k].value>1e-9)acc+=s[k]*s[k]/eig[k].value;return acc;}