r => {
          const vals = [];
          for (let row = r.rows - refRows; row < r.rows; row++) vals.push(zpcrWellMean(r, c, row, col));
          return vals.reduce((a, b) => a + b, 0) / vals.length;
        }