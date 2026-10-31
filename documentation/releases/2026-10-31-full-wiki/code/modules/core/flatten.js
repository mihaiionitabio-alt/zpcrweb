/* ============================================================
   B. Flattening a decoded run into plain rows
   ============================================================ */
function operatorOf(run){const m=(run&&run.meta)||{};return m.Technician||m.CreatedByName||"";}
function sourceUidOf(run){return ((run&&run.meta)||{}).UID||(((run&&run.identities)||{}).UID||[])[0]||"";}
function sourceCRCOf(run){return ((run&&run.meta)||{}).sourceCRC32||"";}
function sourceSHA256Of(run){return ((run&&run.meta)||{}).sourceSHA256||"";}
function runDurationMinutes(run){
  const m=(run&&run.meta)||{},a=Date.parse(m.StartTime||""),b=Date.parse(m.EndTime||"");
  return Number.isFinite(a)&&Number.isFinite(b)&&b>=a?(b-a)/60000:"";
}
function uniqueCurveCount(run){
  return new Set(((run&&run.wells)||[]).filter(w=>w.curve).map(w=>`${w.channel}|${w.pos}`)).size;
}
function acquiredCurveCount(run){return Object.keys((run&&run.allCurves)||{}).length;}
function wellRows(run){
  return ssWells(run).map(w=>({
    experiment:run.meta.name||run.file,
    source_uid:sourceUidOf(run),source_crc32:sourceCRCOf(run),
    well:w.well,well_lims:posToLimsWell(w.pos,run.cols), position:w.pos+1,
    sample:w.sample||"", target:w.target||"", analysis:w.analysis||"", sample_selection:"included",
    channel:w.channel??"", filter:w.filterComb||"",
    role:w.role||"", instrument_type:w.instrType||"",
    replicate_of:Number.isFinite(w.replicateOf)?w.replicateOf+1:"",
    cq:Number.isFinite(w.CpRaw)&&w.CpRaw>0?w.CpRaw:"",
    concentration:w.CalcConc===""||w.CalcConc==null?"":Number(w.CalcConc),
    concentration_uncertainty:w.CalcConcUnc??"",conc_status:w.ConcStatus||"",
    crossing_point_status:w.CrossingPointStatus||"",warn_codes:w.warnCodes||"",warn_description:w.warnDesc||"",
    given_conc:w.givenConc??"",
    call:w.call||"", cycles:w.curve?w.curve.length:"",
    has_curve:w.curve?"yes":"no",
    platform:run.platform||"LightCycler 480",
    amp_status:w.eds?w.eds.ampLabel:"",cq_confidence:w.eds&&w.eds.cqConf!=null?w.eds.cqConf:"",
    flags:w.eds?w.warnCodes:"",cq_mean_stored:w.eds&&w.eds.ctMean!=null?w.eds.ctMean:"",
    cq_sd_stored:w.eds&&w.eds.ctSd!=null?w.eds.ctSd:"",
    delta_cq:w.eds&&w.eds.dct!=null?w.eds.dct:"",
    delta_cq_mean:w.eds&&w.eds.ddct&&w.eds.ddct.dctMean!=null?w.eds.ddct.dctMean:"",
    delta_delta_cq:w.eds&&w.eds.ddct&&w.eds.ddct.ddct!=null?w.eds.ddct.ddct:"",
    rq:w.eds&&w.eds.ddct&&w.eds.ddct.rq!=null?w.eds.ddct.rq:"",
    rq_min:w.eds&&w.eds.ddct&&w.eds.ddct.rqMin!=null?w.eds.ddct.rqMin:"",
    rq_max:w.eds&&w.eds.ddct&&w.eds.ddct.rqMax!=null?w.eds.ddct.rqMax:"",
    threshold:w.eds&&w.eds.threshold!=null?w.eds.threshold:"",
    cq_rederived:w.eds&&w.eds.ctRecalc!=null?Number(w.eds.ctRecalc.toFixed(4)):"",
    omitted:w.eds?(w.eds.omit?"yes":""):""
  }));
}
function allWellRows(){return RUNS.flatMap(wellRows);}
function tmRows(){
  return RUNS.flatMap(run=>(run.tmWells||[]).filter(t=>ssIncluded(run,t)).flatMap(t=>{
    const head={
      experiment:run.meta.name||run.file,source_uid:sourceUidOf(run),source_crc32:sourceCRCOf(run),
      well:t.well,well_lims:posToLimsWell(t.pos,run.cols),position:t.pos+1,
      sample:t.sample||"",analysis:t.analysis||"",
      channel:t.filterComb||t.filterName||"",channel_index:t.channel??"",
      melt_program:t.meltProgram||"",melt_program_index:t.meltProgramIndex??"",
      melt_segment:t.meltSegment??"",melt_curve_ambiguous:t.meltCurveAmbiguous?"yes":"",
      peaks_found:t.nPeaks||0,
      call_code:Number.isFinite(t.callCode)?t.callCode:"",
      peak_state:(t.nPeaks||0)>0?"peak detected":"no peak",
      manual_tms:String(t.manualTms??t.manual??"")==="1"?"yes":""
    };
    const n=t.nPeaks||0;
    if(!n)return [{...head,peak_index:"",peak:"",area:"",width:"",height:"",shoulder:""}];
    return Array.from({length:n},(_,i)=>({
      ...head,peak_index:i+1,
      peak:t.tms?.[i]??"",area:t.areas?.[i]??"",width:t.widths?.[i]??"",
      height:t.heights?.[i]??"",shoulder:(t.shoulders||[]).includes(i)?"yes":""
    }));
  }));
}
function metaRows(){
  /* Every field is read defensively. This table is drawn on load, before any
     check has run, so a run that decoded only partly must still be describable -
     crashing here would hide the very problem the user needs to see. */
  return RUNS.map(r=>({
    file:r.file,platform:r.platform||"LightCycler 480",integrity:integrityLabel(r),
    source_uid:sourceUidOf(r),source_crc32:sourceCRCOf(r),source_sha256:sourceSHA256Of(r),
    source_bytes:(r.meta&&r.meta.sourceBytes)||"",experiment:(r.meta&&r.meta.name)||"",
    experiment_created:(r.meta&&r.meta.Created)||"",experiment_created_by:(r.meta&&r.meta.CreatedByName)||"",
    experiment_last_modified:(r.meta&&r.meta.LastModified)||"",
    run_created:(r.meta&&r.meta.RunCreated)||"",run_started:(r.meta&&r.meta.StartTime)||"",
    run_ended:(r.meta&&r.meta.EndTime)||"",run_duration_minutes:runDurationMinutes(r),
    operator:operatorOf(r),software_version:(r.meta&&r.meta.SWVersion)||"",
    instrument:(r.meta&&r.meta.InstrumentName)||"",
    block:r.blockId||"", plate:`${r.rows??"?"}x${r.cols??"?"}`, cycles:r.nCycles??"",
    channels:(((r.protocol||{}).channels)||[]).filter(c=>c.active).map(c=>c.name||`${c.ex}-${c.em}`).join(" | "),
    fluorescence_scaling_factors:(r.acqScalingFactors||[]).join(" | "),
    analyses:(r.analyses||[]).length, modules:(r.kinds||[]).join(" | "),
    quantification_results:(r.wells||[]).length, melting_results:(r.tmWells||[]).length,
    curves_decoded:uniqueCurveCount(r),curves_linked_to_results:uniqueCurveCount(r),
    curves_acquired:acquiredCurveCount(r),
    acquisition_error:r.acqError||""
  }));
}

