()=>{const rows=REVIEW_STATE.statistics;if(rows.length)download(baseName()+"_statistics.csv",
    toCSV(Object.keys(rows[0]).map(k=>({key:k,label:k})),rows),"text/csv");}