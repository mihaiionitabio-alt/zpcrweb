e=>({...e,severity:e.severity==="error"?tag("bad","error"):
    e.severity==="review"?tag("warn","review"):tag("ok","information")})