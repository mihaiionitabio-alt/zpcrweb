t=>({time:EDS.dt(t[0]),minutes:((t[0]-L.temps[0][0])/60000).toFixed(3),
      sample_mean_C:t[1],cover_C:t[2],heatsink_C:t[3],zone_spread_C:t[4]})