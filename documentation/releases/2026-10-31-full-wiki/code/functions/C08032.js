()=>download(baseName()+"_experiment_settings.csv",
    toCSV([{key:"setting",label:"setting"},{key:"value",label:"value"},{key:"source",label:"read_from"}],notes),
    "text/csv")