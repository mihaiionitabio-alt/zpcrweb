(a,b)=>(Number(b.judgeable)-Number(a.judgeable))||b.n-a.n||b.runs-a.runs
    ||a.sample.localeCompare(b.sample)||a.target.localeCompare(b.target)