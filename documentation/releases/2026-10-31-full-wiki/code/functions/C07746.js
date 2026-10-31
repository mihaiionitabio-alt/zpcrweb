r=>({...r,status:r.status==="Error"?tag("bad",r.status):
    r.status==="Review"?tag("warn",r.status):tag("ok",r.status)})