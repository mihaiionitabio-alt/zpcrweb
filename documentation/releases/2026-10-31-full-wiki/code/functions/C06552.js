c=>{const name=chName(c);if(!unique.includes(name))return; // Never overwrite a different acquisition channel.
        const a=acq.filter(r=>r.channel===c);ref[name]=a[0].ref;
        drift[name]=100*(a[a.length-1].ref/a[0].ref-1);intg[name]=ccMedian(a.map(r=>r.intgr));}