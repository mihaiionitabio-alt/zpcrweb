s=>{const targets=[...new Set(r.results.filter(x=>x.sample===s).map(x=>x.target))].sort();
      targets.forEach(t=>{const g=r.results.filter(x=>x.sample===s&&x.target===t),det=g.find(x=>!x.undetermined),
        st=g.find(x=>x.studyStat&&x.studyStat[0]!=="-1.0"),q=st?(st.studyRq||[]).map(num):[],ss=st?st.studyStat.map(num):[];
        rows.push({"Sample Name":s?nm(s):" ","Target Name":t,"Task":taskOf(g[0]).task||"",
          "RQ":q[1]??null,"RQ Min":q[2]??null,"RQ Max":q[3]??null,"Ct Mean":det?det.ctMean:null,
          "Delta Ct Mean":st?ss[1]:null,"Delta Ct SD":st?ss[3]:null,"Delta Delta Ct":q[4]??null});});}