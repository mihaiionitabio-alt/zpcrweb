sc=>note(tag+`Standard curve — ${sc.target}`,
    `slope ${sc.slope}, y-intercept ${sc.yIntercept}, R² ${sc.r2}; efficiency ${num(sc.efficiency,2)} % (derived: (10^(−1/slope) − 1) × 100)`,
    "analysis_result.txt Std Curve Results")