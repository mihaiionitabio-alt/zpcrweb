()=>{const rows=REVIEW_STATE.comparison;if(rows.length)download(baseName()+"_sample_comparison.csv",
    toCSV(Object.keys(rows[0]).map(k=>({key:k,label:k})),rows),"text/csv");}