c=>({experiment:runName(e.run),run_status:e.status,criterion:c.criterion,
    sop_action:c.action,status:c.status,evidence:c.evidence,...sopMeta()})