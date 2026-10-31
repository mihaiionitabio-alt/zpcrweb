([name,rows])=>({
    name:name+".csv",data:toCSV(Object.keys(rows[0]||{}).map(k=>({key:k,label:k})),rows)
  })