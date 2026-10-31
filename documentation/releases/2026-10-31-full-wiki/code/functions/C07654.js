(a,b)=>FINDING_SEVERITY_RANK[b.severity]-FINDING_SEVERITY_RANK[a.severity]
      ||b.occurrences-a.occurrences||a.area.localeCompare(b.area)