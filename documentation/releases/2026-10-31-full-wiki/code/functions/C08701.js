r => {
        const vals = [];
        for (let row = r.rows - refRows; row < r.rows; row++)
          for (let col = 0; col < r.cols; col++) vals.push(zpcrWellMean(r, c, row, col));
        const st = zpcrStats(vals);
        return st ? st.mean : NaN;
      }