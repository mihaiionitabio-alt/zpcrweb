p=>{
          const v=cyc.map(c=>channels[ci][c][p]).filter(Number.isFinite);
          return v.length?Math.max(...v)-Math.min(...v):0;
        }