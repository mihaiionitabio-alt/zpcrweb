([t,d])=>note(tag+`Threshold and baseline — ${t}`,
    `${d.threshold} (${d.autoCt?"automatic":"manual"}); baseline ${d.autoBaseline?"automatic":`${d.bStart}–${d.bStop}`}`,
    `analysis_protocol.xml IDetectorSettings ObjectName=${t}`)