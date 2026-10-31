r=>{
    const m=r.meta||{};
    note("Experiment",m.name||r.file,"HTCExperiment name");
    if(m.UID)note("Source UID",m.UID,"HTCExperiment UID");
    if(m.sourceCRC32)note("Source CRC-32",m.sourceCRC32,
      `${m.sourceBytes||"?"} source bytes`);
    if(m.sourceSHA256)note("Source SHA-256",m.sourceSHA256,
      "SHA-256 of the unmodified source .ixo bytes");
    if(m.Created)note("Experiment created",m.Created.replace("T"," ").slice(0,19),
      "HTCExperiment Created");
    if(m.LastModified&&!/^1899/.test(m.LastModified))
      note("Experiment last modified",m.LastModified.replace("T"," ").slice(0,19),
        "HTCExperiment LastModified");
    if(m.RunCreated)note("Run created",m.RunCreated.replace("T"," ").slice(0,19),
      "HTCRun Created");
    if(m.StartTime)note("Run started",m.StartTime.replace("T"," ").slice(0,19),
      "HTCRun StartTime");
    if(m.EndTime)note("Run ended",m.EndTime.replace("T"," ").slice(0,19),
      "HTCRun EndTime");
    const duration=runDurationMinutes(r);
    if(Number.isFinite(duration))note("Run duration",`${duration.toFixed(2)} minutes`,
      "HTCRun StartTime to EndTime");
    if(m.Technician||m.CreatedByName)
      note("Operator",m.Technician||m.CreatedByName,
        m.Technician?"HTCRun Technician":"HTCExperiment CreatedByName");
    if(m.CreatedByName&&m.Technician&&m.CreatedByName!==m.Technician)
      note("Experiment created by",m.CreatedByName,"HTCExperiment CreatedByName");
    if(m.LastModifiedByName&&m.LastModifiedByName!==m.CreatedByName)
      note("Last modified by",m.LastModifiedByName,"HTCExperiment LastModifiedByName");
    if(m.SWVersion)note("Software version",m.SWVersion,"HTCExperiment SWVersion");
    if(m.InstrumentName)note("Instrument",m.InstrumentName,"InstrumentName");
    if(m.SerialNumber)note("Serial number",m.SerialNumber,"SerialNumber");
    if(r.integrity)note("Container checksum",integrityLabel(r)+(r.integrity.computed?` (${r.integrity.computed})`:""),
      "trailing line after </objectstream>: MD5 of the object stream, byte-swapped words");
    if(r.format&&r.format.signature)
      note("Container","signature "+r.format.signature+", version "+r.format.version,
        "objectstream attributes");
  }