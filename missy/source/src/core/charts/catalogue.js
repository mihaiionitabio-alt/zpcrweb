/* ============================================================
   C2. Control charts — catalogue and statistics
   ------------------------------------------------------------
   One entry per chart. "metric" is the key in the history row;
   "type" is the default chart; the user can change type, limits,
   rules and alarm action on the chart page — those settings are
   saved in the SOP profile (SOP.controlCharts[id]) so they are
   versioned and covered by the profile SHA-256.
   status "A" = shown in the page before this release (now also a tile),
   "B" = new from the hardware / timing analysis.
   ============================================================ */
const CC_GROUPS=[
  {id:"hardware",title:"1 · Hardware",sub:"thermal, optics, mechanics — predictive maintenance"},
  {id:"software",title:"2 · Software",sub:"embedded computer, analysis software, data integrity"},
  {id:"method",title:"3 · Method",sub:"reagents, probes, assay behaviour"},
  {id:"operator",title:"4 · Operator",sub:"pipetting skill, consistency, forensic"}];
const CC_CHARTS=[
 /* ---------------- 1. HARDWARE ---------------- */
 {id:"heat_rate",code:"B-H1",group:"hardware",inst:["LC","QS"],type:"trend",unit:"°C/s",better:"high",spec:{LC:{lo:4.3},QS:{}},
  title:"Peak heating rate (2-s window)",source:"LC TemperatureLog · QS log sample temperature",
  idea:"How fast the Peltier elements can heat the block: the steepest 2-second slope of every heating transition, median over the run (manual: 4.8 °C/s). Independent of plateau detection, so short holds do not distort it.",
  reading:"A slow fall over months is Peltier or thermal-interface ageing; the fitted line gives a conditional limit-crossing estimate, not a failure date. A single low run points to the plate or a blocked vent that day."},
 {id:"cool_rate",code:"B-H2",group:"hardware",inst:["LC","QS"],type:"trend",unit:"°C/s",better:"high",spec:{LC:{lo:2.1},QS:{}},
  title:"Peak cooling rate (2-s window)",source:"as B-H1",
  idea:"How well the heat sink and fans remove heat: steepest 2-second cooling slope of every transition, median over the run (manual: 2.5 °C/s).",
  reading:"Falling cooling with stable heating = clogged fan filter or failing fan (clean the filters, check fans) before Peltier replacement."},
 {id:"overshoot",code:"B-H3",group:"hardware",inst:["LC","QS"],type:"cusum",unit:"°C",better:"target",
  title:"Overshoot at the denaturation step",source:"as B-H1",
  idea:"Block temperature beyond the setpoint before it settles. The LC480 overshoots 4–6 °C by design, identically every cycle.",
  reading:"Watch for change, not size: a CUSUM drifting up or down means the controller or the temperature sensor has changed."},
 {id:"settling",code:"B-H3b",group:"hardware",inst:["LC","QS"],type:"i",unit:"s",better:"low",res:{LC:0.41,QS:1},
  title:"Settling time at the denaturation step",source:"as B-H1",
  idea:"Seconds from the 90 % point until the block stays within ±0.5 °C of the setpoint.",
  reading:"Longer settling with a normal ramp rate points to control tuning or sensor lag."},
 {id:"transition",code:"B-H3c",group:"hardware",inst:["LC","QS"],type:"i",unit:"s",better:"low",variants:true,res:{LC:0.1,QS:0.5},
  title:"Transition time A → B °C",source:"LC TemperatureLog · QS log sample temperature · run program",
  idea:"Seconds the block needs to go from one programmed temperature to the next (e.g. 95 → 60 °C): from leaving ±0.5 °C of the start temperature until first within ±0.5 °C of the target, median over all cycles of the run. One chart per transition of the program. Includes ramp and overshoot, so it shows how much of every cycle is spent moving instead of holding.",
  reading:"Compare a transition only with itself and the same program. A cooling transition that lengthens while heating transitions stay flat points to heat removal (fans, filters, heat sink); all transitions lengthening together points to the Peltier elements or the room."},
 {id:"hold_temp",code:"B-H4",group:"hardware",inst:["LC","QS"],type:"xbars",unit:"°C from setpoint",better:"target",
  title:"Temperature at the moment of reading",source:"LC temperature of every acquisition · QS sample temperature of every image",
  idea:"Offset (X̄) and stability (S) of the block while the camera reads, one subgroup per run.",
  reading:"X̄ drifting away from its usual offset = temperature calibration drift (verify with a temperature plate). S rising = unstable control."},
 {id:"zone_spread",code:"B-H5",group:"hardware",inst:["QS"],type:"ewma",unit:"°C",better:"low",spec:{QS:{hi:1.5}},
  title:"Block zone uniformity (95th percentile)",source:"QS log, six sample zones",
  idea:"Difference between the warmest and coolest of the six zones, 95th percentile over the run.",
  reading:"An EWMA creeping up means one zone is losing its match; look at the Temperature graph to find which."},
 {id:"heatsink_max",code:"B-H6",group:"hardware",inst:["QS"],type:"i",unit:"°C",better:"low",
  title:"Heat-sink maximum",source:"QS log",idea:"Highest heat-sink temperature during the run.",
  reading:"Rising over time with the same protocol = cooling capacity dropping (fans, dust, room temperature)."},
 {id:"cover_temp",code:"B-H6b",group:"hardware",inst:["QS"],type:"i",unit:"°C",better:"target",
  title:"Heated cover temperature",source:"QS log",idea:"Median cover temperature during the run (setpoint 105 °C).",
  reading:"Below the setpoint = cover heater fault; condensation and evaporation follow."},
 {id:"lamp_ref",code:"B-H8",group:"hardware",inst:["LC"],type:"i",unit:"reference counts",better:"target",variants:true,
  title:"Lamp reference channel (stability)",source:"LC AcquisitionStore RefValue, first reading of the run, per filter pair",
  idea:"The instrument measures the Xenon lamp through a reference channel and compensates for it. In 155 runs from 2022–2026 the value stayed within ±1 %, so it shows regulation, not lamp ageing. Lamp hours and intensity % are only in Tools → Instruments (manual p. 208).",
  reading:"Stable = the lamp is still inside the range the instrument can compensate. A step or a point outside the limits = lamp, light guide or reference-sensor fault; check the lamp intensity % in the instrument software."},
 {id:"lamp_drift",code:"B-H9",group:"hardware",inst:["LC"],type:"i",unit:"% change in the run",better:"target",variants:true,
  title:"Lamp drift within a run",source:"LC RefValue first vs last reading",
  idea:"How much the lamp intensity changes during one run.",reading:"Growing drift is typical of a lamp near the end of its life."},
 {id:"led_current",code:"B-H10",group:"hardware",inst:["QS"],type:"trend",unit:"current (as logged)",better:"target",
  title:"LED drive current",source:"QS log LEDStatus",idea:"Median LED current during the run.",
  reading:"The instrument raises current to keep light output: a rising trend is LED ageing; the line predicts when it reaches the limit you set."},
 {id:"led_junction",code:"B-H10b",group:"hardware",inst:["QS"],type:"i",unit:"°C",better:"low",
  title:"LED junction temperature (maximum)",source:"QS log LEDStatus",idea:"Hottest LED junction temperature in the run.",
  reading:"Higher than usual = LED cooling problem; LEDs age faster when hot."},
 {id:"exposure",code:"B-H11",group:"hardware",inst:["LC","QS"],type:"i",unit:"ms",better:"low",variants:true,
  title:"Automatic integration time / exposure",source:"LC IntgrTime per channel · QS exposure per filter",
  idea:"Both instruments lengthen exposure automatically when the signal is weak.",
  reading:"A slow rise is compatible with weaker signal; verify matched controls and optical configuration before attributing ageing (compare with B-H8/B-H10); a jump after a reagent change points to the method instead."},
 {id:"saturation",code:"B-H12",group:"hardware",inst:["QS"],type:"p",unit:"share of well images",better:"low",
  title:"Saturated well images",source:"QS quant files, saturation column",idea:"Share of well images with at least one saturated pixel.",
  reading:"A rise = exposure logic or camera fault, or overloaded samples; values above zero make the curve plateau unreliable."},
 {id:"calib_uniformity",code:"B-H13",group:"hardware",inst:["QS"],type:"i",unit:"edge / centre",better:"target",
  title:"Uniformity calibration: edge-to-centre ratio",source:"QS calibrations/uniformity.ini",
  idea:"Changes only when the instrument is recalibrated.",reading:"A step at a recalibration shows how much the optics changed; a large step deserves a service question."},
 {id:"calib_background",code:"B-H13b",group:"hardware",inst:["QS"],type:"i",unit:"counts",better:"low",
  title:"Background calibration: mean offset",source:"QS calibrations/background.ini",idea:"Mean absolute background offset of the last background calibration.",
  reading:"Rising between calibrations = contamination of the block or optics."},
 {id:"calib_roi",code:"B-H13c",group:"hardware",inst:["QS"],type:"i",unit:"pixels",better:"target",
  title:"Well-position (ROI) calibration: spot diameter",source:"QS calibrations/roi.ini",idea:"Mean spot diameter from the ROI calibration.",
  reading:"A change means the optical alignment moved."},
 {id:"wheel_ms",code:"B-H14",group:"hardware",inst:["QS"],type:"i",unit:"ms",better:"low",
  title:"Filter-wheel move time",source:"QS log Motor start/end",idea:"Median time of a filter-wheel move.",
  reading:"Slower moves = motor or bearing wear."},
 {id:"wheel_slow",code:"B-H14b",group:"hardware",inst:["QS"],type:"p",unit:"share of moves",better:"low",
  title:"Filter-wheel moves slower than 500 ms",source:"QS log",idea:"Share of moves longer than 500 ms (normal ≈ 300 ms).",
  reading:"Occasional stalls come before a failure; any upward trend is worth a service call."},
 {id:"encoder",code:"B-H15",group:"hardware",inst:["QS"],type:"i",unit:"encoder counts",better:"target",variants:true,
  title:"Filter-wheel position offset",source:"QS log Emission/Excitation Encoder",idea:"Encoder offset after each move; constant for a healthy wheel.",
  reading:"Any step = the wheel slipped, was re-homed or serviced."},
 {id:"cam_overhead",code:"B-H16",group:"hardware",inst:["QS"],type:"xbars",unit:"ms",better:"low",
  title:"Camera readout time beyond the exposure",source:"QS log CAMera start/end minus requested exposure",
  idea:"About 0.5 s per image; one subgroup = all images of the run.",reading:"A jump = camera or its interface; a slow rise = controller slowing (compare with software charts)."},
 {id:"chan_switch",code:"B-H17",group:"hardware",inst:["LC"],type:"i",unit:"ms",better:"low",res:{LC:10},
  title:"Channel switch time",source:"LC acquisition times minus integration time",
  idea:"Time between the channels of one reading, net of integration (≈ 1.0–1.4 s; filter switch < 0.65 s by the manual).",
  reading:"Rising = filter wheels or camera readout slowing."},
 {id:"cover_down",code:"B-H18",group:"hardware",inst:["QS"],type:"trend",unit:"s",better:"low",x:"cycles",
  title:"Heated cover lowering time",source:"QS log Cover Lowering → Lowered",idea:"Motorised cover pressing onto the plate (≈ 10 s).",
  reading:"Getting slower = motor or linkage wear, or plates/seals that are too tall."},
 {id:"cover_up",code:"B-H18b",group:"hardware",inst:["QS"],type:"i",unit:"s",better:"low",
  title:"Heated cover raising time",source:"QS log Cover Raising → Raised",idea:"Cover lifting off the plate (≈ 5.4 s).",reading:"As B-H18."},
 {id:"bg_median",code:"A-H3",group:"hardware",inst:["LC","QS"],type:"i",unit:"fluorescence",better:"target",variants:true,
  title:"Background fluorescence per channel",source:"stored curves, cycles 3–10",idea:"Median background of all wells, per channel.",
  reading:"Slow decline = light source ageing; a raised run = plate, seal or contamination."},
 {id:"plateau_median",code:"A-H3b",group:"hardware",inst:["LC","QS"],type:"i",unit:"fluorescence",better:"target",variants:true,
  title:"End-point fluorescence per channel",source:"stored curves, last cycle",idea:"Median end-point of all wells, per channel.",
  reading:"Moves together with B-H8/B-H10 when optics age; alone it points to the method (probe) — see M-group."},
 {id:"run_minutes",code:"A-H4",group:"hardware",inst:["LC","QS"],type:"i",unit:"minutes",better:"target",
  title:"Run duration",source:"run start / end",idea:"Only comparable between runs of the same protocol.",
  reading:"Compare with A-H4a and A-H4b before attributing a change to PCR cycling; calendar elapsed time can include timing outside the recorded thermal sequence."},
 {id:"temperature_log_minutes",code:"A-H4a",group:"hardware",inst:["LC","QS"],type:"i",unit:"minutes",better:"target",
  title:"Temperature-log duration",source:"LC TemperatureLog / QS measured block-temperature log: last minus first valid timestamp",
  idea:"Duration covered by the recorded temperature trace, including initial heating, amplification and cooling where logged. It is not calculated from programmed holds. Logging gaps remain part of the span; a partial trace need not cover the whole run. Missing or reversed log timing is not plotted.",
  reading:"A change here reflects the recorded thermal sequence or its coverage. Compare only matching protocols; confirm cycle counts and trace completeness before interpreting it as faster or slower PCR."},
 {id:"run_log_gap_seconds",code:"A-H4b",group:"hardware",inst:["LC","QS"],type:"i",unit:"seconds",better:"target",
  title:"Total run minus temperature-log duration",source:"(run EndTime - StartTime) minus measured temperature-log span",
  idea:"Signed difference between calendar elapsed run time (A-H4) and temperature-log duration (A-H4a). It may reflect preparation/finalisation, incomplete logging or different time bases. It does not locate the difference before versus after the trace. Negative values are preserved as timing discrepancies, not clamped to zero. Both durations must be available.",
  reading:"If total duration changes while A-H4a stays stable, investigate time outside the recorded thermal span or clock/log accounting; this difference alone cannot identify the cause."},
 /* ---------------- 2. SOFTWARE ---------------- */
 {id:"cmd_rt",code:"B-S1",group:"software",inst:["QS"],type:"i",unit:"ms (95th pct)",better:"low",log:true,
  title:"Reply time to the PC software",source:"QS log C: → S: pairs",idea:"How fast the embedded computer answers commands.",
  reading:"Rising = controller overloaded or network problem."},
 {id:"tick_late",code:"B-S2",group:"software",inst:["QS"],type:"i",unit:"ms (95th pct)",better:"low",
  title:"Once-per-second timer lateness",source:"QS log Time lines",idea:"How late the 1-s housekeeping timer fires.",
  reading:"Rising = the embedded CPU is saturated (mostly while imaging)."},
 {id:"catch_up",code:"B-S2b",group:"software",inst:["QS"],type:"u",unit:"events per run hour",better:"low",
  title:"Scheduler falling behind",source:"QS log Scheduler 'Catching up'",idea:"How often the task scheduler had to catch up, per hour of run.",
  reading:"A u-chart above its limit = the internal computer is overloaded."},
 {id:"img_proc",code:"B-S3",group:"software",inst:["QS"],type:"i",unit:"ms (95th pct)",better:"low",log:true,
  title:"Image → processing delay",source:"QS log Image → Preprocessing",idea:"Time from the last image to the start of its processing.",
  reading:"Rising = storage or CPU slowing; one long delay is a single stall."},
 {id:"roi_ms",code:"B-S4",group:"software",inst:["QS"],type:"i",unit:"ms",better:"low",
  title:"Image analysis time",source:"QS log ROI Quantitation",idea:"The software's own processing time per image.",
  reading:"A step after an update = different firmware behaviour (see version markers)."},
 {id:"runtime_err",code:"B-S5",group:"software",inst:["QS"],type:"i",unit:"%",better:"target",
  title:"Run-time prediction error",source:"QS log Time elapsed/remaining",idea:"Actual minus predicted run time.",
  reading:"Creeping up = actions take longer than the firmware expects."},
 {id:"handoff_min",code:"B-S6",group:"software",inst:["QS"],type:"i",unit:"minutes",better:"low",
  title:"Data hand-off time",source:"QS log end → instrumentdata.mf time",idea:"Minutes from run end until the data were packed for the PC.",
  reading:"Long = network or PC problem, or a manual delay."},
 {id:"log_errors",code:"B-S8",group:"software",inst:["QS"],type:"c",unit:"errors",better:"low",
  title:"Command errors in the instrument log",source:"QS log 'Error in command'",idea:"Count of command errors per run.",
  reading:"New or more errors = firmware or configuration change."},
 {id:"cycle_sd",code:"B-S9",group:"software",inst:["LC","QS"],type:"i",unit:"ms",better:"low",
  title:"Cycle-timing regularity",source:"LC acquisition times · QS image times",idea:"Standard deviation of the cycle period within a run.",
  reading:"Larger = scheduling problems in the instrument."},
 {id:"templog_late",code:"B-S10",group:"software",inst:["LC"],type:"p",unit:"share of intervals",better:"low",
  title:"Temperature-log intervals over 500 ms",source:"LC TemperatureLog times (normally 410–420 ms)",idea:"Regularity of the control-loop logging.",
  reading:"Any rise = controller overload."},
 {id:"invalid_acq",code:"B-S11",group:"software",inst:["LC"],type:"p",unit:"share of readings",better:"low",
  title:"Invalid fluorescence readings",source:"LC AcquisitionStore Valid flag",idea:"Readings the instrument marked invalid.",reading:"Above zero = acquisition fault."},
 {id:"ct_mismatch",code:"B-S12",group:"software",inst:["QS"],type:"p",unit:"share of wells",better:"low",
  title:"Stored Ct not reproducible (> 0.2)",source:"stored ΔRn and threshold",idea:"Wells whose stored Ct differs from the recalculation.",
  reading:"Non-zero requires checking algorithm, precision, stored settings and provenance; it does not establish post-analysis editing."},
 {id:"edit_delay",code:"A-S4",group:"software",inst:["LC","QS"],type:"i",unit:"log10 hours",better:"low",
  title:"Run end → last change",source:"file dates",idea:"Processing delay on a log scale (0 = 1 h, 1 = 10 h, 2 = 100 h).",
  reading:"Points above the limit are late edits; cross-check with the operator group."},
 {id:"findings",code:"A-S6",group:"software",inst:["LC","QS"],type:"c",unit:"findings",better:"low",
  title:"Forensic findings per run",source:"forensic log (review + error)",idea:"Count of review and error findings for the run.",
  reading:"A run above the limit needs a closer look in the forensic log."},
 /* ---------------- 3. METHOD ---------------- */
 {id:"pc_cq",segmentBy:"batch",code:"A-M1",group:"method",inst:["LC","QS"],type:"i",unit:"Cq",better:"target",variants:true,westgard:true,
  title:"Positive control Cq (Levey-Jennings)",source:"SOP positive-control wells",idea:"Mean Cq of the positive control per run and target, with Westgard rules.",
  reading:"Across-run rules flag unexpected control behaviour. R-4s is not applied to run means. Investigate lot, extraction batch, assay and instrument effects."},
 {id:"pc_amplitude",segmentBy:"batch",code:"B-M1",group:"method",inst:["LC","QS"],type:"ewma",unit:"fluorescence",better:"high",variants:true,
  title:"Probe signal strength (positive control)",source:"stored curves of the positive control",idea:"Amplitude (plateau above background) of the same control each run.",
  reading:"Falling with a stable Cq = probe or dye degradation (storage, freeze-thaw); a step at a lot change = the lot. Compare with B-H8/B-H10 to exclude the optics."},
 {id:"rox_level",code:"B-M2",group:"method",inst:["QS"],type:"i",unit:"passive reference",better:"target",
  title:"Passive reference (ROX) level",source:"QS multicomponent data, cycles 1–5",idea:"Median passive-reference level of named wells.",
  reading:"A step = new master-mix lot or ROX concentration."},
 {id:"efficiency",code:"B-M3",group:"method",inst:["LC","QS"],type:"trend",unit:"% efficiency",better:"target",variants:true,spec:{LC:{lo:90,hi:110},QS:{lo:90,hi:110}},
  title:"PCR efficiency from the standards",source:"standards with a stored quantity",idea:"Efficiency of the standard curve per run and target.",
  reading:"A slow drop = degrading standard or reagent; outside 90–110 % fails MIQE-style acceptance."},
 {id:"ntc_rate",code:"B-M5",group:"method",inst:["LC","QS"],type:"p",variants:true,unit:"share of NTC wells",better:"low",
  title:"Negative controls by process stage",source:"SOP negative controls",idea:"Share of negative-control wells with any Cq.",
  reading:"Rising = contamination of reagents or of the working area (ISFG, MIQE)."},
 {id:"ic_shift",code:"B-M6",group:"method",inst:["LC","QS"],type:"ewma",unit:"cycles",better:"low",
  title:"IC shift from fixed reference",source:"SOP internal-control target",idea:"Mean IC Cq shift from the configured fixed reference. Missing reference means unavailable; endogenous taxon targets are not fixed-input IPCs.",
  reading:"Upward drift = extraction method or kit problem."},
 {id:"low_conf",code:"B-M9",group:"method",inst:["QS"],type:"p",unit:"share of wells",better:"low",
  title:"Low Cq confidence",source:"QS CQCONF flag",idea:"Share of wells flagged for low Cq confidence.",reading:"A rise = noisy curves, often probe or baseline problems."},
 {id:"late_rate",code:"B-M10",group:"method",inst:["LC","QS"],type:"p",unit:"share of results",better:"low",
  title:"Late signal / stochastic-zone results",source:"SOP outcomes",idea:"Share of sample results falling in the late-signal or low-quantity zone.",
  reading:"A rise = sensitivity drop or poorer samples."},
 /* ---------------- 4. OPERATOR ---------------- */
 {id:"rep_sd",code:"B-O1",group:"operator",inst:["LC","QS"],type:"i",unit:"Cq SD",better:"low",byOperator:true,
  title:"Replicate precision (pooled SD, Cq < 30)",source:"replicate groups",idea:"Pipetting precision; replicates above Cq 30 are left out so stochastic noise does not hide skill.",
  reading:"One operator's points above the others → retraining; everyone rising → pipette calibration."},
 {id:"rox_cv",code:"B-O2",group:"operator",inst:["QS"],type:"i",unit:"% CV",better:"low",byOperator:true,
  title:"Dispensed-volume spread (ROX CV)",source:"QS passive reference, cycles 1–5",idea:"Raw passive-reference level varies with the dispensed volume.",
  reading:"High CV = uneven pipetting or bubbles."},
 {id:"rowcol",code:"B-O3",group:"operator",inst:["LC","QS"],type:"i",unit:"Cq",better:"low",byOperator:true,
  title:"Row / column pattern",source:"replicate residuals by plate row and column",idea:"Largest mean Cq offset of a plate row or column.",
  reading:"One row or column off = a faulty multichannel tip or loading-order error."},
 {id:"ntc_op",code:"B-O5",group:"operator",inst:["LC","QS"],type:"funnel",metric:"ntc_rate",variants:true,unit:"share of NTC wells",better:"low",
  title:"Contamination rate by operator (funnel)",source:"as B-M5",idea:"NTC positives per operator against the number of NTCs they ran.",
  reading:"Outside the 99.8 % line → investigate; the funnel keeps small workloads from looking unfair."},
 {id:"action_op",code:"B-O6",group:"operator",inst:["LC","QS"],type:"funnel",metric:"action_rate",unit:"share of results",better:"low",
  title:"Repeat / inconclusive / invalid rate by operator (funnel)",source:"SOP outcomes",idea:"Analytical robustness per person.",reading:"As B-O5."},
 {id:"manual_rate",code:"B-O7",group:"operator",inst:["LC","QS"],type:"p",unit:"share of settings",better:"low",byOperator:true,
  title:"Manual interventions",source:"manual threshold/baseline, omitted wells, manual calls",idea:"Share of settings or wells changed by hand.",
  reading:"High or rising → ask for documented reasons (OIG report lessons); compare operators with the funnel view."},
 {id:"call_disagree",code:"B-O9",group:"operator",inst:["LC","QS"],type:"p",unit:"share of wells",better:"low",byOperator:true,
  title:"Stored calls that disagree with the SOP",source:"stored call vs SOP outcome",idea:"Consistency and fairness: do calls follow the written rules?",
  reading:"Disagreement concentrated in one person or case type → training or bias check."},
 {id:"copied",code:"B-O11",group:"operator",inst:["LC","QS"],type:"c",unit:"events",better:"low",
  title:"Copied-data events",source:"forensic log (identical curves / Cq)",idea:"Must be zero.",reading:"Any event is a forensic finding."},
];
const CC_BY_ID=Object.fromEntries(CC_CHARTS.map(c=>[c.id,c]));
const CC_DEFAULT_CFG={enabled:true,type:"",phase1:20,lambda:0.2,L:2.7,k:0.5,h:4,specLo:"",specHi:"",x:"",warnAhead:10,baseFrom:"",trendFit:"phase1",
  rules:{r2:true,r3:true,r4:true,r5:true},action:"review"};
/* For plate-content-dependent series (background, plateau, exposure, run length, edit delay, lamp drift, cycle timing)
   sustained shifts follow the assay mix, not the instrument: only the 3σ rule is on by default; rules 2–5 can be switched on. */
const CC_RULES_OFF=new Set(["bg_median","plateau_median","exposure","run_minutes","temperature_log_minutes","run_log_gap_seconds","edit_delay","lamp_drift","cycle_sd"]);
function ccCfg(id){const c=((SOP.controlCharts||{})[id])||{},base=CC_RULES_OFF.has(id)?{r2:false,r3:false,r4:false,r5:false}:{};
  return Object.assign({},CC_DEFAULT_CFG,c,{rules:Object.assign({},CC_DEFAULT_CFG.rules,base,c.rules||{})});}
function ccSetCfg(id,patch){SOP.controlCharts=SOP.controlCharts||{};
  SOP.controlCharts[id]=Object.assign({},SOP.controlCharts[id]||{},patch);sopChanged();}

/* ---------- statistics ---------- */
const CC_C4=n=>n>1?4*(n-1)/(4*n-3):1;
function ccPhase(v,n){const f=v.filter(Number.isFinite);return f.slice(0,Math.max(Math.min(n,f.length),Math.min(5,f.length)));}
/* individuals chart; Western Electric rules 2–5 on top of the 3-sigma rule */
function ccI(y,cfg){
  const base=ccPhase(y,cfg.phase1),cl=mean(base),mr=base.slice(1).map((v,i)=>Math.abs(v-base[i])),
    sig=Math.max(mr.length?mean(mr)/1.128:(sd(base)||Math.abs(cl)*0.05||1),(cfg.res||0)/2)||1;
  const dead=(cfg.res||0)/2/sig,z=y.map(v=>{const q=(v-cl)/sig;return Math.abs(q)<dead?0:q;});
  return {cl,sigma:sig,pts:y.map((v,i)=>{const f=[];if(!Number.isFinite(v))return {y:v,cl,ucl:cl+3*sig,lcl:cl-3*sig,flags:f};
    if(Math.abs(z[i])>3)f.push("beyond 3σ");
    const win=(n,k,lim)=>{if(i<n-1)return false;const w=z.slice(i-n+1,i+1).filter(Number.isFinite);return Math.sign(z[i])!==0&&w.filter(q=>Math.sign(q)===Math.sign(z[i])&&Math.abs(q)>lim).length>=k;};
    if(cfg.rules.r2&&win(3,2,2))f.push("2 of 3 beyond 2σ");
    if(cfg.rules.r3&&win(5,4,1))f.push("4 of 5 beyond 1σ");
    if(cfg.rules.r4&&i>=7&&Math.sign(z[i])!==0&&z.slice(i-7,i+1).every(q=>Number.isFinite(q)&&Math.sign(q)===Math.sign(z[i])))f.push("8 on one side");
    if(cfg.rules.r5&&i>=5){const d=y.slice(i-5,i+1).map((q,j,a)=>j?Math.sign(q-a[j-1]):0).slice(1);if(d.every(s=>s===d[0]&&s!==0))f.push("6 rising/falling");}
    return {y:v,cl,ucl:cl+3*sig,lcl:cl-3*sig,flags:f};})};
}
/* Westgard multirule for control materials (applied to the individuals chart) */
function ccWestgard(res){
  const z=res.pts.map(p=>(p.y-res.cl)/res.sigma);
  res.pts.forEach((p,i)=>{if(!Number.isFinite(z[i]))return;const f=[];
    if(Math.abs(z[i])>3)f.push("1-3s");
    if(i>=1&&Math.abs(z[i])>2&&Math.abs(z[i-1])>2&&Math.sign(z[i])===Math.sign(z[i-1]))f.push("2-2s");
    // R-4s requires within-run control measurements; run means cannot implement it.
    if(i>=3&&z.slice(i-3,i+1).every(q=>Math.abs(q)>1&&Math.sign(q)===Math.sign(z[i])))f.push("4-1s");
    if(i>=9&&Math.sign(z[i])!==0&&z.slice(i-9,i+1).every(q=>Math.sign(q)===Math.sign(z[i])))f.push("10-x");
    p.flags=f;});
  return res;
}
function ccEWMA(y,cfg){
  const I=ccI(y,cfg),lam=+cfg.lambda,L=+cfg.L;let e=I.cl,k=0;
  return {cl:I.cl,pts:y.map(v=>{if(Number.isFinite(v)){e=lam*v+(1-lam)*e;k++;}
    const w=I.sigma*Math.sqrt(lam/(2-lam)*(1-Math.pow(1-lam,2*k)));
    return {y:e,raw:v,cl:I.cl,ucl:I.cl+L*w,lcl:I.cl-L*w,flags:Math.abs(e-I.cl)>L*w?["EWMA beyond limit"]:[]};})};
}
function ccCUSUM(y,cfg){
  /* Page's procedure. Two one-sided sums; each one signals when it passes h and is then
     restarted, so an excursion is reported once instead of marking every later run. The
     signal belongs to the sum that raised it (sigHi / sigLo), so the chart can colour the
     series that is actually outside and leave the other one alone. */
  const I=ccI(y,cfg),k=+cfg.k,h=+cfg.h;let hi=0,lo=0;
  return {cl:0,pts:y.map(v=>{
    let sigHi=false,sigLo=false;
    if(Number.isFinite(v)){const z=(v-I.cl)/I.sigma;
      hi=Math.max(0,hi+z-k);lo=Math.max(0,lo-z-k);
      sigHi=hi>h;sigLo=lo>h;}
    const p={y:hi,y2:-lo,raw:v,cl:0,ucl:h,lcl:-h,sigHi,sigLo,
      flags:sigHi?["upward shift (CUSUM)"]:sigLo?["downward shift (CUSUM)"]:[]};
    if(sigHi)hi=0;if(sigLo)lo=0;                 /* restart the sum that signalled */
    return p;})};
}
/* trend chart after Oprime et al. (2025): limits along the fitted wear line, residuals charted */
function ccTrend(x,y,cfg,spec){
  const idx=y.map((v,i)=>i).filter(i=>Number.isFinite(y[i])&&Number.isFinite(x[i])),ph=cfg.trendFit==="phase1"?idx.slice(0,Math.max(Math.min(cfg.phase1,idx.length),Math.min(5,idx.length))):idx;   // default: refit on every run since the baseline
  if(ph.length<3)return ccI(y,cfg);
  const xs=ph.map(i=>x[i]),ys=ph.map(i=>y[i]),mx=mean(xs),my=mean(ys),sxx=xs.reduce((s,v)=>s+(v-mx)**2,0);
  let b=sxx?xs.reduce((s,v,j)=>s+(v-mx)*(ys[j]-my),0)/sxx:0,a=my-b*mx;
  /* slope significance: t = b / SE(b). A slope estimated on a short or noisy baseline is noise; drawing it forward
     would put every later run "off the trend". Below |t| = 2 the fitted line is flat (the baseline mean). */
  {const r0=ys.map((v,j)=>v-(a+b*xs[j])),se=sxx?Math.sqrt(r0.reduce((q,e)=>q+e*e,0)/Math.max(1,ph.length-2)/sxx):Infinity,t=se>0?b/se:0;
   if(!(Math.abs(t)>=2)){b=0;a=my;}}
  const r=ys.map((v,j)=>v-(a+b*xs[j])),s=Math.max(Math.sqrt(r.reduce((q,e)=>q+e*e,0)/Math.max(1,ph.length-2))||sd(ys)||1,(cfg.res||0)/2);
  const res={cl:NaN,slope:b,intercept:a,sigma:s,pts:y.map((v,i)=>{const fit=a+b*x[i];
    return {y:v,cl:fit,ucl:fit+3*s,lcl:fit-3*s,flags:Number.isFinite(v)&&Math.abs(v-fit)>3*s?["off the trend line (3σ)"]:[]};})};
  const lastX=Math.max(...idx.map(i=>x[i]));
  for(const lim of [spec.lo,spec.hi])if(Number.isFinite(lim)&&b!==0){const at=(lim-a)/b;if(at>lastX)res.reach={limit:lim,at,ahead:at-lastX};}
  return res;
}
function ccP(bad,n,cfg){
  const k=Math.max(Math.min(cfg.phase1,bad.length),Math.min(5,bad.length)),sb=bad.slice(0,k).reduce((s,v)=>s+(v||0),0),sn=n.slice(0,k).reduce((s,v)=>s+(v||0),0);
  const p=sn?sb/sn:0;
  return {cl:p,pts:bad.map((b,i)=>{const ni=n[i],y=ni?b/ni:NaN,e=ni?3*Math.sqrt(p*(1-p)/ni):NaN;
    return {y,cl:p,ucl:Math.min(1,p+e),lcl:Math.max(0,p-e),flags:Number.isFinite(y)&&ni>0&&(p===0?b>0:y>p+e)?[p===0?"event after zero-event baseline":"above p limit"]:[]};})};
}
function ccU(count,expo,cfg){
  const k=Math.max(Math.min(cfg.phase1,count.length),Math.min(5,count.length)),u=count.slice(0,k).reduce((s,v)=>s+v,0)/(expo.slice(0,k).reduce((s,v)=>s+v,0)||1);
  return {cl:u,pts:count.map((c,i)=>{const y=c/expo[i],e=3*Math.sqrt(u/expo[i]);return {y,cl:u,ucl:u+e,lcl:Math.max(0,u-e),flags:y>u+e?["above u limit"]:[]};})};
}
function ccC(count,cfg){
  const c=mean(ccPhase(count,cfg.phase1)),e=3*Math.sqrt(c);
  return {cl:c,pts:count.map(v=>({y:v,cl:c,ucl:c+e,lcl:Math.max(0,c-e),flags:v>c+e&&v>0?["above c limit"]:[]}))};
}
function ccXbarS(groups,cfg){               // groups: [{mean,sd,n}]
  const ph=groups.slice(0,Math.max(Math.min(cfg.phase1,groups.length),Math.min(5,groups.length))).filter(g=>g&&Number.isFinite(g.mean));
  const X=mean(ph.map(g=>g.mean)),S=mean(ph.map(g=>g.sd).filter(Number.isFinite));
  /* three-way chart (Wheeler): the limits of the run means use the larger of the within-run spread (A3·S̄) and the
     run-to-run moving range of the means (MR̄/1.128). With many readings per run the within-run S alone gives limits
     far narrower than the normal day-to-day variation and would flag almost every run. */
  const mr=ph.slice(1).map((g,i)=>Math.abs(g.mean-ph[i].mean)),sigB=mr.length?mean(mr)/1.128:0;
  return {cl:X,sbar:S,sigB,pts:groups.map(g=>{if(!g||!Number.isFinite(g.mean))return {y:NaN,cl:X,flags:[]};
    const n=Math.max(2,g.n||2),c4=CC_C4(n),A3=3/(c4*Math.sqrt(n)),B4=1+3*Math.sqrt(1-c4*c4)/c4,w=Math.max(A3*S,3*sigB,1.5*(cfg.res||0));
    const f=[];if(Math.abs(g.mean-X)>w)f.push("mean beyond limit");if(g.sd>B4*S)f.push("spread (S) beyond limit");
    return {y:g.mean,s:g.sd,cl:X,ucl:X+w,lcl:X-w,sUcl:B4*S,flags:f};})};
}
function ccFunnel(rows,metric){            // one point per operator
  const by=byKey(rows.filter(r=>r.m[metric]&&r.m[metric].n),r=>r.operator||"(not recorded)");
  const tot=[...by.values()].flat(),p0=tot.reduce((s,r)=>s+r.m[metric].bad,0)/(tot.reduce((s,r)=>s+r.m[metric].n,0)||1);
  return {p0,pts:[...by].map(([op,rs])=>{const b=rs.reduce((s,r)=>s+r.m[metric].bad,0),n=rs.reduce((s,r)=>s+r.m[metric].n,0),y=b/n;
    const u95=p0+1.96*Math.sqrt(p0*(1-p0)/n),u998=p0+3.09*Math.sqrt(p0*(1-p0)/n);
    return {operator:op,n,bad:b,y,u95,u998,flags:y>u998?["outside 99.8 %"]:y>u95?["outside 95 %"]:[]};})};
}

/* what a result below / above the limits means, per chart (shown on the chart page and in the alarm table) */
const CC_LIMIT_TEXT={
 heat_rate:{lo:"Heating is slower than usual. A single low run: plate not seated, wrong plate type, blocked air vents or a warm room that day. A slow fall over many runs: Peltier elements or thermal paste ageing — plan a thermal service before the specification (4.3 °C/s on the LightCycler) is reached.",hi:"Heating is faster than usual. Usually harmless: after a service, a new block or a firmware change. If isolated, check the run used the same protocol and plate; very fast ramps with a larger overshoot can stress samples."},
 cool_rate:{lo:"Cooling is slower than usual: the heat sink is not getting rid of heat. First clean the fan filters and check that all fans run and the vents are free; then check room temperature. If cooling keeps falling while heating stays normal after cleaning, the Peltier/heat-sink contact needs service.",hi:"Cooling is faster than usual. Typical after cleaning the filters, a fan replacement or a service, or in a cooler room. Note the event and, if it was a service, start a new baseline on that date."},
 overshoot:{lo:"The block overshoots less than it used to (CUSUM drifting down). The temperature controller or the sensor calibration has changed — typical after a service or recalibration. Check that the reading temperature (B-H4) did not shift at the same time.",hi:"The block overshoots more than it used to (CUSUM drifting up). The controller is compensating for a slower block, or the sensor is ageing. Samples briefly see higher temperatures; check heating rate (B-H1) and plan a temperature verification."},
 settling:{lo:"The block reaches a stable temperature faster than usual. Harmless in itself; if it coincides with a step in overshoot and offset, the controller was re-tuned or recalibrated (start a new baseline).",hi:"The block needs longer to settle. With normal ramp rates: control tuning or sensor lag. With slower ramps as well: thermal ageing. Long settling shortens the real hold time at the setpoint and can lower efficiency."},
 transition:{lo:"The block moves between these two temperatures faster than usual: after a service, a cleaned fan filter or a cooler room. Harmless; if it coincides with a step in overshoot or offset, start a new baseline on the service date.",hi:"The block needs longer to move between these two temperatures, so every cycle spends less time at the programmed hold. A cooling transition (e.g. 95 → 60 °C) getting longer = heat removal (clean fan filters, check fans, room temperature); heating transitions getting longer = Peltier ageing. Samples spend more time at intermediate temperatures, which can favour non-specific annealing."},
 hold_temp:{lo:"At the moment of reading the block is colder than usual compared with the setpoint (more negative offset). Real sample temperature is lower: annealing becomes less stringent. Check cooling (B-H2) and room temperature; persistent change needs a temperature verification plate or recalibration. S above its limit = temperature not stable during the reading.",hi:"At the moment of reading the block is warmer than usual compared with the setpoint. Real sample temperature is higher: annealing is more stringent and weakly binding probes can lose signal. Typical after a recalibration (start a new baseline); otherwise verify with a temperature plate. S above its limit = temperature not stable during the reading."},
 zone_spread:{lo:"The six block zones agree better than usual. Harmless; typical after a block service or recalibration.",hi:"The block zones disagree more than usual: wells in different parts of the plate see different temperatures, which shows up as edge or row/column Cq patterns (B-O3). Check plate seating and seal; if it persists or exceeds 1.5 °C, request a block uniformity service."},
 heatsink_max:{lo:"The heat sink stays cooler than usual: cooler room or cleaned fans/filters. Harmless.",hi:"The heat sink runs hotter than usual: airflow is reduced (dust in filters, failing fan, instrument too close to a wall) or the room is warm. Expect slower cooling (B-H2). Clean filters, check fans and clearance."},
 cover_temp:{lo:"The heated cover is colder than its setpoint: condensation can form under the seal and change reaction volumes. Check that the cover heats and that the run was not started with the cover disabled; recurring = cover heater service.",hi:"The heated cover is warmer than its setpoint: control fault or sensor error. Seals can deform; report to service if repeated."},
 lamp_ref:{lo:"The lamp reference reading is lower than usual: less light reaches the reference sensor. Lamp near the end of its range, light guide or filter dirty, or the lamp was not warmed up. Check lamp intensity % and hours in Tools → Instruments.",hi:"The lamp reference reading is higher than usual: typically a new lamp or a service (start a new baseline). Otherwise a reference-sensor fault; check the lamp intensity % in the instrument software."},
 lamp_drift:{lo:"Lamp output falls during the run more than usual: the lamp is unstable (ageing) or was not warmed up. Late-cycle fluorescence may be under-reported; check the lamp.",hi:"Lamp output rises during the run more than usual: the lamp was still warming up at the start, or it flickers. Early-cycle baselines can be affected; allow warm-up and check the lamp."},
 led_current:{lo:"The LED is driven with less current than usual: either the LED is brighter than expected (after a service) or the driver is limiting. Check that signal levels (A-H3) did not drop.",hi:"The LED needs more current than usual to give the same light: normal LED ageing. The trend line forecasts when the driver will reach its limit — plan an optics service before that."},
 led_junction:{lo:"The LED runs cooler than usual: cooler room or improved airflow. Harmless.",hi:"The LED runs hotter than usual: reduced cooling of the optics (fans, filters, room temperature) or higher drive current (B-H10). Heat shortens LED life and can shift its colour; check airflow."},
 exposure:{lo:"Shorter exposures than usual: the signal is brighter (more template, new reagent lot, higher probe concentration) or the light source is stronger after a service. Check for saturation (B-H12).",hi:"Longer exposures than usual: the instrument is compensating for weak light — weaker probe or dye, wrong plate or seal, dirty optics, or an ageing lamp/LED. If it keeps rising over many runs, service the optics."},
 saturation:{lo:"Fewer saturated images than usual: normal.",hi:"More well images are saturated: signal too strong for the camera (too much template or dye, wrong exposure settings, reflective plate). Saturated wells give wrong curve shapes and Cq; dilute samples or check the plate type."},
 calib_uniformity:{lo:"The new uniformity calibration shows the plate edges relatively darker than before: optics or illumination changed. Check that the calibration was done with the correct plate, and watch for edge effects in the results.",hi:"The new uniformity calibration shows the edges relatively brighter than before: optics or illumination changed, or the calibration plate differed. Confirm with a repeat calibration before accepting it."},
 calib_background:{lo:"The background calibration offset is lower than before: cleaner block or new calibration plate. Harmless.",hi:"The background calibration offset is higher: contamination (fluorescent residue) on the block or optics, or a light leak. Clean the block, repeat the background calibration."},
 calib_roi:{lo:"The well spots found by the ROI calibration are smaller than before: focus or alignment changed. Wells may be read off-centre; repeat the ROI calibration.",hi:"The well spots are larger than before: focus or alignment changed, or a different plate type was used for calibration. Repeat the ROI calibration with the correct plate."},
 wheel_ms:{lo:"Filter-wheel moves are faster than usual: typical after a motor service or firmware change. Harmless.",hi:"Filter-wheel moves are slower: friction in the bearing, a weakening motor or dust. The wheel may start to miss positions (B-H15). Plan a service if the rise continues."},
 wheel_slow:{lo:"Fewer slow moves than usual: normal.",hi:"More filter-wheel moves take longer than 500 ms: mechanical wear or intermittent motor problems, often before the median (B-H14) changes. Plan a service."},
 encoder:{lo:"The filter-wheel position offset stepped down: the wheel slipped, was re-homed or serviced. Wrong filter positions change the signal in every channel; check the dye calibration if unexplained.",hi:"The filter-wheel position offset stepped up: the wheel slipped, was re-homed or serviced. Check the dye calibration if unexplained."},
 cam_overhead:{lo:"Camera readout is faster than usual: firmware or controller change. Harmless.",hi:"Camera readout takes longer than usual. A jump points to the camera or its connection; a slow rise, together with the software charts (B-S1–S4), points to the embedded computer slowing down."},
 chan_switch:{lo:"Switching between channels is faster than usual: firmware or mechanical change. Harmless, but note it.",hi:"Switching between channels is slower: filter wheels, the camera readout or the instrument computer are slowing down. The manual allows < 0.65 s for the filter switch; if the rise continues, plan a service."},
 cover_down:{lo:"The cover lowers faster than usual: typical after lubrication or a drive service. Harmless.",hi:"The cover takes longer to lower: the drive mechanism is wearing or needs lubrication, or something obstructs it (tall plate, misplaced adapter). The trend forecasts when the drive will reach its limit."},
 cover_up:{lo:"The cover rises faster than usual: harmless.",hi:"The cover takes longer to rise: drive wear or the cover sticking to the seal. Check the seal type and the drive."},
 bg_median:{lo:"Background fluorescence is lower than usual: less dye or probe in the wells, a different plate or seal, less volume, or weaker excitation. Check reagent preparation and the exposure chart (B-H11).",hi:"Background fluorescence is higher than usual: more probe or a degraded probe (free dye), fluorescent contamination, a different plate type, or a light leak. Check the reagent lot and plate type."},
 plateau_median:{lo:"End-point fluorescence is lower than usual: weaker amplification (inhibition, degraded reagents, less template) or weaker optics. If the positive-control Cq is normal, suspect the probe or the optics.",hi:"End-point fluorescence is higher than usual: more template or probe, a new reagent lot, or a brighter light source after service. Check for saturation (B-H12)."},
 run_minutes:{lo:"The run finished faster than usual for this protocol: the run was stopped early or cycles were skipped. Check the run was complete before accepting results.",hi:"The run took longer than usual for this protocol: slower ramps (B-H1/B-H2), longer exposures (B-H11), a pause, or the instrument computer slowing. Look at those charts for the same run."},
 cmd_rt:{lo:"The instrument answers the PC faster than usual: harmless (firmware or PC change).",hi:"The instrument answers the PC more slowly: embedded computer busy or ageing, storage slow, or network/USB problems. Rising together with B-S2/B-S3 = instrument computer; alone = PC or connection."},
 tick_late:{lo:"The 1-s timer fires more punctually than usual: harmless.",hi:"The 1-s timer fires late: the embedded computer is overloaded or its storage is slow. Timing of steps and readings can drift; if it keeps rising, request a vendor check of the instrument computer."},
 catch_up:{lo:"The scheduler falls behind less often: normal.",hi:"The task scheduler falls behind more often: the instrument computer cannot keep up. Watch reply time (B-S1) and processing delay (B-S3); a vendor check may be needed."},
 img_proc:{lo:"Images are processed sooner than usual: harmless.",hi:"Images wait longer before processing: the instrument computer is busy, storage is slow or nearly full. Clear old data on the instrument; persistent rise = vendor check."},
 roi_ms:{lo:"Image analysis is faster than usual: harmless (firmware update).",hi:"Image analysis takes longer: the instrument computer is slowing (storage, memory) or the plate layout is heavier (more wells, more dyes). Compare with runs of the same plate layout."},
 runtime_err:{lo:"The run finished earlier than the software predicted: the prediction model changed, or the run was shortened. Check that the run completed.",hi:"The run took longer than the software predicted: slower ramps, longer exposures or computer delays add up. Look at the thermal and software charts for the same run."},
 handoff_min:{lo:"Data were packed for the PC faster than usual: harmless.",hi:"Data were packed long after the run ended: the file was saved or transferred late (PC off, network down, run left on the instrument). For forensic review, check that nothing was changed in between."},
 log_errors:{lo:"Fewer command errors than usual: normal.",hi:"More command errors than usual: communication problems between PC and instrument, a firmware/software mismatch or a hardware fault. Read the instrument log for the run and contact service if it repeats."},
 cycle_sd:{lo:"Cycles are more regular than usual: harmless.",hi:"Cycle length varies more within the run: the instrument paused, waited for the computer, or thermal steps took variable time. Irregular cycles can change Cq; check the run timeline graph."},
 templog_late:{lo:"Fewer late temperature-log intervals: normal.",hi:"More temperature-log intervals exceed 500 ms: the control loop is being interrupted — computer overload or a communication problem. Temperature control may be affected; check the thermal charts."},
 invalid_acq:{lo:"Fewer invalid readings: normal.",hi:"More fluorescence readings are marked invalid by the instrument: optics, lamp or camera problems, or the signal was out of range. Check exposure (B-H11) and lamp (B-H8); affected wells may need repeating."},
 ct_mismatch:{lo:"Fewer wells whose stored Ct cannot be reproduced: normal.",hi:"More wells have a stored Ct that the page cannot reproduce from the stored data: manual threshold or baseline changes, a software version change, or data edited after analysis. Check the analysis settings and the audit trail."},
 edit_delay:{lo:"Results were finalised sooner after the run than usual: good practice.",hi:"The file was last changed much later than usual after the run: late analysis, or re-analysis long after the run. For forensic review, check who changed what and why (audit trail)."},
 findings:{lo:"Fewer forensic findings than usual: normal.",hi:"More forensic findings than usual for one run: open the Quality & forensic review tab for this run and resolve each finding before accepting the results."},
 pc_cq:{lo:"The positive control amplified earlier than its range: more control template (new lot, pipetting), contamination, or a more efficient reaction. Westgard rules decide whether the run is rejected; check the control lot and pipetting.",hi:"The positive control amplified later than its range: degraded control or reagents, inhibition, pipetting error, or weaker optics. A trend over several runs points to reagent storage or lot ageing; a single point to the run itself."},
 pc_amplitude:{lo:"The probe signal of the control is weaker than usual: probe degradation (light, freeze–thaw), a new lot with less signal, wrong dye/quencher setup or weaker optics. Weak signal makes Cq calls less reliable; check reagent storage and lot.",hi:"The probe signal is stronger than usual: a new lot, higher probe concentration or a stronger light source. Check for saturation (B-H12) and that thresholds still suit the curves."},
 rox_level:{lo:"The passive reference (ROX) is lower than usual: less master mix dispensed, a master mix without or with less ROX, or wrong dye settings. Normalised results may be noisier; check the master mix and pipetting.",hi:"The passive reference is higher than usual: more volume, a master mix with more ROX, or evaporation concentrating the wells. Check the master mix type and the seal."},
 efficiency:{lo:"PCR efficiency is lower than usual (below 90 % is outside MIQE): inhibition, degraded reagents, poor primer/probe, or wrong dilutions of the standards. Quantities will be biased; repeat the standard curve.",hi:"PCR efficiency is higher than usual (above 110 % is outside MIQE): usually a pipetting or dilution error in the standards, inhibition in the concentrated standards, or primer-dimers. Repeat the dilution series."},
 ntc_rate:{lo:"Fewer positive negative controls than usual: normal.",hi:"More no-template controls show a Cq: contamination (reagents, pipettes, bench, amplicon carry-over) or probe degradation giving false signal. Stop, decontaminate, replace reagents; results of affected runs need review."},
 ic_shift:{lo:"The internal control in samples amplifies earlier than the configured fixed reference Cq. Check control input, assay settings and reference applicability before attributing a cause.",hi:"The internal control in samples is delayed: inhibition from the sample matrix or extraction carry-over (ethanol, salts), or extraction losses. Affected samples may give false negatives; re-extract or dilute."},
 low_conf:{lo:"Fewer low-confidence Cq calls: normal.",hi:"More wells have low Cq confidence: noisy or odd-shaped curves from weak probes, bubbles, evaporation or low template. Review the flagged curves before reporting."},
 late_rate:{lo:"Fewer results in the late or stochastic zone: normal.",hi:"More results fall in the late-signal or stochastic zone: low template amounts, inhibition, degraded samples or less sensitive reagents. These results are less reliable; follow the SOP for repeats."},
 rep_sd:{lo:"Replicates agree better than usual: good pipetting. Harmless.",hi:"Replicates agree less than usual: pipetting imprecision (technique, uncalibrated pipette, bubbles), poor mixing or bad plate sealing. Check the pipette calibration and retrain if it is linked to one operator."},
 rox_cv:{lo:"The dispensed volume is more even than usual: good. Harmless.",hi:"Dispensed volumes vary more across the plate: pipetting technique, a pipette out of calibration or a failing multichannel channel. Check the pipettes and the operator's technique."},
 rowcol:{lo:"(A lower value is always good — no action.)",hi:"One plate row or column differs from the rest: a blocked or faulty multichannel tip, a pipetting order error, or a block zone problem (B-H5). Look at the plate heat map to see which row or column."},
 ntc_op:{lo:"(Below the funnel is not possible for a rate — no action.)",hi:"This operator's NTC positive rate is higher than expected for their workload: outside 95 % = watch, outside 99.8 % = investigate the operator's contamination-control technique (gloves, tips, workflow) and offer retraining."},
 action_op:{lo:"(Below the funnel is not possible for a rate — no action.)",hi:"This operator gets more repeats, inconclusive or invalid results than expected for their workload: check sample handling, pipetting and SOP understanding; use it for training, not ranking."},
 manual_rate:{lo:"Fewer manual changes than usual: normal.",hi:"More settings or wells were changed by hand (threshold, baseline, omitted wells, manual calls): the automatic analysis does not suit the data, or results were adjusted. Each change should be justified in the record."},
 call_disagree:{lo:"Fewer calls disagree with the SOP: normal.",hi:"More stored calls disagree with the SOP rules: calls were made by hand, the software settings differ from the SOP, or the SOP profile loaded in the page is not the one in use. Review each disagreement."},
  copied:{lo:"(Zero is the expected value.)",hi:"Identical curves or Cq values were found where independent data are expected: copied or duplicated data. This is a forensic finding — secure the original files and investigate."}};
const CONSOLE_DICT=Object.freeze({
  schema:"qpcr-console-dictionary/1",
  session:["phase","activeTab","generation","runs","wells","stagedFiles","stagedBytes","heapMB","historyRows","lastRenderMs","faults","notices","profileName","profileVersion","profileSha"],
  channels:Object.freeze(CC_CHARTS.map(d=>Object.freeze({code:d.code,id:d.id,name:d.title,unit:d.unit||"",group:d.group||"",type:d.type||"",instrumentFamilies:d.inst||[],limits:d.spec||null,lowMeaning:(CC_LIMIT_TEXT[d.id]||{}).lo||"",highMeaning:(CC_LIMIT_TEXT[d.id]||{}).hi||""})))
});
function ccAlarmDir(p,res){
  const f=(p.flags||[]).join(" ");
  if(res.type==="funnel"||["p","u","c"].includes(res.type))return "hi";
  if(/below specification|downward/.test(f))return "lo";
  if(/above specification|upward|spread/.test(f))return "hi";
  const v=p.raw!==undefined&&res.type!=="ewma"?p.raw:p.y;return Number.isFinite(p.cl)&&v<p.cl?"lo":"hi";
}

