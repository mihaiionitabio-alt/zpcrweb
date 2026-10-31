M=>M&&M.ok?{keys:M.keys,
    omitted:(M.omitted||[]).map(o=>[o.name,o.why]),
    dropped:(M.dropped||[]).map(d=>[d.run,d.missing]),
    rows:(M.rows||[]).map(r=>r.key),X:M.X}:{ok:false,why:M?M.why:"none"}