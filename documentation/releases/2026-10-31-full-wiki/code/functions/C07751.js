r=>({severity:r.severity==="error"?tag("bad","error"):
      r.severity==="review"?tag("warn","review"):tag("ok","information"),
    area:r.area,finding:r.finding,occurrences:r.occurrences,runs:r.runCount,
    variants:r.variantCount,
    experiments:r.runs.slice(0,3).join(", ")+(r.runCount>3?` (+${r.runCount-3} more)`:"")})