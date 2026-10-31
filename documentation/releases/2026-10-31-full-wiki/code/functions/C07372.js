r=>download(safeName(r.meta.name||r.file)+"_QuantStudio_export.txt",
      EDS.qsExport(r.eds,{pseudo:pseudoOn(),nameOf:exportName}),"text/plain")